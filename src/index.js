/*************************************************
 * @file index.js
 * @description Entry point of main program
 *************************************************/

/*************************************************
 * Import Libraries
 *************************************************/
import React from 'react';
import ReactDOM from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import {Provider} from 'react-redux';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import reportWebVitals from './reportWebVitals';

/*************************************************
 * Redux Reducers
 *************************************************/
import {editor} from './states/editor.js';

/*************************************************
 * Components
 *************************************************/
import Geeke from './components/Geeke.js';

/*************************************************
 * Styles
 *************************************************/
import './styles/index.css';

/*************************************************
 * Renderer
 *************************************************/
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(combineReducers({
  editor
}), composeEnhancers(applyMiddleware(thunkMiddleware)));

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <Geeke />
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// reportWebVitals(console.log);
