import React, { PropTypes } from 'react';
import cx from 'classnames';
import * as Babel from 'babel-standalone';

import 'brace';
import 'brace/mode/jsx';
import 'brace/mode/json';
import 'brace/mode/html';
import 'brace/theme/tomorrow';
import Ace from 'react-ace';

const welcomeCodeText =
`// write ES2015 code and import some stuff from npm
// and bin will run your program automagically`;
const welcomeHTMLText =
`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>ESNext Bin Sketch</title>
  <!-- put additional styles and scripts here -->
</head>
<body>
  <!-- put markup and other contents here -->
</body>
</html>`;
const defaultPackage = `{
    "name": "esnextbin-sketch",
    "version": "0.0.0"
}`;
const tabSize = 2;

const babelOptions = { presets: ['es2015', 'react', 'stage-0'] };

class Editors extends React.Component {
    static propTypes = {
        active: PropTypes.oneOf(['code', 'html', 'package']),
        headerHeight: PropTypes.number
    };

    static defaultProps = {
        active: 'code',
        headerHeight: 30
    };

    constructor(props) {
        super();

        this.state = Object.assign({
            code: welcomeCodeText,
            html: welcomeHTMLText,
            package: defaultPackage,
            transformedCode: '',
            error: ''
        }, this._getDimensions(props.headerHeight));
    }

    componentDidMount() {
        window.addEventListener('resize', ::this.handleResize, false);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.handleResize);
    }

    handleResize() {
        this.setState(this._getDimensions(this.props.headerHeight));
    }

    handleCodeChange(value) {
        try {
            const transformedCode = Babel.transform(value, babelOptions).code;
            this.setState({code: value, error: '', transformedCode});
        } catch (error) {
            error._babel && this.setState({code: value, error});
        }
    }

    handleHTMLChange(value) {
        try {
            this.setState({html: value, error: ''});
        } catch (error) {
            this.setState({ error });
        }
    }

    handlePackageChange(value) {
        try {
            this.setState({package: value, error: ''});
        } catch (error) {
            this.setState({ error });
        }
    }

    getBundle() {
        let json = {};
        try {
            json = JSON.parse(this.state.package);
        } catch (error) {
            this.setState({ error });
        }

        return {
            code: this.state.transformedCode,
            html: this.state.html,
            package: json
        };
    }

    render() {
        const { active } = this.props;
        const { width, height, code, html, error } = this.state;

        return (
            <div className="editorbox">
                <div className={cx('edit-code', {hide: active !== 'code'})}>
                    <Ace
                        name="codeEditor"
                        mode="jsx"
                        theme="tomorrow"
                        value={code}
                        tabSize={tabSize}
                        width={width}
                        height={height}
                        onChange={::this.handleCodeChange}
                        showPrintMargin={false}
                        editorProps={{$blockScrolling: true}}
                    />
                </div>
                <div className={cx('edit-html', {hide: active !== 'html'})}>
                    <Ace
                        name="headEditor"
                        mode="html"
                        theme="tomorrow"
                        value={html}
                        tabSize={tabSize}
                        width={width}
                        height={height}
                        onChange={::this.handleHTMLChange}
                        showPrintMargin={false}
                        editorProps={{$blockScrolling: true}}
                    />
                </div>
                <div className={cx('edit-package', {hide: active !== 'package'})}>
                    <Ace
                        name="bodyEditor"
                        mode="json"
                        theme="tomorrow"
                        value={this.state.package}
                        tabSize={tabSize}
                        width={width}
                        height={height}
                        onChange={::this.handlePackageChange}
                        showPrintMargin={false}
                        editorProps={{$blockScrolling: true}}
                    />
                </div>

                {error ? (
                    <div className="code-error">{error.message}</div>
                ) : <span />}
            </div>
        );
    }

    _getDimensions(headerHeight) {
        return {
            width: `${window.innerWidth / 2}px`,
            height: `${window.innerHeight - headerHeight}px`
        };
    }
}

export default Editors;
