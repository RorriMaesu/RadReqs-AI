import urllib.request
import csv
import json
import time
import re
from html.parser import HTMLParser
from collections import Counter

try:
    from openai import OpenAI
except ImportError:
    print("Please install the OpenAI SDK: pip install openai")
    exit(1)

# ==========================================
# CONFIGURATION: LOCAL LLM
# ==========================================
LOCAL_BASE_URL = "http://localhost:11434/v1"  # Change to http://localhost:1234/v1 for LM Studio
API_KEY        = "ollama"
MODEL_NAME     = "gemma4:e4b"

client = OpenAI(base_url=LOCAL_BASE_URL, api_key=API_KEY)

# ==========================================
# SUPPLEMENTAL DATA  (curated teaching essentials)
# These guarantee coverage of critical terms absent from scraped sources.
# The dedup pipeline will silently skip any that already appear upstream.
# ==========================================
SUPPLEMENT_PREFIXES = [
    ("a",       "not, without, less"),
    ("an",      "not, without, less (before vowels)"),
    ("ab",      "away from, departing from"),
    ("ad",      "toward, near, in the direction of"),
    ("ambi",    "both, on both sides, around"),
    ("bi",      "two, double, both"),
    ("contra",  "against, opposite, counter"),
    ("de",      "from, down from, removal, reversing"),
    ("ec",      "out, outside, away from"),
    ("eu",      "good, normal, well, true"),
    ("in",      "in, into; not, without"),
    ("ipsi",    "same side"),
    ("iso",     "equal, same, alike"),
    ("peri",    "around, surrounding, near"),
    ("re",      "again, back, backward"),
]

SUPPLEMENT_SUFFIXES = [
    ("ia",       "condition, state of, disease"),
    ("ic",       "pertaining to, of the nature of"),
    ("al",       "pertaining to, relating to"),
    ("ac",       "pertaining to"),
    ("ous",      "pertaining to, full of, characterized by"),
    ("eal",      "pertaining to"),
    ("phasia",   "speech, speaking"),
    ("philia",   "attraction to, affinity for"),
    ("phylaxis", "protection, prevention"),
    ("cide",     "killing, destroying"),
    ("clast",    "one that breaks, breaking"),
    ("crit",     "to separate"),
    ("kinesia",  "movement, motion"),
    ("kinesis",  "movement, motion"),
    ("mania",    "obsessive preoccupation, madness"),
    ("version",  "act of turning"),
    ("logist",   "specialist in the study of"),
]

SUPPLEMENT_ROOTS = {
    # Endocrine  (was critically sparse — only 5 roots)
    "hypophysis":  "pituitary gland",
    "pituitari":   "pituitary gland",
    "pineal":      "pineal gland",
    "insulin":     "insulin (pancreatic hormone)",
    "dips":        "thirst",
    "crin":        "to secrete, secretion",
    "cortic":      "outer layer, cortex (adrenal)",
    # Cardiovascular  (was 14)
    "aort":        "aorta (great artery from the heart)",
    "coron":       "crown, coronary vessels",
    "sphygm":      "pulse",
    "varic":       "dilated, twisted vein, varicose",
    "valv":        "valve",
    "pericard":    "pericardium (sac surrounding the heart)",
    "capillar":    "capillary (smallest blood vessel)",
    # Nervous  (was 14)
    "gangli":      "ganglion (mass of nerve tissue)",
    "hypn":        "sleep",
    "narc":        "numbness, stupor, deep sleep",
    "somn":        "sleep",
    "concuss":     "concussion, violent shaking",
    "lex":         "word, reading",
    # Blood / Immune  (was 14)
    "coagul":      "coagulation, clotting",
    "ser":         "serum, watery fluid",
    "plasm":       "plasma, formative substance",
    # Integumentary  (was 12)
    "ungu":        "nail (fingernail or toenail)",
    "ichthy":      "scaly, fish-like skin",
    "pach":        "thick",
    # Urinary  (was 17)
    "cali":        "calyx, cup-shaped structure in kidney",
    "azot":        "nitrogen, nitrogenous waste",
    # Musculoskeletal  (was 31)
    "ankyl":       "bent, stiff, fused, crooked",
    "dactyl":      "finger, toe, digit",
    "aponeur":     "aponeurosis (broad flat tendon)",
    # Digestive
    "amyl":        "starch",
    # General / Foundations
    "ambul":       "to walk, walking",
    "anthrop":     "human being, humanity",
    "caus":        "burning, caustic",
    "esthes":      "sensation, feeling, perception",
    "ger":         "old age, elderly",
    "morb":        "disease, illness, morbid",
    "nata":        "birth",
    "son":         "sound",
    "zo":          "animal life, living organism",
}

