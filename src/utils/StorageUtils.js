let storage;
if (typeof window.localStorage !== 'undefined') {
    storage = window.localStorage;
} else {
    console.log('Browser does not support localStorage');
}

let disabled = false;

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
    if (!storage || disabled) return;
    storage.setItem(key, value);
}

export function turnOnSession () {
    disabled = false;
}

export function turnOffSession () {
    disabled = true;
}
