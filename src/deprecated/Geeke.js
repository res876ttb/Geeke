/**
 * @file Geeke.js
 * @desc A web markdown editor.
 */

// ============================================
// import
import {
  getNewID
} from './utils/id.js';
import {
  getCaretPosition, 
  setCaretPosition,
  updateCaretFocus,
  insertNewLineAfterCaret,
} from './caret.js';
import {
  markdownDecorator, initParser
} from './parser.js';

// ============================================
// style
import './editor.scss';

// ============================================
// class

class Geeke {
  constructor(element, options) {
    this.editor = null;
    this.counter = 0;
    this.editorEmptyParagraphString = '<div><br/></div>';
    this.mds = '';
    this.lastFocus = [null, null];
    this.prerenderId = getNewID();

    this.options = {
      id: getNewID(), // String, id of Geeke editor. If not specified by user, use a random number string.
      eventListener: {}, // A map. Key is event name, value is the function of event listener.
    };

    // load all required options
    this.loadOptions(options);

    // init markdown parser
    this.parser = initParser(this.options);

    // initialize editor and render existing text in the given element
    this.init(element);

    // load all event listener
    this.loadEventListener(options);
  }

  loadOptions(options) {
    if (!options) return;
    this.options.id = (options.id) ? options.id : getNewID();
  }

  loadEventListener(options) {
    // load pre-defined event listener
    this.editor.addEventListener("input", this.handleEditorChange.bind(this), false);
    this.editor.addEventListener("compositionstart", this.handleCompositionStart.bind(this), false);
    this.editor.addEventListener("compositionend", this.handleCompositionEnd.bind(this), false);
    this.editor.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    document.addEventListener("selectionchange", this.handleSelectionChange.bind(this), false);

    // load user-defined event listener
    if (!options || !options.eventListener) return;
    for (let event in options.eventListener) {
      this.editor.addEventListener(event, options.eventListener[event], false);
    }
  }

  init(element) {
    let mds = element.textContent; // get text in the given element
    element.innerHTML = ''; // reset given elementthis.createEditor()
    element.appendChild(this.createEditor()); // create editor element
    this.editorId = this.options.id;
    this.editor = document.getElementById(this.editorId); // get rendered element
    this.editor.innerText = mds;
    
    // render text in editor if there are words in the given element
    if (mds !== '') {
      this.editor.innerHTML = markdownDecorator(this.editor, this.prerenderId, null, this.parser, 'all', null);
    } else {
      this.editor.innerHTML = this.editorEmptyParagraphString;
    }

    // create prerender element
    let prerender = document.createElement('div');
    prerender.id = this.prerenderId;
    prerender.classList.add('display-none');
    element.appendChild(prerender);
  }

  createEditor() {
    let newDiv = document.createElement('div');
    newDiv.id = this.options.id;
    newDiv.classList.add('md-editor');
    newDiv.contentEditable = true;
    return newDiv;
  }

  handleCompositionStart(e) {
    this.composition = true;
  }

  handleCompositionEnd(e) {
    this.composition = false;
  }

  handleKeyDown(e) {
    let keyCode = e.which | e.keyCode;
    getCaretPosition(this.editorId, caretPos => {
      if (caretPos) this.caretPos = caretPos;
    });
    switch (keyCode) {
      case 13:
        insertNewLineAfterCaret();
        break;
    }
  }

  handleSelectionChange() {
    updateCaretFocus(this.editorId, this.lastFocus, newFocus => {
      this.lastFocus = newFocus;
    });
  }

  handleEditorChange(e) {
    if (!this.composition) {
      if (this.editor.textContent === '') {
        this.editor.innerHTML = this.editorEmptyParagraphString;
        setCaretPosition([0, 0], editorId);
      } else {
        this.editor.innerHTML = markdownDecorator(this.editor, this.prerenderId, this.caretPos, this.parser, 'all', null);
        setCaretPosition(this.caretPos, this.editorId);
      }
    }
  }

  getCounter() {
    this.counter++;
    return this.counter;
  }
}

export function createEditor(element, options) {
  return new Geeke(element, options);
}
