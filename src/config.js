const envs = {
    production: {
        GITHUB_CLIENT_ID: '8d3a840b9412821160da',
        GATEKEEPER: 'https://labs.voronianski.com/gatekeeper/token.php',
        BROWSERIFY_CDN: 'https://wzrd.in'
    },
    dev: {
        GITHUB_CLIENT_ID: 'b861ee8ae510190dd2e8',
        GATEKEEPER: 'https://labs.voronianski.com/gatekeeper-dev_/token.php',
        BROWSERIFY_CDN: 'https://wzrd.in'
    }
};

export default envs.dev;
