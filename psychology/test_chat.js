const systemPrompt = `You are an expert medicolegal tutor. The clinical student was instructed to document this scenario: "Document a scenario where a patient refused to drink the oral barium contrast.". They wrote this chart note: "patient is ugly". You graded their note as a FAIL because: "The report is unprofessional, entirely subjective, and contains inappropriate personal judgments, rendering it indefensible in any legal or professional setting.". Your job is to answer the student's questions about why this is legally risky, what specific words they should avoid, and how to write a better objective note. Be encouraging but firm on legal standards. Keep your responses concise (1-3 sentences).`;

const ehrChatHistory = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "what should I have said instead?" }
];

if (!window.GnosysLLM || typeof window.GnosysLLM.generateResponse !== 'function') {
    console.error('GnosysLLM is unavailable in this context.');
} else {
    const systemMessage = ehrChatHistory.find((entry) => entry.role === 'system');
    const nonSystem = ehrChatHistory.filter((entry) => entry.role !== 'system');
    const userEntry = nonSystem[nonSystem.length - 1] || { role: 'user', content: '' };
    const history = nonSystem.slice(0, -1);

    window.GnosysLLM.generateResponse(systemMessage?.content || '', userEntry.content || '', {
        moduleKey: 'psych_llm',
        model: 'gemma4:e4b',
        history,
        stream: false,
    })
    .then((result) => {
        console.log("RESPONSE DATA:", JSON.stringify({ text: result?.text || '' }, null, 2));
    })
    .catch((err) => console.error("FETCH ERROR:", err));
}
