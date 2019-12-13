import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';

// because of IE
var ES6Promise = require("es6-promise");
ES6Promise.polyfill();

//import 'core-js/features/array/find';
require("@babel/polyfill");


ReactDOM.render(<App />, document.getElementById('root'));
