import React from 'react';
import ReactDOM from 'react-dom';
import Mousetrap from 'mousetrap';
import Progress from 'react-progress-2';
import * as Babel from 'babel-standalone';
import querystring from 'querystring';
import prettier from 'prettier-standalone';

import Header from '../components/Header';
import Editors from '../components/Editors';
import Sandbox from '../components/Sandbox';

import * as Defaults from '../utils/DefaultsUtil';
import * as StorageUtils from '../utils/StorageUtils';
import * as GistAPIUtils from '../utils/GistAPIUtils';

class Main extends React.Component {
  constructor() {
    super();

    this.query = {};
    this.state = {
      bundle: {},
      bundling: false,
      activeEditor: 'code',
      shareModal: false,
      autorunIsOn: false,
      editorsData: {
        code: Defaults.CODE,
        transpiledCode: this._transpileCode(Defaults.CODE),
        html: Defaults.HTML,
        json: Defaults.PACKAGE_JSON,
        error: void 0
      }
    };
  }

  componentDidMount() {
    this.query = this._parseQuery();

    const gistId = this.query.gist;
    const sha = this.query.rev || this.query.sha;
    if (gistId) {
      StorageUtils.turnOffSession();
      Progress.show();
      GistAPIUtils.getGist({id: gistId, sha}, (err, gistSession) => {
        Progress.hide();
        if (err) {
          console.log(err); // show special error on page
          return;
        }
        const { transpiledCode, error } = this._transpileCodeAndCatch(gistSession.code);
        const editorsData = this._updateEditorsData(Object.assign(gistSession, { transpiledCode, error }));
        this.setState({ editorsData });

        if (this.query.execute || this.query.exec) {
          setTimeout(() => this.handleRunClick(), 0);
        }
      });
    } else {
      this.checkPreviousSession();
    }

    this.bindKeyShortcuts();
  }

  checkPreviousSession() {
    const session = StorageUtils.getSession();
    if (session) {
      const newState = {};
      const { autorun, ...editorsDataSession } = session;
      if (autorun) {
        newState.autorunIsOn = autorun;
      }
      const { transpiledCode, error } = this._transpileCodeAndCatch(session.code);
      newState.editorsData = this._updateEditorsData(Object.assign(editorsDataSession, { transpiledCode, error }));
      this.setState(newState);
    }
  }

  bindKeyShortcuts() {
    const mousetrap = Mousetrap(ReactDOM.findDOMNode(this));

    mousetrap.bind(['command+e', 'ctrl+e'], (e) => {
      e.preventDefault();
      this.handleRunClick();
    });

    mousetrap.bind(['command+s', 'ctrl+s'], (e) => {
      e.preventDefault();
      this.handleSaveGist('public');
    });

    mousetrap.bind(['ctrl+alt+f'], (e) => {
      e.preventDefault();
      this.handlePrettierClick();
    });
  }

  handleRunClick() {
    if (this.state.bundling) {
      return;
    }

    const bundle = this._getBundle();

    bundle && this.setState({ bundle });
  }

  handlePrettierClick() {
    const code = prettier.format(this.state.editorsData.code);
    const editorsData = this._updateEditorsData({ code });

    this.setState({ editorsData });
  }

  handleChangeEditor(activeEditor) {
    this.setState({ activeEditor });
  }

  handleStartBundle() {
    if (this.state.bundling) {
      return;
    }

    this.progressDelay = setTimeout(() => {
      this.setState({bundling: true});
      Progress.show();
    }, 100);
  }

  handleEndBundle() {
    clearTimeout(this.progressDelay);

    if (this.triggerGist) {
      const status = this.triggerGist;
      const gistId = this.query.gist;
      const { editorsData } = this.state;
      const fn = (err, res, isFork) => {
        Progress.hideAll();
        if (err) {
          console.log(err); // show special error on page
          return;
        }

        if (!gistId || isFork) {
          window.location.search = `gist=${res.body.id}`;
        }
        this.finishHandleEndBundle();
      };

      this.triggerGist = false;

      if (gistId) {
        GistAPIUtils.updateGist(gistId, editorsData, status, fn);
      } else {
        GistAPIUtils.createGist(editorsData, status, fn);
      }
    } else {
      this.finishHandleEndBundle();
    }
  }

