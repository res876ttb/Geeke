/**
 * @file Dispatcher.js
 * @description Utilities for dispatching redux action which is designed for Geeke.
 */

export default class Dispatcher {
  constructor(getDispatch) {
    this.dispatch = getDispatch();
    this.callbacks = [];
  }

  add(func, ...args) {
    func(newStore => {
      this.callbacks.push(newStore.callback);
    }, ...args);
    return this;
  }

  run(func, ...args) {
    if (func) {
      func(newStore => {
        this.callbacks.push(newStore.callback);
      }, ...args);
    }

    this.dispatch({type: null, callback: state => {
      for (let i = 0; i < this.callbacks.length; i++) {
        state = this.callbacks[i](state);
      }
      return state;
    }});

    this.callbacks = [];
  }
}