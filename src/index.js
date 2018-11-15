import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './containers/App';
// import Main from './containers/Main';

document.getElementById('preloader').style.display = 'none';

ReactDOM.render(React.createElement(App), document.getElementById('root'));
