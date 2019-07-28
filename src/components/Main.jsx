// Main.jsx
//  Maintain top-level program data.

// ============================================
// React packages
import React from 'react';
import PropTypes, { element } from 'prop-types';
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
  markdownDecorator,
  initParser,
  getCounter,
} from '../utils/parser.js';
import {
  getCaretPosition,
  setCaretPosition,
  updateCaretFocus,
  insertNewLineAfterCaret,
  getCurrentparagraph,
} from '../utils/caret.js';

// ============================================
// import css file
import '../styles/editor.scss';

// ============================================
// constants
const editorId = 'mde';
const editorEmptyHtmlString = '<p><br /></p>';

// ============================================
// variables
var newPSymbol;

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

    // handle keyboard event
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);

    // handle input method with composition
    this.handleCompositionStart = this.handleCompositionStart.bind(this);
    this.handleCompositionEnd = this.handleCompositionEnd.bind(this);

    this.state = {
      caretPos: null,
      composition: false,
      lastFocus: [null, null],
      parser: initParser(),
      numParagraph: 1,
    };
  }

  componentWillMount() {
    newPSymbol = document.createElement('span');
    newPSymbol.innerText = '¶';
    newPSymbol.classList.add('hide');
  }

  componentDidMount() {
    let editor = document.getElementById(editorId);
    editor.addEventListener("input", this.handleEditorChange, false);
    editor.innerHTML = markdownDecorator(editor, null, null, this.state.parser, 'all');
    this.setState({
      numParagraph: editor.childNodes.length
    });
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
        onKeyUp={this.handleKeyUp}
        onCompositionStart={this.handleCompositionStart}
        onCompositionEnd={this.handleCompositionEnd}
        mdtype={'main editor'}
        onSelect={this.handleSelectionChange}
      >
        # Header1¶## Header2¶### Header3¶#### Header4¶##### Header5¶###### Header6¶Text here is editable.¶***¶These are **bold1** and __bold2__¶These are *italic2* and _italic2_ _italic2_¶These are lots of ***bold and italic***: _**bold and italic**_ **_bold and italic_**¶This is `code block` ¶This is a [link example](http://google.com).¶There are lots o\f\ \e\s\c\a\p\e\r.¶However, escaper could not in `code\block`.¶Also, ~~strikethrough~~ is supported!
      </div>
    );
  }

  handleEditorChange(e) {
    console.log(e.inputType);
    // let caretPos = this.state.caretPos;
    getCaretPosition(editorId, caretPos => {
      let editor = document.getElementById(editorId);
      // console.log(editor.innerHTML);
      if (!this.state.composition) {
        // reset editor
        if (editor.textContent === '') {
          editor.innerHTML = editorEmptyHtmlString;
          setCaretPosition([0, 0], editorId); // Put caret into the editorEmptyHtmlString
        } else {
          let poffset = 0;

          // render new style
          editor.innerHTML = markdownDecorator(editor, this.state.caretPos, this.state.caretPos, this.state.parser, '3p');

          // check if any line is deleted
          console.log(editor.childNodes.length, this.state.numParagraph);
          if (editor.childNodes.length < this.state.numParagraph) poffset = this.state.numParagraph - editor.childNodes.length;

          // check caretpos
          let textContent = editor.childNodes[caretPos[0]].textContent;
          if (caretPos[1] === 0 && textContent[textContent.length - 1] === '¶') caretPos[1] = 1;

          // for delete a word with md marks, it should use last position
          setCaretPosition([this.state.caretPos[0] - poffset, this.state.caretPos[1]], editorId);
          // setCaretPosition(caretPos, editorId);
        }
        this.setState({
          numParagraph: editor.childNodes.length
        });
      }
    });
  }

  handleKeyDown(e){
    let keyCode = e.which | e.keyCode;
    this.getCaretPos();

    // handle newline
    if (keyCode === 13) { // enter is pressed
      // check current state
      // insert corresponding element

      // insert a new paragraph
      e.preventDefault();
      let curP = getCurrentparagraph(editorId);
      let newP = document.createElement('p');
      newP.id = `${getCounter()}`;
      newP.appendChild(newPSymbol.cloneNode(true));
      newP.appendChild(document.createElement('br'));
      if (curP.nextSibling) newP.appendChild(newPSymbol.cloneNode(true));
      else curP.appendChild(newPSymbol.cloneNode(true));
      curP.after(newP);
      getCaretPosition(editorId, caretPos => {
        setCaretPosition([caretPos[0] + 1, 0], editorId);
        this.setState({
          numParagraph: document.getElementById(editorId).childNodes.length
        });
      });
    }

    // console.log(document.getElementById(editorId).textContent);
  }

  handleKeyUp(e) {
    // let keyCode = e.which | e.keyCode;
    // switch (keyCode) {
    //   case 8: case 13: case 38: case 40: 
    //     this.getCaretPos();
    // }
    getCaretPosition(editorId, caretPos => {
      console.log(caretPos);
    })
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

  handleSelectionChange(e) {
    updateCaretFocus(editorId, this.state.lastFocus, newFocus => {
      this.setState({
        lastFocus: newFocus
      });
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
