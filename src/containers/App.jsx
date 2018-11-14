/*
  new version of the app container
  handler descriptions:

  ▶︎ RUN CODE -

  Actions ▼
  RUN PRETTIER -
  SAVE PUBLIC GIST -
  SAVE PRIVATE GIST -
  ENABLE AUTORUN -
  CLEAN SESSION -

  state {
    isBundling: Bool,
    isSaving: Bool,
    autorunIsOn: Bool,
    activeEditor: 'code'|'html'|'package',
    editorsData: {
      code: String,
      transpiledCode: String,
      html: String,
      json: String,
      error: String
    }
  }
*/

import React from 'react';
import Progress from 'react-progress-2';
import * as Babel from '@babel/standalone';

import Header from '../components/Header';
import Editors from '../components/Editors';
import Sandbox from '../components/Sandbox';

import * as Defaults from '../utils/DefaultsUtil';

class App extends React.Component {
  constructor() {
    super();

    this.query = {};
    this.state = {
      bundle: {},
      bundling: false,
      autorunIsOn: false,
      activeEditor: 'code',
      editorsData: {
        code: Defaults.CODE,
        transpiledCode: this.transpileCode(Defaults.CODE),
        html: Defaults.HTML,
        json: Defaults.PACKAGE_JSON,
        error: ''
      }
    };
  }

  transpileCode(code) {
    return Babel.transform(code, Defaults.BABEL_OPTIONS).code;
  }

  handleRunClick() {}

  handlePrettierClick() {}

  handleChangeEditor() {}

  handleSaveGist() {}

  handleReset() {}

  toggleAutorun() {}

  render() {
    const {
      bundle,
      bundling,
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
          isBundling={bundling}
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
