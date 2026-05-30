// sw.js - Gnosys-AI High-Performance OPFS Streaming Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Intercept model files
    if (url.pathname.endsWith('.litertlm') || url.pathname.includes('/models/')) {
        event.respondWith((async () => {
            try {
                // Extract the filename from the URL path
                const filename = url.pathname.split('/').pop();
                
                // Open OPFS
                const root = await navigator.storage.getDirectory();
                const handle = await root.getFileHandle(filename, { create: false });
                const file = await handle.getFile();
                
                // Return a streamed response directly from OPFS File.stream()
                // This keeps memory allocations under 20MB!
                return new Response(file.stream(), {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Content-Length': file.size,
                        'Access-Control-Allow-Origin': '*',
                    }
                });
            } catch (err) {
                console.warn('[GnosysSW] SW OPFS stream fallback to network:', err);
                return fetch(event.request);
            }
        })());
    }
});
