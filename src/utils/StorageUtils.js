let storage;
if (typeof window.localStorage !== 'undefined') {
    storage = window.localStorage;
} else {
    console.log('Browser does not support localStorage');
}

export function getSession () {
    if (!storage) return;
    let session = {};

    const code = storage.getItem('code');
    if (code) {
        session.code = code;
    }
    const html = storage.getItem('html');
    if (html) {
        session.html = html;
    }
    const json = storage.getItem('json');
    if (json) {
        session.json = json;
    }

    // session is empty :(
    if (!Object.keys(session).length) return;

    return session;
}

export function saveToSession (key, value) {
    if (!storage) return;
    storage.setItem(key, value);
}
