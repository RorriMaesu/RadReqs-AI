window.MathTutor = (() => {
    // Use marked if available, but protect math blocks first!
    const parseMD = (text) => {
        // 1. Extract math blocks so markdown doesn't mangle underscores/asterisks inside them
        const mathBlocks = [];
        let processedText = text.replace(/(\$\$[\s\S]*?\$\$|\$(?:\\.|[^$])*\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g, (match) => {
            mathBlocks.push(match);
            return `@@MATH_BLOCK_${mathBlocks.length - 1}@@`;
        });

        // 2. Parse Markdown
        let html = '';
        if (window.marked && window.marked.parse) {
            html = window.marked.parse(processedText, { breaks: true });
        } else {
            html = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/\n/g, '<br>');
        }

        // 3. Restore Math Blocks
        html = html.replace(/@@MATH_BLOCK_(\d+)@@/g, (match, p1) => {
            return mathBlocks[p1];
        });

        return html;
    };

    // Helper to safely render KaTeX if available
    const renderMath = (text) => {
        if (window.katex && window.renderMathInElement) {
            const temp = document.createElement('div');
            temp.innerHTML = text;
            try {
                window.renderMathInElement(temp, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
                return temp.innerHTML;
            } catch (e) {
                return text;
            }
        }
        return text;
    };

    function appendInlineBubble(msgsEl, role, text) {
        const wrap = document.createElement("div");
        const bubble = document.createElement("div");
        
        // Use clinical-blue colors instead of violet
        if (role === "user") {
            wrap.className = "flex justify-end";
            bubble.className = "max-w-[80%] bg-clinical-blue text-white px-3 py-2 rounded-2xl rounded-tr-sm text-xs font-medium";
            bubble.innerHTML = renderMath(parseMD(text));
        } else {
            wrap.className = "flex justify-start";
            bubble.className = "max-w-[85%] bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm text-xs font-medium text-gray-800";
            if(text) bubble.innerHTML = renderMath(parseMD(text));
        }
        wrap.appendChild(bubble);
        msgsEl.appendChild(wrap);
        msgsEl.scrollTop = msgsEl.scrollHeight;
        return bubble;
    }

    async function streamOllama(msgsEl, chatHistory) {
        const typingWrap = document.createElement("div");
        typingWrap.className = "flex justify-start inline-typing";
        typingWrap.innerHTML = `<div class="bg-gray-100 px-3 py-2 rounded-2xl flex items-center space-x-1 border border-gray-200 mt-1"><div class="w-1.5 h-1.5 bg-clinical-blue rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-clinical-blue rounded-full animate-bounce" style="animation-delay: 0.15s"></div><div class="w-1.5 h-1.5 bg-clinical-blue rounded-full animate-bounce" style="animation-delay: 0.3s"></div></div>`;
        msgsEl.appendChild(typingWrap);
        msgsEl.scrollTop = msgsEl.scrollHeight;

        let payload = [
            { role: "system", content: "You are an expert Clinical Math Tutor for radiologic and dosimetry students. Be encouraging, precise, and concise. Explain step by step where the student went wrong or how to set up the problem, but never just give the final numerical answer." }, 
            ...chatHistory
        ];
        
        try {
            const response = await fetch("http://localhost:11434/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: localStorage.getItem("math_llm") || "gemma4:e4b", messages: payload, stream: true })
            });
            if (!response.ok) throw new Error("HTTP error");
            typingWrap.remove();

            let assistantText = "";
            let firstToken = true;
            let bubble = null;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            if (firstToken) {
                                bubble = appendInlineBubble(msgsEl, "assistant", "");
                                firstToken = false;
                            }
                            assistantText += data.message.content;
                            bubble.innerHTML = renderMath(parseMD(assistantText));
                            msgsEl.scrollTop = msgsEl.scrollHeight;
                        }
                        if (data.done) break;
                    } catch {}
                }
            }
            chatHistory.push({ role: "assistant", content: assistantText });
        } catch (e) {
            typingWrap.remove();
            appendInlineBubble(msgsEl, "assistant", "Could not connect to Ollama on localhost:11434.");
        }
    }

    return {
        // Asks a question, spawning the inline tutor below containerEl
        invoke: (initialPrompt, containerEl) => {
            if (!containerEl) return;
            // Check if widget already exists here, don't spawn multiple
            if (containerEl.nextElementSibling && containerEl.nextElementSibling.classList?.contains('inline-tutor-widget')) {
                return; // Already open
            }

            const template = document.getElementById("inline-tutor-template");
            if (!template) return;

            const clone = template.content.cloneNode(true);
            const widget = clone.querySelector('.inline-tutor-widget');
            const msgsEl = clone.querySelector('.tutor-messages');
            const input = clone.querySelector('.tutor-input');
            const sendBtn = clone.querySelector('.tutor-send');
            const closeBtn = clone.querySelector('.tutor-close');
            
            let history = [];

            // Bind UI
            closeBtn.addEventListener('click', () => widget.remove());
            
            const handleSend = () => {
                const text = input.value.trim();
                if (!text) return;
                appendInlineBubble(msgsEl, "user", text);
                history.push({ role: "user", content: text });
                input.value = "";
                streamOllama(msgsEl, history);
            };

            sendBtn.addEventListener('click', handleSend);
            input.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleSend(); });

            // Inject into DOM
            containerEl.after(widget);

            // Auto-fire the initial prompt
            appendInlineBubble(msgsEl, "user", initialPrompt);
            history.push({ role: "user", content: initialPrompt });
            streamOllama(msgsEl, history);
        }
    };
})();
