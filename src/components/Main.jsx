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
  insertNewLineAfterCaret,
} from '../utils/caret.js';

// ============================================
// import css file
import '../styles/editor.scss';

// ============================================
// constants
const editorId = 'mde';
const editorEmptyHtmlString = '<p><br /></p>';

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
    let editor = document.getElementById(editorId);
    editor.addEventListener("input", this.handleEditorChange, false);
    editor.innerHTML = markdownDecorator(editor.textContent, this.state.caretPos);
  }

  render() {
    return (
      <div 
        className='md-editor'
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
        Text here is editable.¶¶These are **bold1** and __bold2__¶These are *italic2* and _italic2_¶These are lots of ***bold and italic***: _**bold and italic**_ **_bold and italic_**¶This is `code block` ¶This is a [link example](http://google.com).¶There are lots o\f\ \e\s\c\a\p\e\r.¶However, escaper could not in `code\block`.
      </div>
    );
  }

  handleEditorChange(e) {
    if (e.inputType === 'insertParagraph') {
      // insertNewLineAfterCaret();
      let main = document.getElementById(editorId);
      main.innerHTML = markdownDecorator(main.textContent, this.state.caretPos);
      setCaretPosition([this.state.caretPos[0] + 1, -1], editorId);
    } else {
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
    let keyCode = e.which | e.keyCode;
    this.getCaretPos();

    // handle newline
    if (keyCode === 13) {
      insertNewLineAfterCaret();
    }

    // console.log(document.getElementById(editorId).textContent);
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
