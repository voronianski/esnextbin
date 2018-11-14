import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Ace from 'react-ace';

import 'brace';
import 'brace/mode/jsx';
import 'brace/mode/json';
import 'brace/mode/html';
import 'brace/theme/tomorrow';
import 'brace/ext/emmet';
import 'brace/ext/language_tools';

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
    headerHeight: 38
  };

  handleChange(handler) {
    const fn = this.props[handler];
    return value => fn && fn(value);
  }

  componentDidUpdate(prevProps) {
    const { error, active } = this.props;
    const prevError = prevProps.error;
    const prevActive = prevProps.active;

    // resize ace editor after error or active change
    if (error !== prevError || active !== prevActive) {
      window.dispatchEvent(new Event('resize'));
    }
  }

  render() {
    const { active, code, html, json, error, tabSize } = this.props;

    return (
      <div className="editorbox">
        <div
          className={cx('edit-code', {
            hide: active !== 'code',
            'has-error': !!error
          })}
        >
          <Ace
            name="codeEditor"
            mode="jsx"
            theme="tomorrow"
            value={code}
            tabSize={tabSize}
            width="auto"
            height="auto"
            onChange={this.handleChange('onCodeChange')}
            showPrintMargin={false}
            editorProps={{ $blockScrolling: Infinity }}
            enableLiveAutocompletion={true}
          />
        </div>

        <div className={cx('edit-html', { hide: active !== 'html' })}>
          <Ace
            name="htmlEditor"
            mode="html"
            theme="tomorrow"
            value={html}
            tabSize={tabSize}
            width="auto"
            height="auto"
            onChange={this.handleChange('onHTMLChange')}
            showPrintMargin={false}
            editorProps={{ $blockScrolling: Infinity }}
            enableBasicAutocompletion={true}
            setOptions={{ enableEmmet: true }}
          />
        </div>

        <div className={cx('edit-package', { hide: active !== 'package' })}>
          <Ace
            name="packageEditor"
            mode="json"
            theme="tomorrow"
            value={json}
            tabSize={tabSize}
            width="auto"
            height="auto"
            onChange={this.handleChange('onPackageChange')}
            showPrintMargin={false}
            editorProps={{ $blockScrolling: Infinity }}
          />
        </div>

        {error ? <div className="code-error">{error.message}</div> : <span />}
      </div>
    );
  }
}

export default Editors;
