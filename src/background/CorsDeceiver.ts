export const CORS_PERMISSION_SCOPE = ['blocking', 'responseHeaders', 'extraHeaders'];

export class CorsDeceiver {

    public static addCORSheaders(details: chrome.webRequest.WebResponseHeadersDetails): chrome.webRequest.BlockingResponse {
        const newHeaders = {
            responseHeaders: [
                ...details.responseHeaders,
                {
                    name: 'Access-Control-Allow-Origin',
                    value: '*',
                },
            ],
        };
        return newHeaders;
    }
}
