import React, { PropTypes } from 'react';
import BrowserSandbox from 'browser-module-sandbox';
import config from '../config';

class Sandbox extends React.Component {
    static propTypes = {
        bundle: PropTypes.object
    };

    static defaultProps = {
        bundle: {}
    };

    componentDidMount() {
        const { onModules, onStartBundle, onContentBundle, onEndBundle } = this.props;

        this.sandbox = new BrowserSandbox({
            name: 'sandbox',
            cdn: config.BROWSERIFY_CDN,
            container: this.refs.sandbox,
            iframeStyle: 'body, html { height: 100%; width: 100%; overflow: auto }'
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
        return (
            <div ref="sandbox" className="sandbox border-left" />
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
