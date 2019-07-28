/**
 * @name caret.js
 * @desc Handle caret position, movement, and selection
 */

// ===================================================================================
// public function list
/**
 * 
 */


// ===================================================================================
// import


// ===================================================================================
// constant


// ===================================================================================
// global variable


// ===================================================================================
// private function

// Check compatibility of getSelection and createRange
// @copyright: https://wuxinhua.com/2018/07/05/Contenteditable-The-Good-Part-And-The-Ugly/
function isSupportRange () {
  return ((typeof document.createRange) === 'function') || ((typeof window.getSelection) === 'function');
}

// Get caret position 
// @copyright: https://wuxinhua.com/2018/07/05/Contenteditable-The-Good-Part-And-The-Ugly
function getCurrentRange () {
  let range = null;
  let selection = null;
  if (isSupportRange()) {
    selection = document.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
      range = document.getSelection().getRangeAt(0);
    }
  } else {
    range = document.selection.createRange();
  }
  return range;
}

// Return value: position
// Data structure: [parent, child, child of child ... ]
// Return a list of index, which is start from the root element. 
// The index value is the number of elements from the end.
function _getCaretRange(range, dir, editorId, cbf) {
  let found = false;
  // check startContainer
  if (range.startContainer) {
    let ele;
    if (dir === 'start') {
      ele = range.startContainer;
    } else {
      ele = range.endContainer;
    }
    _getCaretRange(ele, dir, editorId, result => {
      result.push(ele.length - range.endOffset);
      cbf(result);
    });
  } else {
    if (range.parentNode.id === editorId) {
      let result = []
      for (let i = 0; i < range.parentNode.childNodes.length; i++) {
        if (range.parentNode.childNodes[i].isEqualNode(range)) {
          result.push(range.parentNode.childNodes.length - i);
          found = true;
          break;
        }
      }
      console.assert(found, 'Node under main editor is not found!');
      cbf(result);
    } else {
      _getCaretRange(range.parentNode, dir, editorId, result => {
        for (let i = 0; i < range.parentNode.childNodes.length; i++) {
          if (range.parentNode.childNodes[i].isEqualNode(range)) {
            result.push(range.parentNode.childNodes.length - i);
            found = true;
            break;
          }
        }
        console.assert(found, 'A node', range, 'is not found!');
        cbf(result);
      });
    }
  }
}

function getCaretRangeCore(editorId, cbf) {
  _getCaretRange(getCurrentRange(), 'end', editorId, result => {
    cbf(result);
  });
}

function _getCaretPositionCore(range, editorId, cbf) {
  let found = false;
  if (!range.parentNode) return cbf(null);
  if (range.parentNode.id === editorId) {
    let result = 0, i = 0;
    for (; i < range.parentNode.childNodes.length; i++) {
      if (range.parentNode.childNodes[i].isEqualNode(range)) {
        result = i;
        found = true;
        break;
      }
    }
    console.assert(found, 'Node under main editor is not found!');
    cbf([result, range.parentNode.childNodes[i].textContent.length]);
  } else {
    _getCaretPositionCore(range.parentNode, editorId, result => {
      if (!result) return cbf(null);
      for (let i = 0; i < range.parentNode.childNodes.length; i++) {
        let node = range.parentNode.childNodes[i];
        if (node.isEqualNode(range)) {
          found = true;
          break;
        } else {
          result[1] -= node.textContent.length;
        }
      }
      console.assert(found, 'A node', range, 'is not found!');
      cbf(result);
    });
  }
}

