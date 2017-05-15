import React, { PropTypes } from 'react';
import BrowserSandbox from 'browser-module-sandbox';
import config from '../config';

const isFirefox = window.navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;

class Sandbox extends React.Component {
  static propTypes = {
    bundle: PropTypes.object,
    onModules: PropTypes.func,
    onStartBundle: PropTypes.func,
    onContentBundle: PropTypes.func,
    onEndBundle: PropTypes.func,
    onErrorBundle: PropTypes.func
  };

  static defaultProps = {
    bundle: {}
  };

  componentDidMount() {
    const {
      onModules,
      onStartBundle,
      onContentBundle,
      onEndBundle,
      onErrorBundle
    } = this.props;

    this.sandbox = new BrowserSandbox({
      name: 'sandbox',
      cdn: config.BROWSERIFY_CDN,
      container: this.refs.sandbox,
      cacheOpts: {
                // enable inMemory for FF due to leveljs (via https://github.com/shama/browser-module-cache) issues in v48
        inMemory: isFirefox
      },
      iframeStyle: 'body, html { height: 100%; width: 100%; overflow: auto }',
      iframeSandbox: ['allow-forms', 'allow-popups', 'allow-scripts', 'allow-same-origin', 'allow-modals']
    });

    this.sandbox.on('modules', modules => {
      if (!modules.length) return;
      onModules && onModules(modules);
    });
    this.sandbox.on('bundleStart', () => {
      onStartBundle && onStartBundle();
    });
    this.sandbox.on('bundleContent', () => {
      onContentBundle && onContentBundle();
    });
    this.sandbox.on('bundleEnd', html => {
      onEndBundle && onEndBundle(html);
    });
    this.sandbox.on('bundleError', err => {
      onErrorBundle && onErrorBundle(err);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { bundle } = nextProps;

    if (this.props.bundle !== bundle) {
      this.sandbox.iframeHead = this._getTag(bundle.html, 'head') || '';
      this.sandbox.iframeBody = this._getTag(bundle.html, 'body') || '';
      this.sandbox.bundle(bundle.code, bundle.package.dependencies || {});
    }
  }

  render() {
    const { bundle } = this.props;
    return (
      <div ref="sandbox" className="sandbox border-left">
        {!bundle.html ? (
          <div className="center mt2 silver caps regular html-preview">HTML Preview</div>
        ) : <span />}
      </div>
    );
  }

  _getTag(html = '', tag) {
    if (!html) return;
    const start = html.indexOf(`<${tag}>`);
    const end = html.indexOf(`</${tag}>`);
    if (start === -1 || end === -1) {
      return '';
    }
    const body = html.slice(start + tag.length + 2, end);
    return body;
  }
}

export default Sandbox;
