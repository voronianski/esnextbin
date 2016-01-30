import './app.css';

import React from 'react';
import ReactDOM from 'react-dom';

import Main from './containers/Main';

document.getElementById('preloader').style.display = 'none';

ReactDOM.render(
    React.createElement(Main),
    document.getElementById('root')
);
