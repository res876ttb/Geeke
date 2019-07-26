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
    document.getElementById(editorId).addEventListener("input", this.handleEditorChange, false);
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
        <p>Text here is editable.<span className="hide">¶</span></p><p><br/><span className="hide">¶</span></p><p>These are&nbsp;<b><span className="md-bold">**</span>bold1<span className="md-bold">**</span></b>&nbsp;and <b><span className="md-bold">__</span>bold2<span className="md-bold">__</span></b><span className="hide">¶</span></p><p>These are&nbsp;<i><span className="md-italic">*</span>italic2<span className="md-italic">*</span></i>&nbsp;and <i><span className="md-italic">_</span>italic2<span className="md-italic">_</span></i><span className="hide">¶</span></p><p>These are lots of&nbsp;<b><i><span className="md-bold-italic">***</span>bold and italic<span className="md-bold-italic">***</span></i></b>: <i><span className="md-italic">_</span><b><span className="md-bold">**</span>bold and italic<span className="md-bold">**</span></b><span className="md-italic">_</span></i>&nbsp;<b><span className="md-bold">**</span><i><span className="md-italic">_</span>bold and italic<span className="md-italic">_</span></i><span className="md-bold">**</span></b><span className="hide">¶</span></p><p className="md-focus">This is <code><span className="md-inline-code">`</span>code block<span className="md-inline-code">`</span></code>&nbsp;</p>
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

    console.log(document.getElementById(editorId).innerHTML);
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
