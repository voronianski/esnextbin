import request from 'superagent';
import cookies from 'cookies-js';

import config from '../config';
import * as DefaultsUtil from './DefaultsUtil';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_GISTS_API = 'https://api.github.com/gists';
const COOKIE_TTL = 60 * 60 * 24 * 30 * 6; // 6 months

let actionState = { callback: () => {} };

window.addEventListener('message', _getAuthCode, false);

function _getAuthCode(e) {
  const code = e.data;

  if (code) {
    getAccessToken(code, actionState.callback);
  }
}

export function authorize(callback) {
  if (callback) {
    actionState.callback = callback;
  }

  window.open(
    `${GITHUB_AUTH_URL}?client_id=${config.GITHUB_CLIENT_ID}&scope=gist`
  );
}

export function unauthorize() {
  cookies.expire('oauth_token');
}

export function getAccessToken(code, callback) {
  if (!code) {
    const err = new Error(
      'Impossible to get access token, code is not present'
    );

    return callback(err);
  }

  request
    .get(config.GATEKEEPER)
    .query({ code })
    .end((err, res) => {
      if (err) {
        callback(err);
      }

      const token = res.body.token;

      cookies.set('oauth_token', token, { expires: COOKIE_TTL });
      callback(null, token);
    });
}

export function isAuthorized() {
  return cookies.get('oauth_token') || false;
}

export function createGist(editorsData, status, callback, isFork = false) {
  const data = getGistDataFormat(editorsData, status);
  const makeRequest = () => {
    const access_token = cookies.get('oauth_token');
    const onEnd = (err, res) => {
      if (err) {
        if (err.status === 401) {
          return authorize(makeRequest);
        }

        return callback(err);
      }

      callback(err, res, isFork);
    };

    if (!access_token) {
      return authorize(makeRequest);
    }

    request
      .post(GITHUB_GISTS_API)
      .query({ access_token })
      .send(data)
      .end(onEnd);
  };
  makeRequest();
}

export function updateGist(id, editorsData, status, callback) {
  const data = getGistDataFormat(editorsData, status, id);
  const makeRequest = () => {
    const access_token = cookies.get('oauth_token');
    const onEnd = (err, res) => {
      if (err) {
        if (err.status === 401) {
          return authorize(makeRequest);
        }

        if (err.status === 404) {
          return createGist(editorsData, status, callback, 'fork');
        }

        return callback(err);
      }

      callback(err, res);
    };

    if (!access_token) {
      return authorize(makeRequest);
    }

    request
      .patch(`${GITHUB_GISTS_API}/${id}`)
      .query({ access_token })
      .send(data)
      .end(onEnd);
  };

  makeRequest();
}

export function getGist({ id, sha }, callback) {
  const makeRequest = () => {
    const access_token = cookies.get('oauth_token');
    const onEnd = (err, res) => {
      if (err) {
        if (err.status === 401) {
          return authorize(makeRequest);
        }

        return callback(err);
      }

      const editorsData = getEditorsDataFromGist(res.body.files);

      if (!editorsData) {
        return callback(new Error('No index.js in the gist'));
      }

      callback(null, editorsData, res);
    };

    let url = `${GITHUB_GISTS_API}/${id}`;
    if (sha) {
      url += `/${sha}`;
    }

    request
      .get(url)
      .query({ access_token })
      .end(onEnd);
  };

  makeRequest();
}

export function getGistDataFormat(data = {}, status = 'public', gistId) {
  const markdownLink = gistId
    ? `http://esnextb.in/?gist=${gistId}`
    : 'http://esnextb.in';

  return {
    description: 'esnextbin sketch',
    public: status === 'public',
    files: {
      'index.js': {
        content: data.code.trim() || DefaultsUtil.CODE
      },
      'transpiled.js': {
        content: data.transpiledCode.trim() || DefaultsUtil.CODE
      },
      'index.html': {
        content: data.html.trim() || DefaultsUtil.HTML
      },
      'package.json': {
        content: data.json.trim() || DefaultsUtil.PACKAGE_JSON
      },
      'esnextbin.md': {
        content: `made with [esnextbin](${markdownLink})`
      }
    }
  };
}

export function getEditorsDataFromGist(files) {
  if (!files || !files['index.js']) {
    return;
  }

  return {
    code: files['index.js'].content,
    html:
      (files['index.html'] && files['index.html'].content) || DefaultsUtil.HTML,
    json:
      (files['package.json'] && files['package.json'].content) ||
      DefaultsUtil.PACKAGE_JSON
  };
}