# ==========================================
# NORMALISATION HELPER
# ==========================================
def normalize_key(term):
    """Return a lowercase, letter-only key for deduplication.
    Strips combining-vowel slash notation and iteratively strips terminal
    combining vowels so that 'cardi', 'cardio', and 'cardi/o' all map
    to the same key, preventing duplicate root entries."""
    t = term.lower().strip()
    t = t.lstrip('-\u2013\u2014').rstrip('-')   # strip leading / trailing dashes
    t = re.sub(r'/.*$', '', t)                    # strip /vowel  (e.g. /o, /i)
    t = re.sub(r'[^a-z]', '', t)                  # letters only
    # Iteratively strip terminal combining vowels while len >= 4
    # 'cardi' → 'card', 'cardio' → 'cardi' → 'card', 'cardi/o' → 'cardi' → 'card'
    while len(t) >= 4 and t[-1] in 'oiae':
        t = t[:-1]
    return t

# ==========================================
# FETCH FUNCTIONS
# ==========================================
URL_PREFIX = "https://raw.githubusercontent.com/NadiaSaeed/MedTCS/master/MedTCS-prefix.csv"
URL_SUFFIX = "https://raw.githubusercontent.com/NadiaSaeed/MedTCS/master/MedTCS-suffix.csv"
URL_ROOT   = "https://raw.githubusercontent.com/NadiaSaeed/MedTCS/master/MedTCS-root.csv"
URL_WIKI   = ("https://en.wiktionary.org/wiki/"
              "Appendix:Medical_prefixes,_suffixes,_and_combining_forms")

