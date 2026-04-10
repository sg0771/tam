if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(window.document.currentScript.src).then(() => {
        if (navigator.serviceWorker.controller) {
            console.log("COI: Service Worker already controlling the page.");
        } else {
            console.log("COI: Reloading to let Service Worker take control...");
            window.location.reload();
        }
    }).catch(err => console.error("COI: Registration failed:", err));
} else if (self instanceof ServiceWorkerGlobalScope) {
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
    self.addEventListener('fetch', (event) => {
        // 关键：不拦截跨域的资源请求，防止断网
        if (event.request.mode === 'navigate' || 
           (event.request.mode === 'same-origin' && event.request.destination === 'script')) {
            event.respondWith(
                fetch(event.request).then((response) => {
                    const newHeaders = new Headers(response.headers);
                    newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
                    newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    });
                }).catch(() => fetch(event.request)) // 降级处理
            );
        }
    });
}