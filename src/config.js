const envs = {
  production: {
    GITHUB_CLIENT_ID: '8d3a840b9412821160da',
    GATEKEEPER: 'https://esnextbin-gatekeeper.herokuapp.com/token',
    BROWSERIFY_CDN: 'https://wzrd.now.sh'
  },
  development: {
    GITHUB_CLIENT_ID: '8c4bcc76f39c83be7109',
    GATEKEEPER: 'http://localhost:9393/token',
    BROWSERIFY_CDN: 'https://wzrd.now.sh'
  }
};

const env = process.env.NODE_ENV || 'development';
const config = envs[env];

export default config;