function _setCaretPosition(ele, offset) {
  if (ele && ele.createTextRange) {
    let newRange = ele.createTextRange();
    newRange.move('character', offset);
    newRange.select();
  } else { 
    // @copyright: https://medium.com/compass-true-north/a-dancing-caret-the-unknown-perils-of-adjusting-cursor-position-f252734f595e
    let selection = window.getSelection();
    let newRange = document.createRange();
    newRange.setStart(ele, offset);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

function _setCaretPositionCore(range, restLength) {
  if (!(range && range.hasChildNodes())) {
    _setCaretPosition(range, restLength);
    return;
  }
  for (let i = 0; i < range.childNodes.length; i++) {
    let node = range.childNodes[i];
    if (node.textContent.length >= restLength) {
      _setCaretPositionCore(node, restLength);
      return;
    } else {
      restLength -= node.textContent.length;
    }
  }
}

function getCaretPositionCore(editorId, cbf) {
  _getCaretPositionCore(getCurrentRange().endContainer, editorId, result => {
    if (!result) cbf(null);
    else cbf([result[0], result[1] - getCurrentRange().endOffset]);
  });
}

function setCaretPositionCore(pos, editorId) {
  let range = document.getElementById(editorId);
  // select line
  if (pos[0] >= range.childNodes.length) {
    range = range.childNodes[range.childNodes.length - 1];
  } else {
    range = range.childNodes[pos[0]];
  }
  // select character
  if (pos[1] === -1) {
    if (pos[0] === 0) _setCaretPositionCore(range, 0);
    else _setCaretPositionCore(range, 1);
  } else {
    _setCaretPositionCore(range, range.textContent.length - pos[1]);
  }
}

function getNextElement(ele, offset, editorId) {
  if (ele.textContent.length != offset) return null;
  while (1) {
    if (ele.nextSibling) return ele.nextSibling;
    if (ele.nodeType === 1 && ele.id === editorId) return null; // BUG: cross paratraph detection
    ele = ele.parentNode;
  }
}

function updateCaretFocusCore(editorId, lastFocus, cbf) {
  let range = getCurrentRange();
  let curEle = range.endContainer;
  let nextEle = getNextElement(curEle, range.endOffset, editorId);
  let newFocus = [];

  // remove last focus element
  for (let i = 0; i < lastFocus.length; i++) {
    if (lastFocus[i]) lastFocus[i].classList.remove('md-focus');
  }

  // add focus element
  while (1) {
    if (!curEle) break;
    if (curEle.nodeType === 1) {
      if (curEle.id === editorId) {
        break;
      } else {
        newFocus.push(curEle);
        curEle.classList.add('md-focus');
      }
    }
    curEle = curEle.parentNode;
  }
  while (1) {
    if (!nextEle) break;
    if (nextEle.nodeType === 1) {
      if (nextEle.id === editorId) {
        break;
      } else {
        newFocus.push(nextEle);
        nextEle.classList.add('md-focus');
      }
    }
    nextEle = nextEle.parentNode;
  }

  cbf(newFocus);
}

function insertNewLineAfterCaretCore() {
  // 1. get caret position
  let caretPos = getCurrentRange();

  // 2. add node after that
  if (caretPos.endContainer.nodeType === 3) {
    caretPos.endContainer.insertData(caretPos.endOffset, '¶');
    caretPos.endContainer.insertData(caretPos.endOffset, '¶');
  } else {
    caretPos.endContainer.parentNode.innerHTML = caretPos.endContainer.parentNode.innerHTML + '¶¶';
  }
}

function getCurrentparagraphCore(editorId) {
  let node = getCurrentRange().endContainer;
  for (; node.parentNode.id !== editorId; node = node.parentNode) ;
  return node;
}

function _getSelectedParagraphCore(range, editorId) {
  let found = false;
  if (!range.parentNode) return cbf(null);
  if (range.parentNode.id === editorId) {
    let result = 0, i = 0;
    for (; i < range.parentNode.childNodes.length; i++) {
      if (range.parentNode.childNodes[i].isEqualNode(range)) {
        result = i;
        found = true;
        break;
      }
    }
    console.assert(found, 'Node under main editor is not found!');
    return result;
  } else {
    return _getSelectedParagraphCore(range.parentNode, editorId);
  }
}

function getSelectedParagraphCore(editorId) {
  let caretPos = getCurrentRange();
  return [_getSelectedParagraphCore(caretPos.startContainer, editorId), _getSelectedParagraphCore(caretPos.endContainer, editorId)];
}

// ===================================================================================
// public function

export function getCaretPosition(editorId, cbf) {
  getCaretPositionCore(editorId, cbf);
}

export function setCaretPosition(pos, editorId) {
  // console.log(pos);
  setCaretPositionCore(pos, editorId);
}

export function updateCaretFocus(editorId, lastFocus, cbf) {
  updateCaretFocusCore(editorId, lastFocus, cbf);
}

export function insertNewLineAfterCaret() {
  insertNewLineAfterCaretCore();
}

export function getCurrentparagraph(editorId) {
  return getCurrentparagraphCore(editorId);
}

export function getSelectedParagraph(editorId) {
  return getSelectedParagraphCore(editorId);
}
