import React from 'react';

import Header from '../components/Header';
import Editors from '../components/Editors';
import Sandbox from '../components/Sandbox'

const HEADER_HEIGHT = 38;

class Main extends React.Component {
    constructor() {
        super();
        this.state = {
            bundle: {},
            activeEditor: 'code'
        };
    }

    handleRunClick() {
        const bundle = this.refs.editors.getBundle();
        this.setState({ bundle });
    }

    handleChangeEditor(activeEditor) {
        this.setState({ activeEditor });
    }

    render() {
        const { bundle, activeEditor } = this.state;

        return (
            <div className="main">
                <Header
                    height={HEADER_HEIGHT}
                    activeEditor={activeEditor}
                    onRunClick={::this.handleRunClick}
                    onEditorClick={::this.handleChangeEditor}
                />

                <div className="content">
                    <Editors
                        ref="editors"
                        active={activeEditor}
                        headerHeight={HEADER_HEIGHT}
                    />

                    <Sandbox
                        bundle={bundle}
                        onStartBundle=""
                        onEndBundle=""
                    />
                </div>
            </div>
        );
    }
}

export default Main;
