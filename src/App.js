import React from 'react';

import './App.css';

import DataManager from './DataManager.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.DataManager = new DataManager();

    this.state = {
      obj1: null
    };
  }

  render() {
    return (
      <div>
        hi
      </div>
    );
  }
}

export default App;
