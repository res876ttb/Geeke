// Main.jsx
//  Maintain top-level program data.

// ============================================
// React packages
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

// ============================================
// import react components

// ============================================
// import react redux-action
import {

} from '../states/mainState.js';

// ============================================
// import apis
import {
  markdownDecorator
} from '../utils/parser.js';
import {
  getCaretRange,
  setCaretRange,
} from '../utils/caret.js';

// ============================================
// import css file
import '../styles/editor.css';

// ============================================
// constants
const editorId = 'mde';
const editorEmptyHtmlString = '<div><br /></div>';

// ============================================
// react components
class Main extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    noteIndex: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.getCaretPos = this.getCaretPos.bind(this);

    // handle input method with composition
    this.handleCompositionStart = this.handleCompositionStart.bind(this);
    this.handleCompositionEnd = this.handleCompositionEnd.bind(this);

    this.state = {
      range: null,
      composition: false,
    };
  }

  componentWillMount() {

  }

  componentDidMount() {
    document.getElementById(editorId).addEventListener("input", this.handleEditorChange, false);
  }

  render() {
    return (
      <div 
        id={editorId}
        contentEditable='true'
        suppressContentEditableWarning='true'
        style={{minHeight: '2rem'}}
        onKeyDown={this.getCaretPos}
        onCompositionStart={this.handleCompositionStart}
        onCompositionEnd={this.handleCompositionEnd}
        mdtype={'main editor'}
      >
        <div>Text here is editable.</div>
      </div>
    );
  }

  handleEditorChange(e) {
    console.log(`Content of element ${editorId} is changed!`);
    let main = document.getElementById(editorId);
    console.log(main.innerHTML);
    if (!this.state.composition) {
      if (main.textContent === '') {
        main.innerHTML = editorEmptyHtmlString;
        setCaretRange([1, 1, 1], editorId); // Put caret into the editorEmptyHtmlString
      } else {
        main.innerHTML = markdownDecorator(main.textContent);
        setCaretRange(this.state.range, editorId);
      }
    }
  }

  getCaretPos(e) {
    getCaretRange(editorId, range => {
      if (range) {
        this.setState({
          range: range
        });
      }
    });
  }

  handleCompositionStart() {
    this.setState({
      composition: true
    });
  }

  handleCompositionEnd() {
    this.setState({
      composition: false
    });
  }
}

export default connect (state => ({
  
}))(Main);
