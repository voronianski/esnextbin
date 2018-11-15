const envs = {
  production: {
    GITHUB_CLIENT_ID: '8d3a840b9412821160da',
    GATEKEEPER: 'https://esnextbin-gatekeeper.herokuapp.com/token',
    BROWSERIFY_CDN: 'https://wzrd.now.sh'
  },
  development: {
    GITHUB_CLIENT_ID: 'b861ee8ae510190dd2e8',
    GATEKEEPER: 'http://localhost:9393/token',
    BROWSERIFY_CDN: 'https://wzrd.now.sh'
  }
};

const env = process.env.NODE_ENV || 'development';
const config = envs[env];

export default config;
