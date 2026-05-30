(function () {
    const OLLAMA_BASE_URL = 'http://localhost:11434';
    const OLLAMA_TAGS_URL = `${OLLAMA_BASE_URL}/api/tags`;

    const MODEL_CACHE_NAME = 'gnosys-litert-model-cache-v1';

    const MODEL_TIERS = {
        'gemma-4-e2b': {
            id: 'gemma-4-e2b',
            name: 'Gemma 4 Efficient (2.5B)',
            shortName: 'Efficient',
            description: 'Highly optimized for budget and standard mobile devices. Rapid response speeds and ultra-light memory footprint.',
            url: 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.litertlm',
            filename: 'gemma-4-E2B-it-web.litertlm',
            cacheVersion: 'gemma-4-E2B-it-web-2026-05-30-r2',
            expectedSize: 2150000000,
            ramRecommendation: '4GB - 6GB+ RAM',
            tokensLimit: 1024
        },
        'gemma-4-e4b': {
            id: 'gemma-4-e4b',
            name: 'Gemma 4 Pro (4.5B)',
            shortName: 'Pro',
            description: 'Richer Socratic dialogue, advanced coding, and robust logic. Requires higher memory and processing power.',
            url: 'https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm/resolve/main/gemma-4-E4B-it-web.litertlm',
            filename: 'gemma-4-E4B-it-web.litertlm',
            cacheVersion: 'gemma-4-E4B-it-web-2026-05-30-r2',
            expectedSize: 3190000000,
            ramRecommendation: '8GB+ RAM',
            tokensLimit: 2048
        }
    };

    let isDownloadInitializing = false;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const STORAGE_KEYS = {
        routeMode: 'gnosys_llm_route_mode',
        cloudApiKey: 'gnosys_cloud_api_key',
        onDeviceReady: 'gnosys_ondevice_model_ready',
        onDeviceDownloadInProgress: 'gnosys_ondevice_model_download_in_progress',
        onDeviceModelCacheVersion: 'gnosys_ondevice_model_cache_version',
        onDeviceModelFileVersion: 'gnosys_ondevice_model_file_version',
        onDeviceExpectedSize: 'gnosys_ondevice_model_expected_size',
        onDeviceSelectedModel: 'gnosys_ondevice_selected_model',
    };

    function getActiveModelConfig() {
        const selectedId = localStorage.getItem(STORAGE_KEYS.onDeviceSelectedModel) || 'gemma-4-e2b';
        return MODEL_TIERS[selectedId] || MODEL_TIERS['gemma-4-e2b'];
    }

    const state = {
        initialized: false,
        initPromise: null,
        provider: null,
        providerName: 'uninitialized',
        lastProbeOk: false,
        isWebGpuSupported: Boolean(navigator.gpu),
        isOpfsSupported: Boolean(navigator.storage?.getDirectory),
        mobileChoicePending: false,
        modalEl: null,
        badgeIntervalId: null,
    };

    const routerApi = {
        init,
        getStatus,
        generateResponse,
        showMobileChoiceModal,
        setCloudApiKey,
        getCloudApiKey,
        refreshStatusBadges,
        getProviderBadgeInfo,
        getTutorStatusDisplay,
        purgeModelStorage,
    };

    window.GnosysLLM = routerApi;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init().catch(() => {});
        });
    } else {
        init().catch(() => {});
    }

    async function init() {
        if (isDownloadInitializing) {
            throw new Error('On-device download is already initializing.');
        }

        if (state.initialized) return getStatus();
        if (state.initPromise) return state.initPromise;

        state.initPromise = (async () => {
            await invalidateStaleOnDeviceCache();

            const ollamaOk = await probeOllamaTags();
            state.lastProbeOk = ollamaOk;

            if (ollamaOk) {
                state.provider = createOllamaProvider();
                setProvider('desktop-ollama');
                state.mobileChoicePending = false;
            } else {
                let routeMode = localStorage.getItem(STORAGE_KEYS.routeMode) || '';
                let onDeviceReady = localStorage.getItem(STORAGE_KEYS.onDeviceReady) === 'true';
                let downloadInProgress = localStorage.getItem(STORAGE_KEYS.onDeviceDownloadInProgress) === 'true';
                let onDeviceFile = await getOpfsModelFile();
                const expectedSize = Number(localStorage.getItem(STORAGE_KEYS.onDeviceExpectedSize) || 0);
                const hasPartialModel = Boolean(onDeviceFile) && !onDeviceReady;
                const hasCorruptInstalledModel = Boolean(onDeviceReady && onDeviceFile && expectedSize > 0 && onDeviceFile.size !== expectedSize);

                if (hasCorruptInstalledModel || (onDeviceReady && !onDeviceFile)) {
                    await purgeModelStorage({ suppressModal: true });
                    routeMode = localStorage.getItem(STORAGE_KEYS.routeMode) || '';
                    onDeviceReady = false;
                    downloadInProgress = false;
                    onDeviceFile = null;
                }

                if (routeMode === 'no-ai') {
                    state.provider = createNoAiProvider();
                    setProvider('no-ai');
                    state.mobileChoicePending = false;
                } else if (state.isWebGpuSupported && state.isOpfsSupported && routeMode === 'mobile-ondevice' && onDeviceReady) {
                    state.provider = createLiteRtProvider();
                    setProvider('mobile-litert');
                    state.mobileChoicePending = false;
                } else if (state.isWebGpuSupported && state.isOpfsSupported && routeMode === 'mobile-ondevice' && (downloadInProgress || hasPartialModel)) {
                    state.provider = null;
                    state.mobileChoicePending = true;
                    setProvider('mobile-choice-required');
                    queueMicrotask(() => showMobileChoiceModal());
                } else {
                    state.provider = null;
                    state.mobileChoicePending = true;
                    const providerName = !state.isWebGpuSupported
                        ? 'mobile-webgpu-unsupported'
                        : state.isOpfsSupported
                            ? 'mobile-choice-required'
                            : 'mobile-opfs-unsupported';
                    setProvider(providerName);
                    if (state.isWebGpuSupported) {
                        queueMicrotask(() => showMobileChoiceModal());
                    }
                }
            }

            startBadgeRefreshLoop();
            state.initialized = true;
            return getStatus();
        })();

        return state.initPromise;
    }

    function getStatus() {
        return {
            initialized: state.initialized,
            provider: state.providerName,
            lastProbeOk: state.lastProbeOk,
            webGpuSupported: state.isWebGpuSupported,
            opfsSupported: state.isOpfsSupported,
            mobileChoicePending: state.mobileChoicePending,
        };
    }

    function setProvider(providerName) {
        state.providerName = providerName;
        refreshStatusBadges();
        window.dispatchEvent(new CustomEvent('gnosys-llm-provider-changed', { detail: getStatus() }));
    }

    async function generateResponse(systemPrompt, userPrompt, options = {}) {
        await init();

        if (!state.provider) {
            if (state.isWebGpuSupported) {
                showMobileChoiceModal();
                throw new Error('Model provider not selected yet. Choose a mobile mode to continue.');
            }
            throw new Error('No local LLM provider available. This browser does not support WebGPU.');
        }

        return state.provider.generateResponse(systemPrompt, userPrompt, options);
    }

    async function probeOllamaTags() {
        try {
            const res = await fetch(OLLAMA_TAGS_URL, {
                method: 'GET',
                signal: AbortSignal.timeout(1000),
            });
            return res.ok;
        } catch (_err) {
            return false;
        }
    }

    async function invalidateStaleOnDeviceCache() {
        if (state.provider && typeof state.provider.close === 'function') {
            await state.provider.close();
            state.provider = null;
        }

        const activeConfig = getActiveModelConfig();
        const existingVersion = localStorage.getItem(STORAGE_KEYS.onDeviceModelCacheVersion);
        const existingModelId = localStorage.getItem(STORAGE_KEYS.onDeviceSelectedModel);

        if (existingVersion === activeConfig.cacheVersion && existingModelId === activeConfig.id) {
            return;
        }

        try {
            const cache = await caches.open(MODEL_CACHE_NAME);
            const keys = await cache.keys();
            for (const r of keys) {
                await cache.delete(r);
            }
        } catch (_err) {
            // Ignore cache deletion failures and continue with cold setup.
        }

        try {
            for (const tierId in MODEL_TIERS) {
                await removeOpfsModelEntry(MODEL_TIERS[tierId].filename);
            }
        } catch (_err) {
            // Ignore OPFS cleanup failures and continue with cold setup.
        }

        localStorage.removeItem(STORAGE_KEYS.onDeviceReady);
        localStorage.setItem(STORAGE_KEYS.onDeviceModelCacheVersion, activeConfig.cacheVersion);
        localStorage.setItem(STORAGE_KEYS.onDeviceSelectedModel, activeConfig.id);
        localStorage.removeItem(STORAGE_KEYS.onDeviceModelFileVersion);
        localStorage.removeItem(STORAGE_KEYS.onDeviceExpectedSize);
    }

    function setCloudApiKey(key) {
        if (!key) {
            localStorage.removeItem(STORAGE_KEYS.cloudApiKey);
            return;
        }
        localStorage.setItem(STORAGE_KEYS.cloudApiKey, key);
    }

    function getCloudApiKey() {
        return localStorage.getItem(STORAGE_KEYS.cloudApiKey) || '';
    }

    function createOllamaProvider() {
        function resolveModel(moduleKey) {
            if (typeof window.getActiveModel === 'function') {
                const active = window.getActiveModel(moduleKey || 'gnosys_active_llm');
                if (active) return active;
            }
            if (typeof window.getGnosysModel === 'function') {
                const model = window.getGnosysModel(moduleKey || 'gnosys_active_llm');
                if (model) return model;
            }
            return (
                localStorage.getItem('gnosys_active_llm') ||
                localStorage.getItem(moduleKey || '') ||
                'gemma4:e4b'
            );
        }

        return {
            async generateResponse(systemPrompt, userPrompt, options = {}) {
                const moduleKey = options.moduleKey || 'gnosys_active_llm';
                const model = options.model || resolveModel(moduleKey);
                const stream = Boolean(options.stream);
                const history = Array.isArray(options.history) ? options.history : [];

                const messages = [];
                if (systemPrompt) {
                    messages.push({ role: 'system', content: String(systemPrompt) });
                }
                for (const entry of history) {
                    if (!entry || typeof entry.content !== 'string' || typeof entry.role !== 'string') continue;
                    messages.push({ role: entry.role, content: entry.content });
                }
                messages.push({ role: 'user', content: String(userPrompt || '') });

                const requestOptions = {};
                if (String(model).toLowerCase().includes('gemma4')) {
                    requestOptions.draft_num_predict = 4;
                }

                const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model,
                        messages,
                        stream,
                        options: requestOptions,
                    }),
                });

                if (!response.ok) {
                    let detail = '';
                    try {
                        detail = await response.text();
                    } catch (_err) {
                        detail = '';
                    }
                    throw new Error(`Ollama request failed: ${response.status}${detail ? ` ${detail}` : ''}`);
                }

                if (!stream) {
                    const payload = await response.json();
                    const text = payload?.message?.content || payload?.response || '';
                    return { provider: 'desktop-ollama', model, text: String(text) };
                }

                if (!response.body) {
                    throw new Error('Ollama stream did not return a readable body.');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';
                let lineBuffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    lineBuffer += decoder.decode(value, { stream: true });
                    const lines = lineBuffer.split('\n');
                    lineBuffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        let data;
                        try {
                            data = JSON.parse(line);
                        } catch (_err) {
                            continue;
                        }

                        const token = typeof data?.message?.content === 'string' ? data.message.content : '';
                        if (!token) continue;
                        fullText += token;
                        if (typeof options.onToken === 'function') {
                            options.onToken(token, fullText);
                        }
                    }
                }

                return { provider: 'desktop-ollama', model, text: fullText };
            },
        };
    }

    function createNoAiProvider() {
        return {
            async generateResponse(systemPrompt, userPrompt, options = {}) {
                const text = "AI Tutor is currently disabled on this device. Click the '● AI Disabled' status badge in the top header at any time to enable and download local Gemma 4 AI!";
                if (options.stream && typeof options.onToken === 'function') {
                    const tokens = text.split(' ');
                    let full = '';
                    for (const token of tokens) {
                        const word = token + ' ';
                        full += word;
                        options.onToken(word, full);
                        await new Promise(r => setTimeout(r, 45));
                    }
                }
                return {
                    provider: 'no-ai',
                    model: 'none',
                    text: text
                };
            }
        };
    }

    function createLiteRtProvider() {
        const providerState = {
            engine: null,
            modelObjectUrl: null,
            litertModule: null,
            activeConversation: null,
            activeSystemPrompt: null,
            activeHistory: [],
        };

        return {
            async close() {
                if (providerState.engine) {
                    try {
                        await providerState.engine.delete();
                        console.log('[GnosysLLM] Explicitly deleted LiteRT WebGPU engine instance.');
                    } catch (e) {
                        console.warn('[GnosysLLM] Failed to delete LiteRT engine:', e);
                    }
                    providerState.engine = null;
                }
                providerState.modelObjectUrl = null;
                providerState.activeConversation = null;
                providerState.activeHistory = [];
            },

            async ensureReady(progressCallback) {
                if (!providerState.litertModule) {
                    providerState.litertModule = await import('https://cdn.jsdelivr.net/npm/@litert-lm/core/+esm');
                }

                let justDownloaded = false;
                if (!providerState.modelObjectUrl) {
                    providerState.modelObjectUrl = await getOrDownloadModelObjectUrl(progressCallback);
                    justDownloaded = true;
                }

                if (!providerState.engine) {
                    if (justDownloaded) {
                        if (typeof progressCallback === 'function') {
                            progressCallback({ loaded: 100, total: 100, percent: 100, stage: 'finalizing' });
                        }
                        await new Promise((resolve) => setTimeout(resolve, 1500));

                        if (typeof progressCallback === 'function') {
                            progressCallback({ loaded: 100, total: 100, percent: 100, stage: 'cooling' });
                        }
                        state.downloadSession = null;
                        await new Promise((resolve) => setTimeout(resolve, 1500));
                    }

                    if (typeof progressCallback === 'function') {
                        progressCallback({ loaded: 100, total: 100, percent: 100, stage: 'compiling' });
                    }
                    const { Engine, Backend } = providerState.litertModule;
                    
                    const activeConfig = getActiveModelConfig();
                    const engineSettings = {
                        model: providerState.modelObjectUrl.stream(),
                        backend: Backend ? Backend.GPU_ARTISAN : undefined,
                        mainExecutorSettings: {
                            maxNumTokens: isMobileDevice ? activeConfig.tokensLimit : activeConfig.tokensLimit * 2,
                        },
                    };
                    providerState.engine = await Engine.create(engineSettings);
                    localStorage.setItem(STORAGE_KEYS.onDeviceReady, 'true');
                    localStorage.setItem(STORAGE_KEYS.onDeviceModelCacheVersion, activeConfig.cacheVersion);
                }
            },

            async generateResponse(systemPrompt, userPrompt, options = {}) {
                await this.ensureReady(options.onDownloadProgress);
                const history = Array.isArray(options.history) ? options.history : [];

                let conversation = null;
                let reuseConversation = false;
                let newHistoryItemsToPlay = [];

                if (providerState.activeConversation && providerState.activeSystemPrompt === systemPrompt) {
                    const cachedLen = providerState.activeHistory.length;
                    if (history.length >= cachedLen) {
                        let prefixMatch = true;
                        for (let i = 0; i < cachedLen; i++) {
                            if (history[i].role !== providerState.activeHistory[i].role ||
                                history[i].content !== providerState.activeHistory[i].content) {
                                prefixMatch = false;
                                break;
                            }
                        }
                        if (prefixMatch) {
                            reuseConversation = true;
                            newHistoryItemsToPlay = history.slice(cachedLen);
                        }
                    }
                }

                if (reuseConversation) {
                    conversation = providerState.activeConversation;
                    for (const item of newHistoryItemsToPlay) {
                        if (!item || typeof item.role !== 'string' || typeof item.content !== 'string') continue;
                        await conversation.sendMessage({ role: item.role, content: item.content });
                        providerState.activeHistory.push({ role: item.role, content: item.content });
                    }
                } else {
                    let prefaceMessages = [];
                    if (systemPrompt) {
                        prefaceMessages.push({ role: 'system', content: String(systemPrompt) });
                    }
                    for (const item of history) {
                        if (!item || typeof item.role !== 'string' || typeof item.content !== 'string') continue;
                        prefaceMessages.push({ role: item.role, content: item.content });
                    }

                    conversation = await providerState.engine.createConversation({
                        preface: {
                            messages: prefaceMessages,
                        },
                    });
                    providerState.activeConversation = conversation;
                    providerState.activeSystemPrompt = systemPrompt;
                    providerState.activeHistory = [...history];
                    prefaceMessages = null;
                }

                const activeConfig = getActiveModelConfig();
                const stream = Boolean(options.stream);
                if (!stream) {
                    const response = await conversation.sendMessage({ role: 'user', content: String(userPrompt || '') });
                    const textPart = Array.isArray(response?.content)
                        ? response.content.find((p) => p.type === 'text' && typeof p.text === 'string')
                        : null;
                    const text = textPart ? textPart.text : '';

                    providerState.activeHistory.push({ role: 'user', content: String(userPrompt || '') });
                    providerState.activeHistory.push({ role: 'assistant', content: text });

                    return {
                        provider: 'mobile-litert',
                        model: activeConfig.filename,
                        text,
                    };
                }

                let text = '';
                try {
                    const streamSource = conversation.sendMessageStreaming({ role: 'user', content: String(userPrompt || '') });
                    for await (let chunk of streamSource) {
                        if (chunk && Array.isArray(chunk.content)) {
                            for (let item of chunk.content) {
                                if (item && item.type === 'text' && typeof item.text === 'string') {
                                    text += item.text;
                                    if (typeof options.onToken === 'function') {
                                        options.onToken(item.text, text);
                                    }
                                    item = null;
                                }
                            }
                        }
                        chunk = null;
                    }
                } finally {
                    if (options && typeof options === 'object') {
                        options.onToken = null;
                    }
                }

                providerState.activeHistory.push({ role: 'user', content: String(userPrompt || '') });
                providerState.activeHistory.push({ role: 'assistant', content: text });

                return {
                    provider: 'mobile-litert',
                    model: activeConfig.filename,
                    text,
                };
            },
        };
    }

    async function checkQuotaAndRequestPersistence(requiredBytes) {
        if (navigator.storage && navigator.storage.persist) {
            try {
                const persisted = await navigator.storage.persist();
                console.log(`[GnosysLLM] Storage persistence status: ${persisted ? 'PERSISTED' : 'BEST-EFFORT'}`);
            } catch (err) {
                console.warn('[GnosysLLM] Failed to request storage persistence:', err);
            }
        }

        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                const available = estimate.quota - estimate.usage;
                console.log(`[GnosysLLM] Storage Estimate - Quota: ${(estimate.quota / 1e9).toFixed(2)} GB, Usage: ${(estimate.usage / 1e9).toFixed(2)} GB, Available: ${(available / 1e9).toFixed(2)} GB`);
                
                if (available < requiredBytes) {
                    throw new Error(`Insufficient storage. Gnosys requires ~${(requiredBytes / 1e9).toFixed(2)} GB, but only ${(available / 1e9).toFixed(2)} GB is available. Please clear space in your browser settings or device storage.`);
                }
            } catch (err) {
                if (err.message && err.message.includes('Insufficient storage')) {
                    throw err;
                }
                console.warn('[GnosysLLM] Failed to estimate storage quota:', err);
            }
        }
    }

    async function getOrDownloadModelObjectUrl(progressCallback) {
        if (!state.isOpfsSupported) {
            throw new Error('On-device model storage requires OPFS support in this browser.');
        }

        const activeConfig = getActiveModelConfig();
        const partialSize = await getOpfsFileSize(activeConfig.filename);

        // Run pre-flight persistent storage and quota check
        const EXPECTED_MODEL_SIZE = activeConfig.expectedSize;
        const neededBytes = Math.max(0, EXPECTED_MODEL_SIZE - partialSize);
        await checkQuotaAndRequestPersistence(neededBytes);

        const existingFile = await getCachedModelFile();
        if (existingFile) {
            if (typeof progressCallback === 'function') {
                progressCallback({ loaded: existingFile.size, total: existingFile.size, percent: 100, stage: 'cached' });
            }
            return existingFile;
        }

        const requestHeaders = {};
        if (partialSize > 0) {
            requestHeaders.Range = `bytes=${partialSize}-`;
        }

        const downloadSession = {
            abortController: new AbortController(),
            reader: null,
            writable: null,
        };

        isDownloadInitializing = true;
        state.downloadSession = downloadSession;

        try {
            const res = await fetch(activeConfig.url, {
                method: 'GET',
                headers: requestHeaders,
                signal: downloadSession.abortController.signal,
            });
            if (!res.ok || !res.body) {
                throw new Error('Failed to download mobile model file.');
            }

            const responseTotal = getExpectedDownloadSize(res, partialSize);
            const appendExisting = res.status === 206 && partialSize > 0;
            const initialLoaded = appendExisting ? partialSize : 0;

            if (!appendExisting && partialSize > 0) {
                try {
                    await removeOpfsModelEntry(activeConfig.filename);
                } catch (_e) {
                    console.warn('[GnosysLLM] Failed to remove stale OPFS entry:', _e);
                }
            }

            if (typeof progressCallback === 'function' && initialLoaded > 0) {
                const initialPercent = responseTotal > 0 ? Math.min(100, Math.round((initialLoaded / responseTotal) * 100)) : 0;
                progressCallback({ loaded: initialLoaded, total: responseTotal, percent: initialPercent, stage: 'resuming' });
            }

            await writeStreamToOpfsFile(res.body, activeConfig.filename, progressCallback, {
                total: responseTotal,
                loaded: initialLoaded,
                appendExisting,
                session: downloadSession,
            });

            if (isMobileDevice) {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            // OPFS Post-Flight Sync Check: Poll up to 3 times with 100ms delay to verify presence and size
            let file = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    file = await getOpfsModelFile(activeConfig.filename);
                    if (file && (responseTotal <= 0 || file.size === responseTotal)) {
                        break;
                    }
                } catch (e) {
                    console.warn(`[GnosysLLM] OPFS verification attempt ${attempt} failed:`, e);
                }
                if (attempt < 3) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            }

            if (!file) {
                throw new Error('Mobile model download completed but local file was not available.');
            }

            if (responseTotal > 0 && file.size !== responseTotal) {
                await purgeModelStorage({ suppressModal: true });
                throw new Error('Mobile model download size mismatch; local storage was purged.');
            }

            localStorage.setItem(STORAGE_KEYS.onDeviceModelFileVersion, activeConfig.cacheVersion);
            localStorage.setItem(STORAGE_KEYS.onDeviceExpectedSize, String(file.size));
            if (typeof progressCallback === 'function') {
                progressCallback({ loaded: file.size, total: file.size, percent: 100, stage: 'ready' });
            }
            return file;
        } catch (err) {
            if (err?.name !== 'AbortError') {
                await purgeModelStorage({ suppressModal: true });
            }
            if (err?.name === 'QuotaExceededError' || (err?.message && err.message.toLowerCase().includes('quota'))) {
                const quotaErr = new Error('The Operation failed because it would cause the application to exceed its storage quota. Please free up space in your browser settings or device storage.');
                quotaErr.name = 'QuotaExceededError';
                throw quotaErr;
            }
            throw err;
        } finally {
            state.downloadSession = null;
            isDownloadInitializing = false;
        }
    }

    async function getOpfsRoot() {
        if (!navigator.storage?.getDirectory) {
            throw new Error('OPFS is unavailable in this browser.');
        }
        return navigator.storage.getDirectory();
    }

    async function getCachedModelFile() {
        const activeConfig = getActiveModelConfig();
        if (localStorage.getItem(STORAGE_KEYS.onDeviceModelFileVersion) !== activeConfig.cacheVersion) {
            return null;
        }

        return getOpfsModelFile(activeConfig.filename);
    }

    async function purgeModelStorage(options = {}) {
        const suppressModal = Boolean(options.suppressModal);
        const session = state.downloadSession;
        state.downloadSession = null;

        if (state.provider && typeof state.provider.close === 'function') {
            await state.provider.close();
        }

        if (session?.abortController && !session.abortController.signal.aborted) {
            try {
                session.abortController.abort();
            } catch (_err) {
                // ignore abort failures
            }
        }

        if (session?.reader) {
            try {
                await session.reader.cancel();
            } catch (_err) {
                // ignore reader cancel failures
            }
        }

        if (session?.writable) {
            try {
                await session.writable.abort();
            } catch (_err) {
                // ignore writable abort failures
            }
        }

        try {
            for (const tierId in MODEL_TIERS) {
                await removeOpfsModelEntry(MODEL_TIERS[tierId].filename);
            }
        } catch (_err) {
            // ignore OPFS cleanup failures during purge
        }

        localStorage.removeItem(STORAGE_KEYS.onDeviceReady);
        localStorage.removeItem(STORAGE_KEYS.onDeviceDownloadInProgress);
        localStorage.removeItem(STORAGE_KEYS.onDeviceModelCacheVersion);
        localStorage.removeItem(STORAGE_KEYS.onDeviceModelFileVersion);
        localStorage.removeItem(STORAGE_KEYS.onDeviceExpectedSize);
        localStorage.removeItem(STORAGE_KEYS.routeMode);

        state.provider = null;
        state.initialized = false;
        state.initPromise = null;
        state.mobileChoicePending = !suppressModal && state.isWebGpuSupported;
        setProvider(state.isWebGpuSupported ? 'mobile-choice-required' : 'mobile-webgpu-unsupported');

        return getStatus();
    }

    async function removeOpfsModelEntry(filename) {
        const activeConfig = getActiveModelConfig();
        const fileToUse = filename || activeConfig.filename;
        const root = await getOpfsRoot();
        try {
            await root.removeEntry(fileToUse, { recursive: false });
        } catch (_err) {
            // ignore missing file cleanup failures
        }
    }

    async function getOpfsFileSize(filename) {
        try {
            const activeConfig = getActiveModelConfig();
            const fileToUse = filename || activeConfig.filename;
            const root = await getOpfsRoot();
            const handle = await root.getFileHandle(fileToUse, { create: false });
            const file = await handle.getFile();
            return file.size;
        } catch (_err) {
            return 0;
        }
    }

    async function getOpfsModelFile(filename) {
        try {
            const activeConfig = getActiveModelConfig();
            const fileToUse = filename || activeConfig.filename;
            const root = await getOpfsRoot();
            const handle = await root.getFileHandle(fileToUse, { create: false });
            return await handle.getFile();
        } catch (_err) {
            return null;
        }
    }

    function getExpectedDownloadSize(response, partialSize) {
        const contentRange = response.headers.get('content-range') || '';
        const rangeMatch = contentRange.match(/\/([0-9]+)\s*$/);
        if (response.status === 206 && rangeMatch) {
            return Number(rangeMatch[1]) || 0;
        }

        const contentLength = Number(response.headers.get('content-length') || 0);
        return partialSize > 0 ? partialSize + contentLength : contentLength;
    }

    async function writeStreamToOpfsFile(stream, filename, progressCallback, options = {}) {
        const total = Number(options.total || 0);
        const initialLoaded = Number(options.loaded || 0);
        const appendExisting = Boolean(options.appendExisting);
        const session = options.session || null;

        const root = await getOpfsRoot();
        const handle = await root.getFileHandle(filename, { create: true });
        const writable = await handle.createWritable({ keepExistingData: appendExisting });
        const reader = stream.getReader();
        if (session) {
            session.reader = reader;
            session.writable = writable;
        }
        let loaded = initialLoaded;

        if (appendExisting && loaded > 0) {
            await writable.seek(loaded);
        }

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (!value || !value.byteLength) continue;

                loaded += value.byteLength;
                await writable.write(value);

                if (typeof progressCallback === 'function') {
                    const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
                    progressCallback({ loaded, total, percent, stage: 'downloading' });
                }
            }

            await writable.close();
        } catch (err) {
            try {
                await writable.abort();
            } catch (_abortErr) {
                // ignore abort failures
            }
            throw err;
        } finally {
            if (session) {
                session.reader = null;
                session.writable = null;
            }
        }
    }

    function getProviderBadgeInfo(status = getStatus()) {
        if (!status || !status.provider) {
            return { text: '● Mobile Setup Required', className: 'gnosys-status--setup' };
        }

        if (status.provider === 'no-ai') {
            return { text: '● AI Disabled (Tap to Enable)', className: 'gnosys-status--setup' };
        }

        if (status.provider === 'desktop-ollama') {
            return { text: '● Connected to PC (Ollama)', className: 'gnosys-status--desktop' };
        }

        if (status.provider === 'mobile-litert') {
            const activeConfig = getActiveModelConfig();
            return { text: `● Running Locally (${activeConfig.shortName})`, className: 'gnosys-status--mobile' };
        }

        return { text: '● Mobile Setup Required', className: 'gnosys-status--setup' };
    }

    function getTutorStatusDisplay(status = getStatus()) {
        if (status?.provider === 'desktop-ollama') {
            return {
                connected: true,
                text: 'Connected to PC (Ollama)',
                dotClass: 'inline-block w-2 h-2 rounded-full bg-green-500',
            };
        }

        if (status?.provider === 'no-ai') {
            return {
                connected: false,
                text: 'AI Disabled (Tap to Enable)',
                dotClass: 'inline-block w-2 h-2 rounded-full bg-amber-500',
            };
        }

        if (status?.provider === 'mobile-litert') {
            const activeConfig = getActiveModelConfig();
            return {
                connected: true,
                text: `Running Locally (${activeConfig.shortName})`,
                dotClass: 'inline-block w-2 h-2 rounded-full bg-violet-500',
            };
        }

        return {
            connected: false,
            text: 'Mobile Setup Required',
            dotClass: 'inline-block w-2 h-2 rounded-full bg-amber-500',
        };
    }

    function ensureBadgeStyles() {
        if (document.getElementById('gnosys-llm-badge-style')) return;
        const style = document.createElement('style');
        style.id = 'gnosys-llm-badge-style';
        style.textContent = `
            [data-llm-provider-badge] {
                display:inline-flex;
                align-items:center;
                gap:6px;
                font-size:11px;
                font-weight:700;
                border-radius:999px;
                padding:4px 10px;
                border:1px solid transparent;
                white-space:nowrap;
                cursor:pointer;
                transition:all 0.2s ease-in-out;
            }
            [data-llm-provider-badge]:hover {
                transform:scale(1.04);
                opacity:0.95;
            }
            [data-llm-provider-badge].gnosys-status--desktop {
                color:#22c55e;
                background:rgba(34,197,94,0.12);
                border-color:rgba(34,197,94,0.35);
            }
            [data-llm-provider-badge].gnosys-status--mobile {
                color:#8b5cf6;
                background:rgba(139,92,246,0.13);
                border-color:rgba(139,92,246,0.35);
            }
            [data-llm-provider-badge].gnosys-status--setup {
                color:#f59e0b;
                background:rgba(245,158,11,0.13);
                border-color:rgba(245,158,11,0.35);
            }
        `;
        document.head.appendChild(style);
    }

    function refreshStatusBadges() {
        ensureBadgeStyles();
        const badgeInfo = getProviderBadgeInfo(getStatus());
        const badges = document.querySelectorAll('[data-llm-provider-badge]');
        for (const badge of badges) {
            badge.textContent = badgeInfo.text;
            badge.classList.remove('gnosys-status--desktop', 'gnosys-status--mobile', 'gnosys-status--setup');
            badge.classList.add(badgeInfo.className);

            if (!badge.dataset.listenerAttached) {
                badge.addEventListener('click', (e) => {
                    e.preventDefault();
                    showMobileChoiceModal();
                });
                badge.dataset.listenerAttached = 'true';
            }
        }
    }

    function startBadgeRefreshLoop() {
        refreshStatusBadges();
        if (state.badgeIntervalId) return;
        state.badgeIntervalId = window.setInterval(() => {
            refreshStatusBadges();
        }, 2500);
    }

    function showMobileChoiceModal() {
        if (state.modalEl) {
            state.modalEl.style.display = 'flex';
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'gnosys-llm-mobile-choice';
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:100000',
            'background:rgba(2,6,23,0.72)',
            'backdrop-filter:blur(10px)',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'padding:16px',
        ].join(';');

        const supportsWebGpu = state.isWebGpuSupported;
        const supportsOnDevice = state.isWebGpuSupported && state.isOpfsSupported;

        let activeSelection = localStorage.getItem(STORAGE_KEYS.onDeviceSelectedModel) || 'gemma-4-e2b';
        const ramGb = navigator.deviceMemory; // float in GiB, e.g. 4, 8
        const ramText = ramGb ? `Detected RAM: ~${Math.round(ramGb)} GB` : 'RAM: Unspecified';
        const isHighEnd = ramGb && ramGb >= 8;

        if (!localStorage.getItem(STORAGE_KEYS.onDeviceSelectedModel) && ramGb) {
            activeSelection = isHighEnd ? 'gemma-4-e4b' : 'gemma-4-e2b';
            localStorage.setItem(STORAGE_KEYS.onDeviceSelectedModel, activeSelection);
        }

        overlay.innerHTML = `
            <div style="max-width:560px;width:100%;background:#0f172a;border:1px solid #334155;border-radius:22px;padding:22px;color:#e2e8f0;box-shadow:0 20px 60px rgba(0,0,0,0.45)">
                <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
                    <div>
                        <h2 style="margin:0 0 6px 0;font-size:1.15rem;font-weight:800;color:#f8fafc">Smart LLM Routing</h2>
                        <p style="margin:0;color:#94a3b8;font-size:.92rem;line-height:1.4">Local Ollama was not reachable. Choose how to continue on this device.</p>
                    </div>
                    <button id="gnosys-llm-modal-close" style="border:none;background:transparent;color:#94a3b8;font-size:1.1rem;cursor:pointer">✕</button>
                </div>

                <div style="margin-top:16px;display:grid;gap:10px;">
                    ${supportsOnDevice ? `
                        <!-- Model Selection Container -->
                        <div style="background:#1e293b;border:1px solid #334155;border-radius:14px;padding:14px;">
                            <div style="font-weight:700;font-size:.85rem;color:#f8fafc;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
                                <span>Option A: On-Device Model Size</span>
                                <span id="gnosys-ram-indicator" style="font-size:0.75rem;font-weight:normal;opacity:0.8;background:rgba(20,184,166,0.15);color:#14b8a6;padding:2px 8px;border-radius:6px;">${ramText}</span>
                            </div>
                            
                            <!-- Efficient Tier Card -->
                            <div id="gnosys-tier-efficient" style="text-align:left;border:2px solid ${activeSelection === 'gemma-4-e2b' ? '#14b8a6' : '#334155'};background:${activeSelection === 'gemma-4-e2b' ? 'rgba(20,184,166,0.06)' : 'rgba(15,23,42,0.5)'};color:#f8fafc;padding:12px;border-radius:10px;cursor:pointer;margin-bottom:8px;transition:all 0.2s ease;">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-weight:800;font-size:0.9rem;opacity:${activeSelection === 'gemma-4-e2b' ? '1' : '0.8'}">Gemma 4 Efficient (2.5B)</span>
                                    <span id="gnosys-badge-efficient" style="font-size:0.72rem;font-weight:700;background:${activeSelection === 'gemma-4-e2b' ? '#14b8a6' : '#475569'};color:${activeSelection === 'gemma-4-e2b' ? '#0f172a' : '#f8fafc'};padding:1px 6px;border-radius:4px;">
                                        ${!isHighEnd ? 'Recommended' : 'Fast & Lighter'}
                                    </span>
                                </div>
                                <div style="font-size:0.78rem;color:${activeSelection === 'gemma-4-e2b' ? '#94a3b8' : '#64748b'};margin-top:4px;">~2.01 GB download. Faster response times and ultra-light memory footprint. Highly recommended for standard or older mobile devices to avoid memory crashes.</div>
                            </div>
                            
                            <!-- Pro Tier Card -->
                            <div id="gnosys-tier-pro" style="text-align:left;border:2px solid ${activeSelection === 'gemma-4-e4b' ? '#14b8a6' : '#334155'};background:${activeSelection === 'gemma-4-e4b' ? 'rgba(20,184,166,0.06)' : 'rgba(15,23,42,0.5)'};color:#f8fafc;padding:12px;border-radius:10px;cursor:pointer;transition:all 0.2s ease;">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <span style="font-weight:800;font-size:0.9rem;opacity:${activeSelection === 'gemma-4-e4b' ? '1' : '0.8'}">Gemma 4 Pro (4.5B)</span>
                                    <span id="gnosys-badge-pro" style="font-size:0.72rem;font-weight:700;background:${activeSelection === 'gemma-4-e4b' ? '#14b8a6' : '#475569'};color:${activeSelection === 'gemma-4-e4b' ? '#0f172a' : '#f8fafc'};padding:1px 6px;border-radius:4px;">
                                        ${isHighEnd ? 'Recommended' : 'Requires Flagship'}
                                    </span>
                                </div>
                                <div style="font-size:0.78rem;color:${activeSelection === 'gemma-4-e4b' ? '#94a3b8' : '#64748b'};margin-top:4px;">~2.97 GB download. Richer Socratic explanations, advanced coding, and robust reasoning. Recommended for devices with 8GB+ RAM.</div>
                            </div>
                        </div>

                        <button id="gnosys-ondevice-btn" style="text-align:left;border:1px solid #0f766e;background:linear-gradient(135deg,#0b3b38,#0f766e);color:#ecfeff;padding:14px 16px;border-radius:14px;cursor:pointer;width:100%;">
                            <div style="font-weight:800;text-align:center;">Download & Setup On-Device Mode</div>
                        </button>
                        
                        <div id="gnosys-ondevice-progress" style="display:none;background:#0b1220;border:1px solid #1e293b;border-radius:10px;padding:10px;margin-top:10px;">
                            <div id="gnosys-ondevice-progress-text" style="font-size:.8rem;color:#94a3b8;margin-bottom:8px;">Preparing download...</div>
                            <div style="height:8px;background:#1e293b;border-radius:999px;overflow:hidden;">
                                <div id="gnosys-ondevice-progress-bar" style="height:8px;width:0%;background:#14b8a6;transition:width .25s"></div>
                            </div>
                        </div>
                    ` : supportsWebGpu ? `
                        <div style="border:1px solid #7f1d1d;background:#3f1111;color:#fecaca;padding:12px 14px;border-radius:12px;font-size:.85rem;line-height:1.4">
                            This browser supports WebGPU, but it does not expose OPFS/file-backed storage. On-device Gemma needs OPFS to cache the model safely, so use a browser with OPFS support or reconnect to the desktop provider.
                        </div>
                    ` : `
                        <div style="border:1px solid #7f1d1d;background:#3f1111;color:#fecaca;padding:12px 14px;border-radius:12px;font-size:.85rem;line-height:1.4">
                            WebGPU is not available on this browser/device, so on-device Gemma mode is unavailable here.
                        </div>
                    `}

                    <!-- Option B: Offline Fallback -->
                    <button id="gnosys-noai-btn" style="text-align:left;border:1px solid #334155;background:#1e293b;color:#e2e8f0;padding:14px;border-radius:12px;cursor:pointer;margin-top:4px;width:100%;transition:all 0.2s ease;">
                        <div style="font-weight:700;color:#f8fafc">Option B: Continue without Local AI</div>
                        <div style="font-size:.78rem;color:#94a3b8;margin-top:4px">Study medical terminologies and periodic tables offline. You can enable or download local Gemma 4 AI later at any time by tapping the badge in the header.</div>
                    </button>

                    <div style="border:1px solid #334155;background:#111827;padding:14px;border-radius:12px;opacity:0.6;">
                        <div style="font-weight:700;color:#e2e8f0">Option C: Cloud API Fallback</div>
                        <div style="font-size:.8rem;color:#94a3b8;margin-top:4px">Disabled in this milestone build. UI pathway is reserved for future activation.</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        state.modalEl = overlay;

        const closeBtn = overlay.querySelector('#gnosys-llm-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                // Prevent closing during download to prevent broken states
                if (localStorage.getItem(STORAGE_KEYS.onDeviceDownloadInProgress) === 'true') {
                    alert('Download is currently in progress. Please wait for completion.');
                    return;
                }
                overlay.style.display = 'none';
            });
        }

        const tierEfficient = overlay.querySelector('#gnosys-tier-efficient');
        const tierPro = overlay.querySelector('#gnosys-tier-pro');
        const badgeEfficient = overlay.querySelector('#gnosys-badge-efficient');
        const badgePro = overlay.querySelector('#gnosys-badge-pro');

        function updateSelection(selected) {
            activeSelection = selected;
            localStorage.setItem(STORAGE_KEYS.onDeviceSelectedModel, selected);

            if (selected === 'gemma-4-e2b') {
                tierEfficient.style.borderColor = '#14b8a6';
                tierEfficient.style.background = 'rgba(20,184,166,0.06)';
                tierEfficient.querySelector('span').style.opacity = '1';
                tierEfficient.querySelector('div:last-child').style.color = '#94a3b8';

                tierPro.style.borderColor = '#334155';
                tierPro.style.background = 'rgba(15,23,42,0.5)';
                tierPro.querySelector('span').style.opacity = '0.8';
                tierPro.querySelector('div:last-child').style.color = '#64748b';

                if (badgeEfficient) {
                    badgeEfficient.style.background = '#14b8a6';
                    badgeEfficient.style.color = '#0f172a';
                }
                if (badgePro) {
                    badgePro.style.background = '#475569';
                    badgePro.style.color = '#f8fafc';
                }
            } else {
                tierPro.style.borderColor = '#14b8a6';
                tierPro.style.background = 'rgba(20,184,166,0.06)';
                tierPro.querySelector('span').style.opacity = '1';
                tierPro.querySelector('div:last-child').style.color = '#94a3b8';

                tierEfficient.style.borderColor = '#334155';
                tierEfficient.style.background = 'rgba(15,23,42,0.5)';
                tierEfficient.querySelector('span').style.opacity = '0.8';
                tierEfficient.querySelector('div:last-child').style.color = '#64748b';

                if (badgePro) {
                    badgePro.style.background = '#14b8a6';
                    badgePro.style.color = '#0f172a';
                }
                if (badgeEfficient) {
                    badgeEfficient.style.background = '#475569';
                    badgeEfficient.style.color = '#f8fafc';
                }
            }
        }

        if (tierEfficient) {
            tierEfficient.addEventListener('click', () => {
                if (localStorage.getItem(STORAGE_KEYS.onDeviceDownloadInProgress) === 'true') return;
                updateSelection('gemma-4-e2b');
            });
        }
        if (tierPro) {
            tierPro.addEventListener('click', () => {
                if (localStorage.getItem(STORAGE_KEYS.onDeviceDownloadInProgress) === 'true') return;
                updateSelection('gemma-4-e4b');
            });
        }

        const onDeviceBtn = overlay.querySelector('#gnosys-ondevice-btn');
        if (onDeviceBtn) {
            onDeviceBtn.addEventListener('click', async () => {
                const activeConfig = getActiveModelConfig();
                if (activeConfig.id === 'gemma-4-e4b' && navigator.deviceMemory && navigator.deviceMemory < 8) {
                    const confirmPro = confirm("Warning: Gemma 4 Pro requires at least 8GB RAM. Your device reports less than 8GB, which may cause your browser tab to crash during initialization.\n\nWe highly recommend using the Gemma 4 Efficient tier instead. Are you sure you want to download Pro?");
                    if (!confirmPro) {
                        return;
                    }
                }

                const progressWrap = overlay.querySelector('#gnosys-ondevice-progress');
                const progressText = overlay.querySelector('#gnosys-ondevice-progress-text');
                const progressBar = overlay.querySelector('#gnosys-ondevice-progress-bar');

                if (!state.isOpfsSupported) {
                    if (progressWrap) progressWrap.style.display = 'block';
                    if (progressText) {
                        progressText.textContent = 'On-device mode needs OPFS file-backed storage in this browser.';
                    }
                    return;
                }

                localStorage.setItem(STORAGE_KEYS.routeMode, 'mobile-ondevice');
                localStorage.setItem(STORAGE_KEYS.onDeviceDownloadInProgress, 'true');

                onDeviceBtn.setAttribute('disabled', 'true');
                onDeviceBtn.style.opacity = '0.8';
                onDeviceBtn.textContent = 'Setting up on-device engine...';

                // Disable model selector cards visually while downloading
                if (tierEfficient) tierEfficient.style.cursor = 'not-allowed';
                if (tierPro) tierPro.style.cursor = 'not-allowed';

                if (progressWrap) progressWrap.style.display = 'block';

                try {
                    await invalidateStaleOnDeviceCache();
                    const activeConfig = getActiveModelConfig();

                    const provider = createLiteRtProvider();
                    await provider.ensureReady((info) => {
                        if (!progressText || !progressBar) return;
                        const pct = typeof info.percent === 'number' ? info.percent : 0;
                        progressBar.style.width = `${pct}%`;
                        if (info.stage === 'finalizing') {
                            progressText.textContent = 'Verifying storage & finalizing file sync...';
                            progressBar.classList.add('animate-pulse');
                        } else if (info.stage === 'cooling') {
                            progressText.textContent = 'Releasing download memory & cleaning up...';
                            progressBar.classList.add('animate-pulse');
                        } else if (info.stage === 'compiling') {
                            progressText.textContent = `Optimizing GPU shaders & allocating VRAM... (takes 10-25s)`;
                            progressBar.classList.add('animate-pulse');
                        } else {
                            progressText.textContent = `Downloading Gemma 4 ${activeConfig.shortName}: ${pct}%`;
                            progressBar.classList.remove('animate-pulse');
                        }
                    });

                    state.provider = provider;
                    state.mobileChoicePending = false;
                    localStorage.setItem(STORAGE_KEYS.routeMode, 'mobile-ondevice');
                    localStorage.setItem(STORAGE_KEYS.onDeviceDownloadInProgress, 'false');
                    setProvider('mobile-litert');
                    onDeviceBtn.textContent = 'On-device mode ready';
                    
                    // Restore cursor styling
                    if (tierEfficient) tierEfficient.style.cursor = 'pointer';
                    if (tierPro) tierPro.style.cursor = 'pointer';
                    
                    overlay.style.display = 'none';
                } catch (err) {
                    console.error('[GnosysLLM] On-device setup failed:', err);
                    onDeviceBtn.removeAttribute('disabled');
                    onDeviceBtn.style.opacity = '1';
                    onDeviceBtn.textContent = 'Retry on-device setup';
                    
                    if (tierEfficient) tierEfficient.style.cursor = 'pointer';
                    if (tierPro) tierPro.style.cursor = 'pointer';
                    
                    localStorage.setItem(STORAGE_KEYS.onDeviceDownloadInProgress, 'false');
                    
                    const detail = String(err?.message || err || 'Unknown LiteRT error');
                    if (progressText) {
                        progressText.textContent = `Setup failed: ${detail}`;
                    }
                    alert(`LiteRT Error: ${detail}`);
                }
            });
        }

        const noAiBtn = overlay.querySelector('#gnosys-noai-btn');
        if (noAiBtn) {
            noAiBtn.addEventListener('click', async () => {
                if (localStorage.getItem(STORAGE_KEYS.onDeviceDownloadInProgress) === 'true') {
                    alert('Cannot switch modes while download is in progress.');
                    return;
                }
                if (state.provider && typeof state.provider.close === 'function') {
                    await state.provider.close();
                }
                localStorage.setItem(STORAGE_KEYS.routeMode, 'no-ai');
                state.provider = createNoAiProvider();
                state.mobileChoicePending = false;
                setProvider('no-ai');
                overlay.style.display = 'none';
            });
        }
    }
})();
