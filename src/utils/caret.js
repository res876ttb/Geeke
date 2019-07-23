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
// function setCaretRangeCore(pos, editorId) {
//   let curEle = document.getElementById(editorId);
//   for (let i in pos) {
//     let idx = pos[i];
//     if (curEle && curEle.hasChildNodes && curEle.hasChildNodes()) {
//       curEle = curEle.childNodes[curEle.childNodes.length - idx];
//     } else {
//       if (curEle && curEle.createTextRange) {
//         range = curEle.createTextRange();
//         range.move('character', curEle.length - idx);
//         range.select();
//       } else { 
//         // @copyright: https://medium.com/compass-true-north/a-dancing-caret-the-unknown-perils-of-adjusting-cursor-position-f252734f595e
//         let selection = window.getSelection();
//         let range = document.createRange();
//         range.setStart(curEle, curEle.length - idx);
//         range.collapse(true);
//         selection.removeAllRanges();
//         selection.addRange(range);
//       }
//       break;
//     }
//   }
// }

// Remove all focus marks
// function clearCaretFocusCore(range, cbf) {
  
// }

// Specify which DOM element is focused by caret.
// function setCaretFocusCore(range, cbf) {

// }




function _getCaretPositionCore(range, editorId, cbf) {
  let found = false;
  if (range.parentNode.getAttribute('id') === editorId) {
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
    if (node.textContent.length > restLength) {
      _setCaretPositionCore(node, restLength);
      return;
    } else if (restLength === node.textContent.length) {
      _setCaretPositionCore(node, restLength);
    } else {
      restLength -= node.textContent.length;
    }
  }
}

function getCaretPositionCore(editorId, cbf) {
  _getCaretPositionCore(getCurrentRange().endContainer, editorId, result => {
    cbf([result[0], result[1] - getCurrentRange().endOffset]);
  });
}

function setCaretPositionCore(pos, editorId) {
  let range = document.getElementById(editorId);
  // select line
  range = range.childNodes[pos[0]]; 
  // select character
  _setCaretPositionCore(range, range.textContent.length - pos[1], editorId);
}

// ===================================================================================
// public function

export function getCaretPosition(editorId, cbf) {
  getCaretPositionCore(editorId, cbf);
}

export function setCaretPosition(pos, editorId) {
  setCaretPositionCore(pos, editorId);
}

export function setCaretFocus(cbf) {
  setCaretFocusCore(getCurrentRange(), cbf);
}

export function clearCaretFocus(cbf) {
  clearCaretFocusCore(getCurrentRange(), cbf);
}
