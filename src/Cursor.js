export class Cursor {
  constructor(editor, options) {
    // The core editor element.
    this.editor = editor;

    // Load options from Geeke
    this.options = options;

    // Last cursor position
    this.lastPosition = -1;

    // Start update loop
    this.updateLoop();
  }

  setCursorPosition() {

  }

  updateLoop() {
    setTimeout(() => {
      if (this.getCurrentRange()) this.update();
      this.updateLoop();
    }, 50);
  }

  update() {
    let position = this.getPosition();
    if (position == this.lastPosition) return;
    this.removeCursorStyle();
    this.addCursorStyle(position);
  }

  removeCursorStyle() {
    let elements = document.getElementsByClassName('md-focus');
    while (elements.length > 0) {
      elements[0].classList.remove('md-focus');
    }
  }

  addCursorStyle(position) {
    this.positionCounter = 0;
    let element = this.editor;
    this.addCursorStyleCore(element, position);
    this.lastPosition = position;
  }

  addCursorStyleCore(element, position) {
    if (element.childNodes) {
      for (let i = 0; i < element.childNodes.length; i++) {
        let child = element.childNodes[i];
        let curPos = this.positionCounter + child.textContent.length;
        if (curPos > position) {
          if (child.classList) child.classList.add('md-focus');
          return this.addCursorStyleCore(child, position);
        } else if (curPos == position) {
          if (child.classList) child.classList.add('md-focus');
          this.addCursorStyleCore(child, position);
          if (i + 1 < element.childNodes.length) {
            if (element.childNodes[i + 1].classList) element.childNodes[i + 1].classList.add('md-focus');
            this.addCursorStyleCore(element.childNodes[i + 1], position);
          }
          return;
        } else {
          this.positionCounter = curPos;
        }
      }
    } else {
      
    }
  }

  // Count the number of characters before cursor
  getPosition() {
    let range = this.getCurrentRange();

    if (!range) return null;

    let position = range.startOffset;
    let curElement = range.startContainer;
    while (true) {
      if (curElement.previousSibling) {
        curElement = curElement.previousSibling;
        position += curElement.textContent.length;
      } else {
        curElement = curElement.parentElement;
      }

      if (curElement.id == this.options.id) break;
    }

    return position;
  }

  // Check compatibility of getSelection and createRange
  // @copyright: https://wuxinhua.com/2018/07/05/Contenteditable-The-Good-Part-And-The-Ugly/
  isSupportRange () {
    return ((typeof document.createRange) === 'function') || ((typeof window.getSelection) === 'function');
  }

  // Get cursor position 
  // @copyright: https://wuxinhua.com/2018/07/05/Contenteditable-The-Good-Part-And-The-Ugly
  getCurrentRange () {
    let range = null;
    let selection = null;

    // Check if range operation is supported
    if (this.isSupportRange()) {
      selection = document.getSelection();
      if (selection.getRangeAt && selection.rangeCount) {
        range = document.getSelection().getRangeAt(0);
      }
    } else {
      range = document.selection.createRange();
    }
    return range;
  }
}