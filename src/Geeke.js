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
  Decorator
} from './Decorator.js';
import {
  Cursor
} from './Cursor.js';

// ============================================
// style
import "./style.scss";

// ============================================
// class

class Geeke {
  constructor(element, options, defaultStr='') {
    // The editor DOM element
    this.editor = element;

    // Default Editor content
    this.editorEmptyParagraphString = '<div><br/></div>';

    // The string to decorate
    this.mds = defaultStr;

    // Identify the input state
    this.composition = false;

    // Configurable options for Geeke
    this.options = {
      // id: string, id of Geeke editor. If the original element does not has ID, then set the ID as a random string.
      id: this.editor.id ? this.editor.id : getNewID(),

      // eventListener: map. 
      //   key: event name.
      //   value: the function of event listener.
      eventListener: {},

      // useTab: bool, whether to use tab instead of space.
      useTab: false,

      // tabSize: number, the number of spaces equivalent to a tab
      tabSize: 2,

      // plugins: dictionary, custom parser plugins for MD parser.
      // TODO: docs
      plugins: []
    };

    // load all required options
    this.loadOptions(options);

    // Initialize markdown decorator
    this.decorator = new Decorator(this.options);

    // Initialize editor and render existing text in the given element
    this.initEditor();

    // Initialize cursor modules
    this.cursor = new Cursor(this.editor, this.options);

    // load all event listener
    this.loadEventListener(options);

    console.log("Initialization... Done.");
  }

  // Load user-given options
  loadOptions(options) {
    // If no options, then exit
    if (!options) return;
  }

  loadEventListener(options) {
    // load pre-defined event listener
    this.editor.addEventListener("click", this.handleEditorClick.bind(this), false);
    this.editor.addEventListener("input", this.handleEditorChange.bind(this), false);
    this.editor.addEventListener("compositionstart", this.handleCompositionStart.bind(this), false);
    this.editor.addEventListener("compositionend", this.handleCompositionEnd.bind(this), false);
    // this.editor.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    // document.addEventListener("selectionchange", this.handleSelectionChange.bind(this), false);

    // load user-defined event listener
    if (!options || !options.eventListener) return;
    for (let event in options.eventListener) {
      this.editor.addEventListener(event, options.eventListener[event], false);
    }
  }

  initEditor() {
    // Initialize the editor body
    // 1. Reset the content of the given element.
    // 2. Put the raw text into the editor core
    // 3. Add default class `md-editor` into editor
    // 4. Mark the editor as contenteditable
    this.editor.innerHTML = '';
    this.editor.innerText = this.mds;
    this.editor.classList.add('md-editor')
    this.editor.contentEditable = true;
    
    // render text in editor if there are words in the given element
    if (this.mds !== '') {
      this.editor.innerHTML = this.decorator.parse(this.mds);
    } else {
      this.editor.innerHTML = this.editorEmptyParagraphString;
    }
  }

  handleCompositionStart(e) {
    this.composition = true;
  }

  handleCompositionEnd(e) {
    console.log(e.data.length);
    this.composition = false;
  }

  handleKeyDown(e) {
    let keyCode = e.which | e.keyCode;
    
  }

  handleSelectionChange() {
    
  }

  handleEditorChange(e) {
    
  }

  handleEditorClick(e) {

  }
}

export function createEditor(element, options, mds) {
  return new Geeke(element, options, mds);
}
