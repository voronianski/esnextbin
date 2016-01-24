import React, { PropTypes } from 'react';
import cx from 'classnames';

class Header extends React.Component {
    static propTypes = {
        onRunClick: PropTypes.func.isRequired,
        onEditorClick: PropTypes.func
    };

    static defaultProps = {
    };

    constructor() {
        super();

        this.buttons = [
            {id: 'code', text: 'code'},
            {id: 'html', text: 'html'},
            {id: 'package', text: 'package.json'}
        ];
    }

    onChangeEditorTo(editor) {
        const { onEditorClick } = this.props;
        return e => {
            e.preventDefault();
            onEditorClick && onEditorClick(editor, e);
        };
    }

    render() {
        const { height, activeEditor, onRunClick } = this.props;

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
                    <button type="button" className="left btn btn-primary btn-small h6 caps regular rounded bg-fuchsia run-btn" onClick={onRunClick}>▶ Execute</button>
                </div>
            </header>
        );
    }
}

export default Header;
