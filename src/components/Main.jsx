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
  getCaretPosition,
  setCaretPosition,
  updateCaretFocus,
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

    // handle keyboard event
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);

    // handle input method with composition
    this.handleCompositionStart = this.handleCompositionStart.bind(this);
    this.handleCompositionEnd = this.handleCompositionEnd.bind(this);

    this.state = {
      caretPos: null,
      composition: false,
      lastFocus: [null, null],
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
        onKeyDown={this.handleKeyDown}
        onCompositionStart={this.handleCompositionStart}
        onCompositionEnd={this.handleCompositionEnd}
        mdtype={'main editor'}
        onSelect={this.handleSelectionChange}
      >
        <div>Text here **is** editable.</div>
      </div>
    );
  }

  handleEditorChange(e) {
    if (e.inputType !== 'insertParagraph') {
      let main = document.getElementById(editorId);
      if (!this.state.composition) {
        if (main.textContent === '') {
          main.innerHTML = editorEmptyHtmlString;
          setCaretPosition([0, 0], editorId); // Put caret into the editorEmptyHtmlString
        } else {
          main.innerHTML = markdownDecorator(main.textContent, this.state.caretPos);
          setCaretPosition(this.state.caretPos, editorId);
        }
      }
    }
  }

  handleKeyDown(e){
    this.getCaretPos();
  }

  handleSelectionChange(e) {
    updateCaretFocus(editorId, this.state.lastFocus, newFocus => {
      this.setState({
        lastFocus: newFocus
      });
    });
  }

  getCaretPos(e) {
    getCaretPosition(editorId, caretPos => {
      if (caretPos) {
        this.setState({
          caretPos: caretPos
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
