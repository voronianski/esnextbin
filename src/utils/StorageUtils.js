let storage;
if (typeof window.localStorage !== 'undefined') {
    storage = window.localStorage;
} else {
    console.log('Browser does not support localStorage');
}

let disabled = false;

function _coerce (value) {
    if (value.trim && value.trim() === '') {
        return value;
    }

    var num = Number(value);
    if (!isNaN(value)) {
        return num;
    }

    var _value = value.toLowerCase();
    if (_value === 'true') {
        return true;
    }
    if (_value === 'false') {
        return false;
    }

    return value;
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
    const autorun = storage.getItem('autorun');
    if (autorun) {
        session.autorun = _coerce(autorun);
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

export function cleanSession () {
    if (!storage) return;
    storage.removeItem('code');
    storage.removeItem('html');
    storage.removeItem('json');
}
