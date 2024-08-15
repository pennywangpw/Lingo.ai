
(async () => {
    const { default: fetch, Headers, Request, Response } = await import('node-fetch');
    globalThis.fetch = fetch;
    globalThis.Headers = Headers;
    globalThis.Request = Request;
    globalThis.Response = Response;
})();
