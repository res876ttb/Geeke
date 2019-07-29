// index.jsx
//  Program entry.

'use strict';
// ============================================
// React packages
import React from 'react';
import ReactDOM from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import {Provider} from 'react-redux';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';

// ============================================
// import react components
import Main from 'components/Main.jsx';

// ============================================
// import react redux-reducers
import {main} from 'states/mainState.js';

// ============================================
// import apis

// ============================================
// import css file
// import '../node_modules/bootstrap/dist/css/bootstrap.css';

// ============================================
// load component
window.onload = function() {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(combineReducers({
    main
  }), composeEnhancers(applyMiddleware(thunkMiddleware)));

  // customize global material theme
  const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      primary: blue,
      secondary: pink,
    },
  });

  ReactDOM.render(
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <Main />
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
  );
};
