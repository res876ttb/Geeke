/*************************************************
 * @file index.js
 * @description Entry point of main program
 *************************************************/

/*************************************************
 * Import Libraries
 *************************************************/
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import reportWebVitals from './reportWebVitals';

/*************************************************
 * Redux Reducers
 *************************************************/
import {editor} from './states/editor';

/*************************************************
 * Components
 *************************************************/
import Geeke from './components/Geeke';

/*************************************************
 * Styles
 *************************************************/
import './styles/index.css';

/*************************************************
 * Renderer
 *************************************************/
const store = createStore(combineReducers({
  editor
}));

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <Geeke />
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);

// Disable animation when release dragged component
document.ondragover = e => {
  e.preventDefault();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// reportWebVitals(console.log);
