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
    // check if there are child nodes in current element
    if (element.childNodes) {
      // iterate through all child nodes
      for (let i = 0; i < element.childNodes.length; i++) {
        let child = element.childNodes[i];
        // calculate the length of text that includes this child node
        let curPos = this.positionCounter + child.textContent.length;

        if (curPos > position) {
          // the length of the text exceed current cursor position, 
          // so the style have to add to this node and its child
          if (child.classList) child.classList.add('md-focus');
          return this.addCursorStyleCore(child, position);
        } else if (curPos == position) {
          // the length of the text is exactly equal to the current cursor position,
          // so the style have to add to this node and its child, and the next element
          if (child.classList) child.classList.add('md-focus');
          this.addCursorStyleCore(child, position);

          // check if this node has next element
          if (i + 1 < element.childNodes.length) {
            if (element.childNodes[i + 1].localName == 'br' && i + 2 < element.childNodes.length && element.childNodes[i + 2].classList) {
              // if the next node is <br> and <br> has the next node, then skip it
              element.childNodes[i + 2].classList.add('md-focus');
              this.addCursorStyleCore(element.childNodes[i + 2], position);
            } else if (element.childNodes[i + 1].classList) {
              // if it is not <br>, then add style to this node and its child node
              element.childNodes[i + 1].classList.add('md-focus');
              this.addCursorStyleCore(element.childNodes[i + 1], position);
            } // else, this element does not has class attribute. Skip it.
          } // else, this is the last node.
          return;
        } else {
          // If current position is smaller than the cursor position, update current position counter and to to the next element.
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

    // Count position from the endOffset
    let position = range.endOffset;
    // Iterate to the top from the endContainer.
    let curElement = range.endContainer;
    while (true) {
      if (curElement.previousSibling) {
        // If current element has a previous node, add the length of text of the node to position
        curElement = curElement.previousSibling;
        position += curElement.textContent.length;
      } else {
        // If not, get up to the parrent element.
        curElement = curElement.parentElement;
      }

      // If current element is the main editor, then no need to get up. Counting is done.
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