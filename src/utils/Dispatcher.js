/**
 * @file Dispatcher.js
 * @description Utilities for dispatching redux action which is designed for Geeke.
 *              Note that the type should be exactly the same for each function!
 */

export default class Dispatcher {
  constructor(dispatchFunc, isDispatch=false) {
    if (isDispatch) {
      this.dispatch = dispatchFunc;
    } else {
      this.dispatch = dispatchFunc();
    }

    this.reset();
  }

  add(func, ...args) {
    func(newStore => {
      if (!this.type) {
        this.callbacks.push(newStore.callback);
        this.type = newStore.type;
      } else if (this.type === newStore.type) {
        this.callbacks.push(newStore.callback);
      } else {
        console.error(`Type is not the same as the previous function! (${this.type} !== ${newStore.type})`);
      }
    }, ...args);

    return this;
  }

  run(func, ...args) {
    if (func) this.add(func, ...args);

    if (!this.type) return this.reset();

    this.dispatch({type: this.type, callback: state => {
      for (let i = 0; i < this.callbacks.length; i++) {
        state = this.callbacks[i](state);
      }
      return state;
    }});

    this.reset();
  }

  reset() {
    this.callbacks = [];
    this.type = null;
  }
}