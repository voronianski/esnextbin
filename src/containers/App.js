import React from 'react';
import ReactDOM from 'react-dom';
import Mousetrap from 'mousetrap';
import querystring from 'querystring';
import Progress from 'react-progress-2';
import * as Babel from 'babel-standalone';
// import * as Babel from '@babel/standalone';
import prettier from 'prettier-standalone';

import Header from '../components/Header';
import Editors from '../components/Editors';
import Sandbox from '../components/Sandbox';

import * as Storage from '../utils/StorageUtil';
import * as GistAPI from '../utils/GistAPIUtil';
import * as Defaults from '../utils/DefaultsUtil';

const query = querystring.parse(window.location.search.slice(1));

class App extends React.Component {
  constructor() {
    super();

    const { transpiledCode, error } = this.transpileCode(Defaults.CODE);

    this.state = {
      bundle: {},
      isBundling: false,
      autorunIsOn: false,
      activeEditor: 'code',
      editorsData: {
        code: Defaults.CODE,
        html: Defaults.HTML,
        json: Defaults.PACKAGE_JSON,
        transpiledCode,
        error
      }
    };
  }

  // REACT HOOKS
  componentDidMount() {
    if (query.gist) {
      this.requestGistSession();
    } else {
      this.checkLocalSession();
    }

    this.bindKeyShortcuts();
  }

  // HEADER HANDLERS
  handleRunClick() {
    if (this.state.isBundling) {
      return;
    }

    this.generateBundle();
  }

  handlePrettierClick() {
    const code = prettier.format(this.state.editorsData.code);

    this.setState({ editorsData: this.updateEditorsData({ code }) });
  }

  handleChangeEditor(editorId) {
    this.setState({
      activeEditor: editorId
    });
  }

  handleSaveGist(status) {
    Progress.show();

    const gistId = query.gist;
    const { editorsData } = this.state;
    const onSuccess = gistData => {
      Progress.hideAll();

      if (!gistId || gistData.isFork) {
        window.location.search = `gist=${gistData.id}`;
      }
    };
    const onError = err => {
      Progress.hideAll();
      console.log(err);
    };

    if (gistId) {
      GistAPI.updateGist({ id: gistId, data: editorsData, status })
        .then(onSuccess)
        .catch(onError);
    } else {
      GistAPI.createGist({ data: editorsData, status })
        .then(onSuccess)
        .catch(onError);
    }
  }

  handleReset() {
    GistAPI.unauthorize();
    Storage.cleanSession();
    window.location.reload();
  }

  toggleAutorun() {
    const autorunIsOn = !this.state.autorunIsOn;

    Storage.saveToSession('autorun', autorunIsOn);
    this.setState({ autorunIsOn });
  }

  // EDITOR HANDLERS
  handleCodeChange(code) {
    clearTimeout(this.codeErrorDelay);
    Storage.saveToSession('code', code);

    const { transpiledCode, error } = this.transpileCode(code);

    if (error) {
      this.codeErrorDelay = setTimeout(() => {
        this.setState({ editorsData: this.updateEditorsData({ error }) });
      }, 1000);
    }

    this.setState({
      editorsData: this.updateEditorsData({
        code,
        transpiledCode,
        error: ''
      })
    });

    if (this.state.autorunIsOn) {
      clearTimeout(this.autorunDelay);
      this.autorunDelay = setTimeout(() => this.generateBundle(), 1000);
    }
  }

  handleHTMLChange(html) {
    Storage.saveToSession('html', html);
    this.setState({
      editorsData: this.updateEditorsData({ html, error: '' })
    });
  }

  handlePackageChange(json) {
    Storage.saveToSession('json', json);

    this.setState({
      editorsData: this.updateEditorsData({ json, error: '' })
    });
  }

  // SANDBOX HANDLERS
  handleDependencies(modules) {
    const { bundle } = this.state;
    const dependencies = modules.reduce((memo, mod) => {
      memo[mod.name] = mod.version;

      return memo;
    }, {});
    const json = JSON.stringify({ ...bundle.package, dependencies }, null, 2);

    this.setState({
      editorsData: this.updateEditorsData({ json })
    });
  }

  handleStartBundle() {
    if (this.state.isBundling) {
      return;
    }

    this.progressDelay = setTimeout(() => {
      this.setState({ isBundling: true });
      Progress.show();
    }, 100);
  }

  handleEndBundle() {
    clearTimeout(this.progressDelay);

    this.finishBundling();
  }

  handleErrorBundle(error) {
    console.log(error);

    this.setState({
      editorsData: this.updateEditorsData({ error })
    });
    this.finishBundling();
  }

