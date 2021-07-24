/*************************************************
 * @file index.js
 * @description Entry point of main program
 *************************************************/

/*************************************************
 * Import Libraries
 *************************************************/
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import reportWebVitals from './reportWebVitals';
import { enableMapSet } from 'immer';
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

/*************************************************
 * Redux Reducers
 *************************************************/
import { editorMisc } from './states/editorMisc';
import { editor } from './states/editor';

/*************************************************
 * Components
 *************************************************/
import Geeke from './components/Geeke';

/*************************************************
 * Setup libraries
 *************************************************/
// Immer: enable support for MapSet
enableMapSet();

/*************************************************
 * Renderer
 *************************************************/
if (window.event) alert('IE not supported!');
else {
  const MuiTheme = createTheme({
    palette: {
      primary: {
        light: '#4791db',
        main: '#1976d2',
        dark: '#115293',
      },
      secondary: {
        light: '#e33371',
        main: '#dc004e',
        dark: '#9a0036',
      },
    },
  });

  const store = createStore(
    combineReducers({
      editor,
      editorMisc,
    }),
  );

  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider theme={MuiTheme}>
        <React.StrictMode>
          <Geeke />
        </React.StrictMode>
      </ThemeProvider>
    </Provider>,
    document.getElementById('root'),
  );

  // Disable animation when release dragged component
  // Source: https://stackoverflow.com/questions/42725321/prevent-html5-drag-ghost-image-flying-back
  document.ondragover = (e) => {
    e.preventDefault();
  };

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
  // reportWebVitals(console.log);
}
