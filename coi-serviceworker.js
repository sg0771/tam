if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(window.document.currentScript.src).then(reg => {
        // 如果 SW 已激活但未控制页面（通常是首次加载），则刷新
        if (reg.active && !navigator.serviceWorker.controller) {
            window.location.reload();
        }
    });
} else if (self instanceof ServiceWorkerGlobalScope) {
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener('fetch', (event) => {
        // 核心：仅拦截并处理需要注入 Header 的请求
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.status === 0) return response; // 跨域透明请求不处理

                    const newHeaders = new Headers(response.headers);
                    newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
                    newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    });
                })
                .catch(() => {
                    // 容错处理：如果拦截失败，尝试原样返回
                    return fetch(event.request);
                })
        );
    });
}