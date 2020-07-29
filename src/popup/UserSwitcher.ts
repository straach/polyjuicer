import { IUser } from './models/User';
import { ChromePromiseAPI } from './utils/ChromePromiseApi';
import Cookie = chrome.cookies.Cookie;
import { TokenProvier, AuthServiceResponse } from './utils/TokenProvider';

const JWT_HOLDING_COOKIE_NAME = 'my_app_cookie';
const JWT_HOLDING_COOKIE_NAME_DUPLICATE = 'my_app_other_cookie';
const SESSION_COOKIE = 'symfony';

export class UserSwitcher {

    constructor(private user: IUser) { }

    public execute() {
        return this.getCurrentTabCookies([JWT_HOLDING_COOKIE_NAME, JWT_HOLDING_COOKIE_NAME_DUPLICATE])
            .then((cookies: Cookie[]) => this.switchLoginCookies(cookies, this.user))
            .then(() => this.getCurrentTabCookies([SESSION_COOKIE]))
            .then(this.removeCookies);
    }

    private switchLoginCookies(cookies: Cookie[], user: IUser) {
        return TokenProvier.getToken(user)
            .then((token: AuthServiceResponse) => {
                return Promise.all(cookies.map((c => this.switchOneCookie(c, token))));
            });
    }

    private switchOneCookie(cookie: Cookie, token: AuthServiceResponse) {
        return ChromePromiseAPI.removeOneCookieByNameAndUrl(cookie)
            .then(() => {
                cookie.value = token.token;
                ChromePromiseAPI.setOneCookie(cookie);
            });
    }

    private getCurrentTabCookies(cookieNames: string[]) {
        return ChromePromiseAPI.getCurrentTabHostname()
            .then(ChromePromiseAPI.getCookiesByHostnameAndName(cookieNames));
    }

    private removeCookies(cookies: Cookie[]) {
        return Promise.all(cookies.map(ChromePromiseAPI.removeOneCookieByNameAndUrl));
    }

}
