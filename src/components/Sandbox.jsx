import React, { PropTypes } from 'react';
import BrowserSandbox from 'browser-module-sandbox';

class Sandbox extends React.Component {
    static propTypes = {
        bundle: PropTypes.object
    };

    static defaultProps = {
        bundle: {}
    };

    constructor() {
        super();
    }

    componentDidMount() {
        this.sandbox = new BrowserSandbox({
            name: 'sandbox',
            cdn: 'https://wzrd.in',
            container: this.refs.sandbox,
            iframeStyle: 'body, html { height: 100% width: 100% }'
        });

        this.sandbox.on('modules', () => console.log(1, arguments));
        this.sandbox.on('bundeStart', () => console.log(2, arguments));
        this.sandbox.on('bundeContent', () => console.log(3, arguments));
        this.sandbox.on('bundeEnd', () => console.log(4, arguments));

    }

    componentWillReceiveProps(nextProps) {
        const { bundle } = nextProps;
        if (this.props.bundle !== bundle) {
            console.log('BUNDLE?!!!???')
            this.sandbox.iframeHead = this._getTag(bundle.html, 'head');
            this.sandbox.iframeBody = this._getTag(bundle.html, 'body');
            this.sandbox.bundle(bundle.code, bundle.package.dependencies || {});
        }
        console.log(nextProps);
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
        const body = html.slice(start + tag.length + 2, end);
        return body;
    }
}

export default Sandbox;
