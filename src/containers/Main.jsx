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

        this.query = {};
        this.state = {
            bundle: {},
            activeEditor: 'code',
            shareModal: false,
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
        if (gistId) {
            StorageUtils.turnOffSession();
            Progress.show();
            GistAPIUtils.getGist(gistId, (err, gistSession) => {
                Progress.hide();
                if (err) {
                    // show special error on page
                    console.log(err);
                    return;
                }
                const { transpiledCode, error } = this._transpileCodeAndCatch(gistSession.code);
                const editorsData = this._updateEditorsData(Object.assign(gistSession, { transpiledCode, error }));
                this.setState({ editorsData });

                if (this.query.execute) {
                    setTimeout(() => this.handleRunClick(), 0);
                }
            });
        } else {
            this.checkPreviousSession();
        }
    }

    checkPreviousSession() {
        const session = StorageUtils.getSession();
        if (session) {
            const { transpiledCode, error } = this._transpileCodeAndCatch(session.code);
            const editorsData = this._updateEditorsData(Object.assign(session, { transpiledCode, error }));
            this.setState({ editorsData });
        }
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
            const gistId = this.query.gist;
            const { editorsData } = this.state;
            const fn = (err, res, isFork) => {
                Progress.hide();
                if (err) {
                    // show special error on page
                    console.log(err);
                    return;
                }

                // call hide twice for safety (investigate why once doesn't work sometimes)
                Progress.hide();
                if (!gistId || isFork) {
                    window.location.search = `gist=${res.body.id}`;
                }
            };

            this.triggerGist = false;

            if (gistId) {
                GistAPIUtils.updateGist(gistId, editorsData, status, fn);
            } else {
                GistAPIUtils.createGist(editorsData, status, fn);
            }
        } else {
            Progress.hide();
        }
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
        const { bundle, editorsData, activeEditor, shareModal } = this.state;

        return (
            <div className="main">
                <Progress.Component />

                <Header
                    height={Defaults.HEADER_HEIGHT}
                    activeEditor={activeEditor}
                    onShareClick={::this.openShareModal}
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

    _parseQuery() {
        return querystring.parse(window.location.search.slice(1));
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

    _transpileCodeAndCatch(code) {
        let transpiledCode, error
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
