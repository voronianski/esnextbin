import request from 'superagent';
import cookies from 'cookies-js';
import config from '../config';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_GISTS_API = 'https://api.github.com/gists';
const COOKIE_TTL = 60 * 60 * 24 * 30 // 30 days

export function authorize () {
    window.open(`${GITHUB_AUTH_URL}?client_id=${config.GITHUB_CLIENT_ID}&scope=gist`);
}

export function getAccessToken (code, callback) {
    if (!code) {
        const err = new Error('Impossible to get access token, code is not present');
        return callback(err);
    }
    request
        .get(config.GATEKEEPER)
        .query({ code })
        .end((err, res) => {
            if (err) {
                callback(err);
            }

            const token = res.text;
            cookies.set('oauth_token', token, {expires: COOKIE_TTL});
            callback(null);
        })
}

export function isAuthorized () {
    return cookies.get('oauth_token') || false;
}

export function createGist (editorsData, status, callback) {
    const data = getGistDataFormat(editorsData, status);
    const access_token = cookies.get('oauth_token');
    request
        .post(GITHUB_GISTS_API)
        .query({ access_token })
        .send(data)
        .end((err, res) => {
            callback(err, res);
        });
}

export function updateGist (id, editorsData, callback) {
    const access_token = cookies.get('oauth_token');
    request
        .patch(`${GITHUB_GISTS_API}/${id}`)
        .query({ access_token })
        .send(data)
        .end((err, res) => {
            callback(err, res);
        });
}

export function getGist (id, callback) {
    const access_token = cookies.get('oauth_token');
    request
        .get(`${GITHUB_GISTS_API}/${id}`)
        .query({ access_token })
        .end((err, res) => {
            callback(err, res);
        });
}

export function getGistDataFormat (data = {}, status = 'public') {
    return {
        'description': 'esnextbin sketch',
        'public': status === 'public',
        'files': {
            'index.js':  {
                'content': data.code
            },
            'transpiled.js': {
                'content': data.transpiledCode
            },
            'index.html': {
                'content': data.html
            },
            'package.json': {
                'content': data.json
            },
            'esnextbin.md': {
                'content': 'made with [esnextbin](http://esnextb.in)'
            }
        }
    }
}
