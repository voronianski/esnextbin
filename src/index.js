import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './containers/App';

document.getElementById('preloader').style.display = 'none';

ReactDOM.render(React.createElement(App), document.getElementById('root'));
