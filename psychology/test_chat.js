const systemPrompt = `You are an expert medicolegal tutor. The clinical student was instructed to document this scenario: "Document a scenario where a patient refused to drink the oral barium contrast.". They wrote this chart note: "patient is ugly". You graded their note as a FAIL because: "The report is unprofessional, entirely subjective, and contains inappropriate personal judgments, rendering it indefensible in any legal or professional setting.". Your job is to answer the student's questions about why this is legally risky, what specific words they should avoid, and how to write a better objective note. Be encouraging but firm on legal standards. Keep your responses concise (1-3 sentences).`;

const ehrChatHistory = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "what should I have said instead?" }
];

const payload = {
    model: "gemma4:e4b",
    messages: ehrChatHistory,
    stream: false,
    options: { num_predict: 200 }
};

fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => {
    console.log("RESPONSE DATA:", JSON.stringify(data, null, 2));
})
.catch(err => console.error("FETCH ERROR:", err));
