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
  getCurrentParagraph
} from '../utils/caret.js';

// ============================================
// import css file
import '../styles/editor.scss';

// ============================================
// constants
const editorId = 'mde';
const editorEmptyHtmlString = '<p><br/></p>';

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
    editor.innerHTML = markdownDecorator(editor, null, this.state.parser, 'all', null);
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
    getCaretPosition(editorId, caretPos => {
      console.log(caretPos);
      let editor = document.getElementById(editorId);
      // console.log(editor.innerHTML);
      if (!this.state.composition || e.endComposition) {
        switch(e.inputType) {
          default:
            // reset editor if there are no content in the editor
            if (editor.textContent === '') {
              editor.innerHTML = editorEmptyHtmlString;
              setCaretPosition([0, 0], editorId); // Put caret into the editorEmptyHtmlString
            } else {
              // render current result
              let poffset = 0;
              let coffset = 0;

              // render new style
              let newHTML = markdownDecorator(editor, this.state.caretPos, this.state.parser, 'all', null);
              if (newHTML) editor.innerHTML = newHTML;
              else {
                // patch for delete last paragraph, which causes difference on number of paragraph
                this.setState({
                  numParagraph: editor.childNodes.length
                });
                return;
              }

              // check if any line is deleted
              if (editor.childNodes.length < this.state.numParagraph) poffset = this.state.numParagraph - editor.childNodes.length;

              // check caretpos
              let textContent = editor.childNodes[caretPos[0]].textContent;
              if (caretPos[1] === 0 && textContent.slice(-1) === '¶') coffset = 1;

              // for delete a word with md marks, it should use last position
              setCaretPosition([this.state.caretPos[0] - poffset, coffset ? coffset : this.state.caretPos[1]], editorId);
              // setCaretPosition(caretPos, editorId);
            }
            this.setState({
              numParagraph: editor.childNodes.length
            });
        }
      }
    });
  }

  handleKeyDown(e){
    let keyCode = e.which | e.keyCode;
    let editor = document.getElementById(editorId);
    this.getCaretPos();
    return;

    // handle newline
    switch (keyCode) {
      // case 8:  // backspace is pressed
        // let curP = getCurrentParagraph(editorId);
        // getCaretPosition(editorId, caretPos => {
        //   console.log(caretPos, curP, curP.textContent.length);
        //   if (caretPos[1] === curP.textContent.replace(/^¶/, '').replace(/¶$/, '').length) {
        //     // make visible paragraph wrap symbol
        //     let newSpan = document.createElement('span');
        //     newSpan.classList.add('hide-visible');
        //     newSpan.innerText = '¶';
        //     console.log(newSpan);
        //     curP.previousSibling.appendChild(newSpan);
        //   }
        // });
        // break;
      case 13: // enter is pressed
        // check current state to insert corresponding element

        // insert a new paragraph
        // check if there are word after current caret
        getCaretPosition(editorId, caretPos => {
          // prevent default enter event
          e.preventDefault();

          // get current paragraph
          let curP = getCurrentParagraph(editorId);
          // create a new paragraph
          let newP = document.createElement('p');
          newP.id = `${getCounter()}`; // assign each paragraph an id
          newP.appendChild(newPSymbol.cloneNode(true)); // add paragraph symbol first
          
          // check if we have to split word into the new paragraph
          let temp = editor.childNodes[caretPos[0]].textContent;
          if (caretPos[1] > (temp.slice(-1) === '¶' ? 1 : 0)) { // YES
            console.log('Text after me is too heavy!!');

            return;
          } else { // NO
            // add empty symbol into the new paragraph
            newP.appendChild(document.createElement('br'));
            // wrap the empty symbol with paragraph symbol if there is an paragraph after the new paragraph
            if (curP.nextSibling) newP.appendChild(newPSymbol.cloneNode(true));
            else curP.appendChild(newPSymbol.cloneNode(true));
          }
          // insert the new paragraph after this one
          curP.after(newP);

          // set caret position
          setCaretPosition([caretPos[0] + 1, 0], editorId);

          // update caret focus status and number of paragraph
          updateCaretFocus(editorId, this.state.lastFocus, newFocus => {
            this.setState({
              lastFocus: newFocus,
              numParagraph: document.getElementById(editorId).childNodes.length
            })
          });
        });
        break;
    }
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
    this.handleEditorChange({endComposition: true});
  }
}

export default connect (state => ({
  
}))(Main);
