import React, { PropTypes } from 'react';
import cx from 'classnames';

class Header extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        activeEditor: PropTypes.string,
        isBundling: PropTypes.bool,
        onRunClick: PropTypes.func.isRequired,
        onEditorClick: PropTypes.func,
        onShareClick: PropTypes.func,
        onSaveGistClick: PropTypes.func,
        onResetEditors: PropTypes.func,
        onToggleAutorun: PropTypes.func
    };

    static defaultProps = {
        height: 38,
        activeEditor: 'code'
    };

    constructor() {
        super();

        this.buttons = [
            {id: 'code', text: 'code'},
            {id: 'html', text: 'html'},
            {id: 'package', text: 'package.json'}
        ];

        this.state = {
            dropdownVisible: false
        };
    }

    onChangeEditorTo(editor) {
        const { onEditorClick } = this.props;
        return e => {
            e.preventDefault();
            onEditorClick && onEditorClick(editor, e);
        };
    }

    showDropdown() {
        if (this.props.isBundling) return;
        this.setState({dropdownVisible: true});
    }

    hideDropdown() {
        this.setState({dropdownVisible: false});
    }

    saveGist(status) {
        const { onSaveGistClick } = this.props;
        return e => {
            e.preventDefault();
            this.hideDropdown();
            onSaveGistClick && onSaveGistClick(status);
        };
    }

    click(handler) {
        const fn = this.props[handler];
        return e => {
            e.preventDefault();
            this.hideDropdown();
            fn && fn();
        }
    }

    render() {
        const { height, activeEditor, isBundling, autorunIsOn, onRunClick } = this.props;
        const { dropdownVisible } = this.state;

        return (
            <header className="clearfix bg-yellow relative" style={{ height }}>
                <div className="left">
                    <a href="/" className="caps regular btn py1 m0 logo">
                        <img src="assets/js.svg" width="20" className="inline-block left" />
                        <span className="inline-block align-middle left text">ESNextBin</span>
                        <sup>beta</sup>
                    </a>
                </div>

                <div className="editor-buttons-group center absolute top-0 left-0 right-0 bottom-0 clearfix h6 black">
                    <div>
                        {this.buttons.map((b, i) => {
                            const isActive = activeEditor === b.id;
                            return (
                                <button
                                    key={b.id}
                                    type="button"
                                    className={cx('btn btn-small regular caps', {
                                        'bg-black': isActive,
                                        'btn-primary': isActive,
                                        'btn-outline': !isActive,
                                        'bg-yellow': !isActive,
                                        'rounded-left': i === 0,
                                        'not-rounded': i === 1,
                                        'rounded-right': i === 2,
                                        'border-left-0': i !== 0
                                    })}
                                    onClick={this.onChangeEditorTo(b.id)}
                                >
                                    {b.id}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="right">
                    <button
                        type="button"
                        className="left btn btn-primary btn-small h6 caps regular rounded bg-fuchsia run-btn"
                        onClick={onRunClick}
                        disabled={isBundling}
                    >
                        &#9654; Execute
                    </button>

                    <div className="relative inline-block actions-dropdown">
                        <button
                            type="button"
                            className="btn btn-outline black btn-small h6 caps regular"
                            onClick={::this.showDropdown}
                            disabled={isBundling}
                        >
                            Actions
                        </button>
                        <div className={cx('fixed top-0 right-0 bottom-0 left-0', {hide: !dropdownVisible})} onClick={::this.hideDropdown} />
                        <div className="absolute right-0 mt1 nowrap white bg-black rounded h6 caps actions-dropdown-items" style={{visibility: dropdownVisible ? 'visible' : 'hidden'}}>
                            <a href="#!" className="btn block" onClick={this.saveGist('public')}>Save Gist</a>
                            <a href="#!" className="btn block" onClick={this.saveGist('private')}>Save Private Gist</a>
                            <a href="#!" className="btn block" onClick={this.click('onToggleAutorun')}>{autorunIsOn ? 'Disalbe Autorun' : 'Enable Autorun'}</a>
                            {/* TBD: <a href="#!" className="btn block" onClick={this.click('onShareClick')}>Share Sketch</a>*/}
                            <a href="#!" className="btn block" onClick={this.click('onResetEditors')}>Clean Session</a>
                            <a href="https://github.com/voronianski/esnextbin" target="_blank" className="btn block">Star on Github</a>
                            <a href="https://github.com/voronianski/esnextbin/issues/new" target="_blank" className="btn block">Report Issue</a>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}

export default Header;