  finishHandleEndBundle() {
    Progress.hideAll();
    this.setState({bundling: false});
  }

  handleSaveGist(status) {
    Progress.show();

        // talk with gist API on endBundle event of sandbox
    this.triggerGist = status;
    this.handleRunClick();
  }

  openShareModal() {
    this.setState({shareModal: true});
  }

  closeShareModal() {
    this.setState({shareModal: false});
  }

  handleReset() {
    GistAPIUtils.unauthorize();
    StorageUtils.cleanSession();
    window.location.reload();
  }

  toggleAutorun() {
    const autorunIsOn = !this.state.autorunIsOn;

    StorageUtils.saveToSession('autorun', autorunIsOn);
    this.setState({ autorunIsOn });
  }

  autorunOnChange() {
    if (this.autorunDelay) {
      clearTimeout(this.autorunDelay);
    }

    this.autorunDelay = setTimeout(() => {
      this.handleRunClick();
    }, 1000);
  }

  handleCodeChange(code) {
    StorageUtils.saveToSession('code', code);

    clearTimeout(this.errorDelay);
    const { transpiledCode, error } = this._transpileCodeAndCatch(code);
    if (error) {
      this.errorDelay = setTimeout(() => {
        const editorsData = this._updateEditorsData({error});
        this.setState({ editorsData });
      }, 1000);
    }
    const editorsData = this._updateEditorsData({code, transpiledCode, error: ''});
    this.setState({ editorsData });

    if (this.state.autorunIsOn) {
      this.autorunOnChange();
    }
  }

  handleHTMLChange(html) {
    StorageUtils.saveToSession('html', html);

    const editorsData = this._updateEditorsData({html, error: ''});
    this.setState({ editorsData });
  }

  handlePackageChange(json) {
    StorageUtils.saveToSession('json', json);

    const editorsData = this._updateEditorsData({json, error: ''});
    this.setState({ editorsData });
  }

  handleDependencies(modules) {
    const { bundle } = this.state;
    const updatedPackage = Object.assign({}, bundle.package, {
      dependencies: modules.reduce((memo, mod) => {
        memo[mod.name] = mod.version;
        return memo;
      }, {})
    });
    const editorsData = this._updateEditorsData({
      json: JSON.stringify(updatedPackage, null, 2)
    });

    this.setState({ editorsData });
  }

  handleErrorBundle(err) {
    console.log(err); // maybe show some popup or notification here?
    this.finishHandleEndBundle();
  }

  render() {
    const { bundle, editorsData, activeEditor, autorunIsOn, bundling } = this.state;

    return (
      <div className="main">
        <Progress.Component />

        <Header
          height={Defaults.HEADER_HEIGHT}
          activeEditor={activeEditor}
          isBundling={bundling}
          autorunIsOn={autorunIsOn}
          onShareClick={::this.openShareModal}
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

  _parseQuery() {
    return querystring.parse(window.location.search.slice(1));
  }

  _updateEditorsData(newData) {
    return Object.assign({}, this.state.editorsData, newData);
  }

  _getBundle() {
    let { editorsData } = this.state;

    let json;
    try {
      json = JSON.parse(editorsData.json);
    } catch (error) {
      editorsData = this._updateEditorsData({ error });
      this.setState({ editorsData });
      return;
    }

    return {
      code: editorsData.transpiledCode,
      raw: editorsData.code,
      html: editorsData.html,
      package: json
    };
  }

  _transpileCode(code) {
    return Babel.transform(code, Defaults.BABEL_OPTIONS).code;
  }

  _transpileCodeAndCatch(code) {
    let transpiledCode;
    let error;

    if (code) {
      try {
        transpiledCode = this._transpileCode(code);
      } catch (err) {
        if (err._babel) {
          transpiledCode = `/*
${err.message || 'Error while transpilation'}
*/`;
          error = err;
        }
      }
    }
    return { transpiledCode, error };
  }
}

export default Main;