  // HELPERS
  requestGistSession() {
    const gistId = query.gist;
    const sha = query.rev || query.sha;
    const exec = query.execute || query.exec;

    Storage.turnOffSession();
    Progress.show();

    GistAPI.getGist({ id: gistId, sha })
      .then(gistData => {
        Progress.hide();

        const { transpiledCode, error } = this.transpileCode(gistData.code);

        this.setState({
          editorsData: this.updateEditorsData({
            ...gistData,
            transpiledCode,
            error
          })
        });

        if (exec) {
          setTimeout(() => this.generateBundle(), 0);
        }
      })
      .catch(err => {
        Progress.hide();

        if (err.status === 404) {
          return this.setState({
            editorsData: this.updateEditorsData({ error: 'Gist was not found' })
          });
        }

        if (err.message === 'No index.js in the gist') {
          return this.setState({
            editorsData: this.updateEditorsData({ error: err.message })
          });
        }

        console.log(err);
      });
  }

  checkLocalSession() {
    const session = Storage.getSession();

    if (!session) {
      return;
    }

    const newState = {};
    const { autorun, ...editorsData } = session;

    if (autorun) {
      newState.autorunIsOn = autorun;
    }

    const { transpiledCode, error } = this.transpileCode(session.code);

    newState.editorsData = this.updateEditorsData({
      ...editorsData,
      transpiledCode,
      error
    });

    this.setState(newState);
  }

  bindKeyShortcuts() {
    const mousetrap = Mousetrap(ReactDOM.findDOMNode(this));

    mousetrap.bind(['command+e', 'ctrl+e'], e => {
      e.preventDefault();
      this.handleRunClick();
    });

    mousetrap.bind(['command+s', 'ctrl+s'], e => {
      e.preventDefault();
      this.handleSaveGist('public');
    });

    mousetrap.bind(['ctrl+alt+f'], e => {
      e.preventDefault();
      this.handlePrettierClick();
    });

    mousetrap.bind(['command+[', 'command+]'], e => {
      e.preventDefault();
    });
  }

  generateBundle() {
    const { editorsData } = this.state;

    let json;
    try {
      json = JSON.parse(editorsData.json);
    } catch (err) {
      return this.setState({
        editorsData: this.updateEditorsData({ error: err.messsage })
      });
    }

    const bundle = {
      code: editorsData.transpiledCode,
      raw: editorsData.code,
      html: editorsData.html,
      package: json
    };

    this.setState({ bundle });
  }

  finishBundling() {
    Progress.hideAll();
    this.setState({ isBundling: false });
  }

  updateEditorsData(newData = {}) {
    return { ...this.state.editorsData, ...newData };
  }

  transpileCode(code) {
    const result = {
      transpiledCode: '',
      error: ''
    };

    if (code) {
      try {
        result.transpiledCode = Babel.transform(
          code,
          Defaults.BABEL_OPTIONS
        ).code;
      } catch (err) {
        const error = err.message
          ? err.message.replace('\n', '')
          : 'Error while transpilation';

        result.error = error;
        result.transpiledCode = `/*
${error.messsage}
*/`;
      }
    }

    return result;
  }

  // TEMPLATE
  render() {
    const {
      bundle,
      isBundling,
      autorunIsOn,
      editorsData,
      activeEditor
    } = this.state;

    return (
      <div className="main">
        <Progress.Component />

        <Header
          height={Defaults.HEADER_HEIGHT}
          activeEditor={activeEditor}
          isBundling={isBundling}
          autorunIsOn={autorunIsOn}
          onRunClick={::this.handleRunClick}
          onPrettierClick={::this.handlePrettierClick}
          onEditorClick={::this.handleChangeEditor}
          onSaveGistClick={::this.handleSaveGist}
          onResetEditors={::this.handleReset}
          onToggleAutorun={::this.toggleAutorun}
        />

        <div className="content" tabIndex="-1">
          <Editors
            active={activeEditor}
            code={editorsData.code}
            html={editorsData.html}
            json={editorsData.json}
            error={editorsData.error}
            headerHeight={Defaults.HEADER_HEIGHT}
            onCodeChange={::this.handleCodeChange}
            onHTMLChange={::this.handleHTMLChange}
            onPackageChange={::this.handlePackageChange}
          />

          <Sandbox
            bundle={bundle}
            onModules={::this.handleDependencies}
            onStartBundle={::this.handleStartBundle}
            onErrorBundle={::this.handleErrorBundle}
            onEndBundle={::this.handleEndBundle}
          />
        </div>
      </div>
    );
  }
}

export default App;
