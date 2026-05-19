window.PsychTutor = (() => {
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
        
        // Use violet colors
        if (role === "user") {
            wrap.className = "flex justify-end";
            bubble.className = "max-w-[80%] bg-violet-500 text-white px-3 py-2 rounded-2xl rounded-tr-sm text-xs font-medium";
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

    function appendMainBubble(msgsEl, role, text) {
        const wrap = document.createElement("div");
        const bubble = document.createElement("div");
        
        if (role === "user") {
            wrap.className = "flex justify-end";
            bubble.className = "max-w-[85%] bg-violet-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-medium shadow-sm";
            bubble.innerHTML = renderMath(parseMD(text));
        } else {
            wrap.className = "flex justify-start";
            bubble.className = "max-w-[90%] bg-white px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-medium text-gray-800 border border-gray-100 shadow-sm";
            if(text) bubble.innerHTML = renderMath(parseMD(text));
        }
        wrap.appendChild(bubble);
        msgsEl.appendChild(wrap);
        msgsEl.scrollTop = msgsEl.scrollHeight;
        return bubble;
    }

    async function streamOllama(msgsEl, chatHistory, isMain = false) {
        const appendBubble = isMain ? appendMainBubble : appendInlineBubble;
        
        const typingWrap = document.createElement("div");
        typingWrap.className = "flex justify-start inline-typing";
        if (isMain) {
            typingWrap.innerHTML = `<div class="bg-white px-4 py-3 rounded-2xl flex items-center space-x-1 border border-gray-100 shadow-sm mt-1"><div class="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div><div class="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div><div class="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div></div>`;
        } else {
            typingWrap.innerHTML = `<div class="bg-gray-100 px-3 py-2 rounded-2xl flex items-center space-x-1 border border-gray-200 mt-1"><div class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></div><div class="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></div></div>`;
        }
        msgsEl.appendChild(typingWrap);
        msgsEl.scrollTop = msgsEl.scrollHeight;

        let payload = [
            { role: "system", content: "You are an expert Clinical Psychology and Patient Care Tutor for radiologic and dosimetry students. Be encouraging, precise, and concise. Explain clinical communication, medicolegal ethics, and de-escalation tactics." }, 
            ...chatHistory
        ];
        
        try {
            const response = await fetch("http://localhost:11434/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: localStorage.getItem("psych_llm") || localStorage.getItem("syngnosia_tutor_model") || "gemma4:e4b", messages: payload, stream: true })
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
                                bubble = appendBubble(msgsEl, "assistant", "");
                                firstToken = false;
                                
                                // Reset status text
                                const statusText = document.getElementById('chat-status-text');
                                const statusDot = document.getElementById('chat-status-dot');
                                if (statusText && statusDot) {
                                    statusText.textContent = 'Active';
                                    statusDot.className = 'inline-block w-2 h-2 rounded-full bg-emerald-400';
                                }
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
            appendBubble(msgsEl, "assistant", "Could not connect to Ollama on localhost:11434.");
            const statusText = document.getElementById('chat-status-text');
            const statusDot = document.getElementById('chat-status-dot');
            if (statusText && statusDot) {
                statusText.textContent = 'Offline';
                statusDot.className = 'inline-block w-2 h-2 rounded-full bg-rose-400';
            }
        }
    }

    return {
        initMainChat: () => {
            const input = document.getElementById('chat-input');
            const sendBtn = document.getElementById('chat-btn-send');
            const clearBtn = document.getElementById('chat-btn-clear');
            const msgsEl = document.getElementById('chat-messages');
            const emptyState = document.getElementById('chat-empty-state');
            
            if (!input || !sendBtn || !msgsEl) return;
            
            let history = [];
            
            // Initial status check
            const checkStatus = async () => {
                const statusText = document.getElementById('chat-status-text');
                const statusDot = document.getElementById('chat-status-dot');
                if (!statusText || !statusDot) return;
                try {
                    const res = await fetch("http://localhost:11434/api/tags");
                    if (res.ok) {
                        statusText.textContent = 'Ready';
                        statusDot.className = 'inline-block w-2 h-2 rounded-full bg-emerald-400';
                    } else {
                        throw new Error("Not ok");
                    }
                } catch(e) {
                    statusText.textContent = 'Local AI Offline';
                    statusDot.className = 'inline-block w-2 h-2 rounded-full bg-gray-400';
                }
            };
            checkStatus();
            
            const handleSend = () => {
                const text = input.value.trim();
                if (!text) return;
                
                if (emptyState) emptyState.style.display = 'none';
                
                appendMainBubble(msgsEl, "user", text);
                history.push({ role: "user", content: text });
                input.value = "";
                input.style.height = 'auto'; // Reset height
                
                streamOllama(msgsEl, history, true);
            };
            
            sendBtn.addEventListener('click', handleSend);
            
            input.addEventListener('keypress', (e) => { 
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(); 
                }
            });
            
            input.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
            
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    history = [];
                    msgsEl.innerHTML = '';
                    if (emptyState) {
                        emptyState.style.display = 'flex';
                        msgsEl.appendChild(emptyState);
                    }
                });
            }
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (window.PsychTutor && window.PsychTutor.initMainChat) {
        window.PsychTutor.initMainChat();
    }
});
