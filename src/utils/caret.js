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
    if (range.parentNode.getAttribute('id') === editorId) {
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

// Get caret position from the index list.
// Find node from the root DOM element.
// If current element does not exist, the element the index specify is removed.
function setCaretRangeCore(pos, editorId) {
  let curEle = document.getElementById(editorId);
  for (let i in pos) {
    let idx = pos[i];
    if (curEle && curEle.hasChildNodes && curEle.hasChildNodes()) {
      curEle = curEle.childNodes[curEle.childNodes.length - idx];
    } else {
      if (curEle && curEle.createTextRange) {
        range = curEle.createTextRange();
        range.move('character', curEle.length - idx);
        range.select();
      } else { 
        // @copyright: https://medium.com/compass-true-north/a-dancing-caret-the-unknown-perils-of-adjusting-cursor-position-f252734f595e
        let selection = window.getSelection();
        let range = document.createRange();
        range.setStart(curEle, curEle.length - idx);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      break;
    }
  }
}

// Remove all focus marks
function clearCaretFocusCore(range, cbf) {
  
}

// Specify which DOM element is focused by caret.
function setCaretFocusCore(range, cbf) {
  // get list from 
}

// ===================================================================================
// public function

export function getCaretRange(editorId, cbf) {
  getCaretRangeCore(editorId, cbf);
}

export function setCaretRange(pos, editorId) {
  setCaretRangeCore(pos, editorId);
}

export function setCaretFocus(cbf) {
  setCaretFocusCore(getCurrentRange(), cbf);
}

export function clearCaretFocus(cbf) {
  clearCaretFocusCore(getCurrentRange(), cbf);
}