def download_csv(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        content = resp.read().decode('utf-8')
        reader  = csv.reader(content.splitlines(), delimiter='\t')
        return [row for row in reader if len(row) >= 2]


class _WikiTableParser(HTMLParser):
    """Extracts (term_cell, meaning_cell) pairs from Wiktionary wikitable rows."""
    def __init__(self):
        super().__init__()
        self.entries   = []
        self._in_wiki  = False
        self._in_td    = False
        self._row      = []
        self._buf      = ""

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        # Data tables use cellspacing="1" (NOT wikitable class — that's just the ToC)
        if tag == 'table' and d.get('cellspacing') == '1':
            self._in_wiki = True
        if self._in_wiki and tag == 'tr':
            self._row = []
        if self._in_wiki and tag == 'td':
            self._in_td = True
            self._buf   = ""

    def handle_endtag(self, tag):
        if tag == 'table':
            self._in_wiki = False
        if self._in_wiki and tag == 'td':
            self._in_td = False
            self._row.append(self._buf.strip())
        if self._in_wiki and tag == 'tr' and len(self._row) >= 2:
            self.entries.append((self._row[0], self._row[1]))
            self._row = []

    def handle_data(self, data):
        if self._in_td:
            self._buf += data


def download_wiktionary():
    """Parse the Wiktionary medical terminology appendix (~500 entries).
    Returns (prefixes, suffixes, roots) as [clean_term, meaning] lists.
    Falls back gracefully on any network or parse error."""
    print(f"  Wiktionary appendix...")
    try:
        req = urllib.request.Request(URL_WIKI, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode('utf-8')
    except Exception as exc:
        print(f"  WARNING: Wiktionary fetch failed ({exc}). Skipping.")
        return [], [], []

    parser = _WikiTableParser()
    parser.feed(html)

    prefixes, suffixes, roots = [], [], []
    seen = set()

    for raw_term, meaning in parser.entries:
        # Strip footnote references like [1]
        meaning = re.sub(r'\[\d+\]', '', meaning).strip()
        if not meaning:
            continue

        # Split multi-variant cells: "a-, an-" → ["a-", "an-"]
        variants = [v.strip() for v in re.split(r',\s*(?=[a-zA-Z\-])', raw_term)]

        for term in variants:
            # Strip parenthetical notes: "brady- (rare: brachy-)" → "brady-"
            term = re.sub(r'\s*\(.*?\)', '', term).strip()
            # Strip footnote refs from the term itself
            term = re.sub(r'\[\d+\]', '', term).strip()
            if not term or term.lower() in seen:
                continue
            seen.add(term.lower())

            # Classify by punctuation position
            if re.match(r'^[-\u2013\u2014]', term):       # starts with dash → suffix
                clean = re.sub(r'^[-\u2013\u2014]+', '', term)
                if clean:
                    suffixes.append([clean, meaning])
            elif term.endswith('-'):                        # ends with dash → prefix
                clean = term.rstrip('-')
                if clean:
                    prefixes.append([clean, meaning])
            elif '/' in term:                               # slash notation → combining form (root)
                clean = re.sub(r'/.*', '', term).strip('-')
                if clean:
                    roots.append([clean, meaning])
            elif re.match(r'^[a-zA-Z]+$', term):           # bare word → root candidate
                roots.append([term, meaning])

    print(f"  Wiktionary: {len(prefixes)} prefixes, {len(suffixes)} suffixes, {len(roots)} combining forms.")
    return prefixes, suffixes, roots


# ==========================================
# DOWNLOAD ALL SOURCES
# ==========================================
print("=" * 60)
print("STEP 1 — Downloading sources")
print("=" * 60)
print("  MedTCS datasets...")
prefixes_raw = download_csv(URL_PREFIX)
suffixes_raw = download_csv(URL_SUFFIX)
roots_raw    = download_csv(URL_ROOT)
print(f"  MedTCS: {len(prefixes_raw)} prefixes, {len(suffixes_raw)} suffixes, {len(roots_raw)} roots.")

wiki_pref, wiki_suff, wiki_root = download_wiktionary()

# ==========================================
# MERGE & DEDUPLICATE — PREFIXES
# ==========================================
print("\nSTEP 2 — Merging & deduplicating prefixes")
prefix_map = {}   # normalize_key → (clean_term, meaning)

def add_prefix(clean, meaning):
    k = normalize_key(clean)
    if k and k not in prefix_map:
        prefix_map[k] = (clean.strip(), meaning.strip())

for row in prefixes_raw:
    add_prefix(row[0], row[1])
for row in wiki_pref:
    add_prefix(row[0], row[1])
for clean, meaning in SUPPLEMENT_PREFIXES:
    add_prefix(clean, meaning)

print(f"  {len(prefix_map)} unique prefixes  "
      f"(MedTCS {len(prefixes_raw)} + Wiki {len(wiki_pref)} + supplement {len(SUPPLEMENT_PREFIXES)})")

# ==========================================
# MERGE & DEDUPLICATE — SUFFIXES
# ==========================================
print("\nSTEP 3 — Merging & deduplicating suffixes")
suffix_map = {}   # normalize_key → (clean_term, meaning)

def add_suffix(clean, meaning):
    k = normalize_key(clean)
    if k and k not in suffix_map:
        suffix_map[k] = (clean.strip(), meaning.strip())

for row in suffixes_raw:
    add_suffix(row[0], row[1])
for row in wiki_suff:
    add_suffix(row[0], row[1])
for clean, meaning in SUPPLEMENT_SUFFIXES:
    add_suffix(clean, meaning)

print(f"  {len(suffix_map)} unique suffixes  "
      f"(MedTCS {len(suffixes_raw)} + Wiki {len(wiki_suff)} + supplement {len(SUPPLEMENT_SUFFIXES)})")

# ==========================================
# MERGE & DEDUPLICATE — ROOTS
# ==========================================
print("\nSTEP 4 — Merging & deduplicating roots")

root_map       = {}   # normalize_key → meaning  (for post-AI meaning lookup)
roots_for_ai   = []   # ordered unique roots to send for enrichment
seen_root_keys = set()

def add_root(term, meaning):
    k = normalize_key(term)
    if k and k not in seen_root_keys:
        seen_root_keys.add(k)
        root_map[k] = meaning.strip()
        roots_for_ai.append({"term": term.strip(), "meaning": meaning.strip()})

for row in roots_raw:
    add_root(row[0], row[1])
for row in wiki_root:
    add_root(row[0], row[1])
for term, meaning in SUPPLEMENT_ROOTS.items():
    add_root(term, meaning)

print(f"  {len(roots_for_ai)} unique roots for AI enrichment  "
      f"(MedTCS {len(roots_raw)} + Wiki {len(wiki_root)} + supplement {len(SUPPLEMENT_ROOTS)})")

# ==========================================
# BUILD PREFIX & SUFFIX ENTRIES  (no AI needed)
# ==========================================
print("\nSTEP 5 — Building prefix/suffix flash-card entries")
final_data = []
id_counter  = 1

for _k, (clean, meaning) in prefix_map.items():
    final_data.append({
        'id':       f'gen_{id_counter}',
        'term':     clean + '-',
        'type':     'prefix',
        'meaning':  meaning,
        'system':   'Prefixes',
        'interval': 0,
        'clean':    clean,
    })
    id_counter += 1

for _k, (clean, meaning) in suffix_map.items():
    final_data.append({
        'id':       f'gen_{id_counter}',
        'term':     '-' + clean,
        'type':     'suffix',
        'meaning':  meaning,
        'system':   'Suffixes',
        'interval': 0,
        'clean':    clean,
    })
    id_counter += 1

print(f"  {len(final_data)} prefix/suffix entries ready.")

# ==========================================
# AI ENRICHMENT: ROOTS
# ==========================================
print(f"\nSTEP 6 — AI enrichment of {len(roots_for_ai)} roots via {MODEL_NAME}")
print("=" * 60)

SYSTEM_INSTRUCTION = """You are a master medical lexicographer. I will provide a JSON array of raw medical roots and their meanings.
For each root return a JSON object with EXACTLY these four fields:
1. "cleanTerm"  — copy the original term I gave you, exactly as provided.
2. "rootBase"   — the root stripped of its combining vowel (e.g. "cardi" from "cardio", "abdomin" from "abdomin").
3. "vowel"      — the correct combining vowel, usually "o", sometimes "i" or "a".
4. "system"     — classify into EXACTLY one value from this list:
   ["Cardiovascular","Digestive","Respiratory","Nervous","Musculoskeletal","Integumentary",
    "Endocrine","Urinary","Reproductive","Blood/Immune","Special Senses","Foundations"]

ENDOCRINE EXAMPLES — these MUST be classified as Endocrine (not Foundations):
  hypophysis=Endocrine, pituitari=Endocrine, pineal=Endocrine, insulin=Endocrine,
  dips=Endocrine, crin=Endocrine, thyr=Endocrine, adren=Endocrine, cortic=Endocrine,
  gonad=Endocrine, thym=Endocrine, pancreat (hormone context)=Endocrine

CRITICAL: Reply ONLY with a valid JSON array — no markdown fences, no commentary.
"""

BATCH_SIZE  = 25
MAX_RETRIES = 3

for i in range(0, len(roots_for_ai), BATCH_SIZE):
    batch         = roots_for_ai[i : i + BATCH_SIZE]
    response_text = ""
    print(f"Batch {i+1}–{i+len(batch)} / {len(roots_for_ai)}...")

    attempt = 0
    while attempt < MAX_RETRIES:
        attempt += 1
        print(f"  Attempt {attempt}/{MAX_RETRIES}...")
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": SYSTEM_INSTRUCTION},
                    {"role": "user",   "content": json.dumps(batch, indent=2)},
                ],
                temperature=0.1,
            )
            response_text = response.choices[0].message.content.strip()

            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)

            enriched = json.loads(response_text)

            for item in enriched:
                vowel    = item.get('vowel',    'o')
                rootBase = item.get('rootBase', item.get('cleanTerm', ''))
                lookup   = normalize_key(item.get('cleanTerm', ''))
                meaning  = root_map.get(lookup, 'Unknown')

                final_data.append({
                    'id':       f'gen_{id_counter}',
                    'term':     f'{rootBase}/{vowel}',
                    'type':     'root',
                    'meaning':  meaning,
                    'system':   item.get('system', 'Foundations'),
                    'interval': 0,
                    'rootBase': rootBase,
                    'vowel':    vowel,
                })
                id_counter += 1

            break  # success — move to next batch

        except Exception as exc:
            print(f"  ERROR on attempt {attempt}: {exc}")
            print("  --- RAW LLM RESPONSE ---")
            print(response_text or "(unavailable — error before LLM responded)")
            print("  --- END ---")
            if attempt < MAX_RETRIES:
                print("  Waiting 5 s before retry...")
                time.sleep(5)
            else:
                print(f"  All {MAX_RETRIES} attempts failed — skipping this batch.")

    time.sleep(1)

# ==========================================
# WRITE FINAL JS FILE
# ==========================================
output_path = "data.js"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('const dictionary = ' + json.dumps(final_data, indent=4) + ';\n')

type_counts = Counter(d['type']   for d in final_data)
sys_counts  = Counter(d['system'] for d in final_data if d['type'] == 'root')

print("\n" + "=" * 60)
print(f"COMPLETE — {len(final_data)} terms written to {output_path}")
print(f"  Prefixes : {type_counts['prefix']}")
print(f"  Suffixes : {type_counts['suffix']}")
print(f"  Roots    : {type_counts['root']}")
print("\nRoot coverage by system:")
for sys_name, cnt in sorted(sys_counts.items(), key=lambda x: -x[1]):
    print(f"  {sys_name:<24} {cnt}")
print("=" * 60)
