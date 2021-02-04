/*************************************************
 * @file Geeke.js
 * @description Framework component of Geeke.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Styles
 *************************************************/
import '../styles/Geeke.css';

/*************************************************
 * Main components
 *************************************************/
class Geeke extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        hihi
      </div>
    );
  }
}

export default connect(state => ({
  
}))(Geeke);
