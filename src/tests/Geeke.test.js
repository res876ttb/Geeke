/**
 * @file Geeke.test.js
 * @description Test components in Geeke.js
 */

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/
import { render, screen } from '@testing-library/react';
import React from 'react';
import thunkMiddleware from 'redux-thunk';
import {Provider} from 'react-redux';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';

/*************************************************
 * COMPONENTS TO TEST
 *************************************************/
import Geeke from '../components/Geeke.js';

/*************************************************
 * REDUX REDUCER
 *************************************************/
import {editor} from '../states/editor.js';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(combineReducers({
  editor
}), composeEnhancers(applyMiddleware(thunkMiddleware)));

test('renders learn init screen', () => {
  render(
    <Provider store={store}>
      <Geeke />
    </Provider>,
  );
  const hihiElement = screen.getByText(/hihi/i);
  expect(hihiElement).toBeInTheDocument();
});