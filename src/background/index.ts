import { CorsDeceiver, CORS_PERMISSION_SCOPE } from './CorsDeceiver';
import { CORS_HOST_FILTER } from '../environment';

function init() {
    chrome.webRequest.onHeadersReceived.addListener(
        CorsDeceiver.addCORSheaders,
        { urls: [CORS_HOST_FILTER] },
        CORS_PERMISSION_SCOPE);
}

init();
