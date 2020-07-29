import { ALL_SUBDOMAIN_COOKIE_URL } from '../../environment';

export class ChromePromiseAPI {

    public static getCurrentTabHostname() {
        return new Promise((resolve, reject) => {
            let hostname: string = null;
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                if (tabs.length < 1) {
                    reject('could not get tabs hostname');
                    return;
                }
                const url = tabs[0].url;
                try {
                    hostname = new URL(url).hostname;
                    console.log(`hostname is: ${hostname}`);
                    resolve(hostname);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    public static getCookiesByHostnameAndName(cookieNames: string[]) {
        return (hostname: string) => {
            const hostnameFilter = ChromePromiseAPI.fixAllSubdomainCookieHostname(hostname);
            console.log('Cookie hostname is: ', hostnameFilter);
            return new Promise((resolve) => {
                chrome.cookies.getAll({ domain: hostnameFilter }, (cookies: chrome.cookies.Cookie[]) => {
                    console.log(`All cookies for hostname ${hostnameFilter}: `, cookies);
                    const result = cookies.filter((cookie: chrome.cookies.Cookie) => {
                        return cookieNames.includes(cookie.name);
                    });
                    console.log('Filtered cookies:', result);
                    resolve(result);
                });
            });
        };
    }

    private static fixAllSubdomainCookieHostname(hostname: string) {
        let hostnameFilter = hostname;
        if (hostname.indexOf(ALL_SUBDOMAIN_COOKIE_URL) === 0) {
            hostnameFilter = ALL_SUBDOMAIN_COOKIE_URL.substring(1);
        }
        return hostnameFilter;
    }

    public static removeOneCookieByNameAndUrl(cookie: chrome.cookies.Cookie) {
        return new Promise((resolve) => {
            const detail = {
                name: cookie.name,
                url: ChromePromiseAPI.urlFromCookie(cookie),
            };
            console.log('Using details for deleting: ', detail);
            chrome.cookies.remove(detail, (details: chrome.cookies.Details) => {
                console.log(`removing: ${cookie.name}`, details);
                resolve(details);
            });
        });
    }

    public static setOneCookie(cookie: chrome.cookies.Cookie) {
        console.log(`setting ${cookie.name} for ${cookie.domain} and url ${ChromePromiseAPI.urlFromCookie(cookie)}`);
        return new Promise((resolve) => {
          const detail: chrome.cookies.SetDetails = {
                value: cookie.value,
                domain: cookie.domain,
                name: cookie.name,
                url: ChromePromiseAPI.urlFromCookie(cookie),
                storeId: cookie.storeId,
                expirationDate: cookie.expirationDate,
                path: cookie.path,
                httpOnly: cookie.httpOnly,
                secure: cookie.secure,
            };
            resolve();
            chrome.cookies.set(detail, resolve);
        });
    }

    private static urlFromCookie(cookie: chrome.cookies.Cookie) {
        if (cookie.domain.startsWith('.')) {
            return `http${cookie.secure ? 's' : ''}://${cookie.domain.substring(1)}${cookie.path}`;
        }
        return `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
    }

}
