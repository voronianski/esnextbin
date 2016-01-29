import React from 'react';
import Progress from 'react-progress-2';
import * as Babel from 'babel-standalone';
import querystring from 'querystring';

import Header from '../components/Header';
import Editors from '../components/Editors';
import Sandbox from '../components/Sandbox'

import * as Defaults from '../utils/DefaultsUtil';
import * as StorageUtils from '../utils/StorageUtils';
import * as GistAPIUtils from '../utils/GistAPIUtils';

class Main extends React.Component {
    constructor() {
        super();

        this.state = {
            bundle: {},
            bundling: false,
            activeEditor: 'code',
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
        window.addEventListener('message', ::this.getAuthCode, false);
        // if gist id present disable session
        const query = window.location.search.slice(1);
        const gistId = querystring.parse(query).gist;
        if (gistId) {
            StorageUtils.turnOffSession();
            GistAPIUtils.getGist(gistId, (err, res) => {
                console.log('GG', err, res);
            })
        } else {
            this.checkPreviousSession();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('message', ::this.getAuthCode);
    }

    checkPreviousSession() {
        const session = StorageUtils.getSession();
        if (session) {
            let transpiledCode;
            if (session.code) {
                transpiledCode = this._transpileCode(session.code);
            }
            const editorsData = this._updateEditorsData(Object.assign(session, { transpiledCode }));
            this.setState({ editorsData });
        }
    }

    getAuthCode(e) {
        const code = e.data;

        Progress.show();
        GistAPIUtils.getAccessToken(code, (err) => {
            if (err) {
                console.log(err);
                // show special error on page
            }
            Progress.hide();
        });
    }

    handleRunClick() {
        const bundle = this._getBundle();
        bundle && this.setState({ bundle });
    }

    handleChangeEditor(activeEditor) {
        this.setState({ activeEditor });
    }

    handleStartBundle() {
        this.progressDelay = setTimeout(() => {
            Progress.show();
        }, 100);
    }

    handleEndBundle() {
        clearTimeout(this.progressDelay);
        if (this.triggerGist) {
            const status = this.triggerGist;
            this.triggerGist = false;
            GistAPIUtils.createGist(this.state.editorsData, status, (err, res) => {
                console.log('SV', err, res);
                Progress.hide();
                if (err) {
                    return;
                }
                document.location.search = `gist=${res.body.id}`;
            });
        } else {
            Progress.hide();
        }
    }

    handleSaveGist(status) {
        console.log(status);
        if (!GistAPIUtils.isAuthorized()) {
            GistAPIUtils.authorize();
        } else {
            this.triggerGist = status;
            this.handleRunClick();
        }
    }

    handleShare() {
        console.log('todo sharing');
    }

    handleReset() {
        console.log('reset');
    }

    handleCodeChange(code) {
        StorageUtils.saveToSession('code', code);

        try {
            const transpiledCode = this._transpileCode(code);
            const editorsData = this._updateEditorsData({code, transpiledCode, error: ''});
            this.setState({ editorsData });
        } catch (error) {
            if (error._babel) {
                const editorsData = this._updateEditorsData({code, error});
                this.setState({ editorsData });
            }
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

    render() {
        const { bundle, editorsData, activeEditor } = this.state;

        return (
            <div className="main">
                <Progress.Component />

                <Header
                    height={Defaults.HEADER_HEIGHT}
                    activeEditor={activeEditor}
                    onShareClick={::this.handleShare}
                    onRunClick={::this.handleRunClick}
                    onEditorClick={::this.handleChangeEditor}
                    onSaveGistClick={::this.handleSaveGist}
                    onResetEditors={::this.handleReset}
                />

                <div className="content">
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
                        onEndBundle={::this.handleEndBundle}
                    />
                </div>
            </div>
        );
    }

    _updateEditorsData(newData) {
        return Object.assign({}, this.state.editorsData, newData);
    }

    _getBundle() {
        const { editorsData } = this.state;

        let json;
        try {
            json = JSON.parse(editorsData.json);
        } catch (error) {
            const editorsData = this._updateEditorsData({ error });
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
        return Babel.transform(code, Defaults.BABEL_OPTIONS).code
    }
}

export default Main;
