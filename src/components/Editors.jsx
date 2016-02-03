import React, { PropTypes } from 'react';
import cx from 'classnames';

import 'brace';
import 'brace/mode/jsx';
import 'brace/mode/json';
import 'brace/mode/html';
import 'brace/theme/tomorrow';
import Ace from 'react-ace';

class Editors extends React.Component {
    static propTypes = {
        active: PropTypes.oneOf(['code', 'html', 'package']),
        code: PropTypes.string.isRequired,
        html: PropTypes.string.isRequired,
        json: PropTypes.string.isRequired,
        tabSize: PropTypes.number,
        headerHeight: PropTypes.number,
        onCodeChange: PropTypes.func,
        onHTMLChange: PropTypes.func,
        onPackageChange: PropTypes.func
    };

    static defaultProps = {
        tabSize: 2,
        active: 'code',
        headerHeight: 30
    };

    constructor(props) {
        super();

        this.state = Object.assign({}, this._getDimensions(props.headerHeight));
    }

    componentDidMount() {
        this.windowWidth = window.innerWidth;
        window.addEventListener('resize', ::this.handleResize, false);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.handleResize);
    }

    handleResize() {
        if (this.windowWidth !== window.innerWidth) {
            this.windowWidth = window.innerWidth;
            this.setState(this._getDimensions(this.props.headerHeight));
        }
    }

    handleChange(handler) {
        const fn = this.props[handler];
        return value => fn && fn(value);
    }

    render() {
        const { active, code, html, json, error, tabSize } = this.props;
        const { width, height } = this.state;

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
                        onChange={this.handleChange('onCodeChange')}
                        showPrintMargin={false}
                        editorProps={{$blockScrolling: Infinity}}
                    />
                </div>
                <div className={cx('edit-html', {hide: active !== 'html'})}>
                    <Ace
                        name="htmlEditor"
                        mode="html"
                        theme="tomorrow"
                        value={html}
                        tabSize={tabSize}
                        width={width}
                        height={height}
                        onChange={this.handleChange('onHTMLChange')}
                        showPrintMargin={false}
                        editorProps={{$blockScrolling: Infinity}}
                    />
                </div>
                <div className={cx('edit-package', {hide: active !== 'package'})}>
                    <Ace
                        ref="packageEditor"
                        name="packageEditor"
                        mode="json"
                        theme="tomorrow"
                        value={json}
                        tabSize={tabSize}
                        width={width}
                        height={height}
                        onChange={this.handleChange('onPackageChange')}
                        showPrintMargin={false}
                        editorProps={{$blockScrolling: Infinity}}
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
