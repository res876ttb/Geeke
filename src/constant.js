/**
 * @file constant.js
 * @description All global constant will be located in this file for configuration convenience.
 */

const getRem = () => {
  let getRemEle = document.getElementById('geeke-getRem');
  if (getRemEle) return parseFloat(getComputedStyle(getRemEle).fontSize);
  else return parseFloat(getComputedStyle(document.body).fontSize);
}
export const oneRem = getRem();
export const remToPx = rem => rem * oneRem; // Unit: px

export const indentWidth = 1.6; // Unit: rem
export const draggableLeftPadding = 2; // Unit: rem
export const editorLeftPadding = 3; // Unit: rem
export const editorTopPadding = 0.3; // Unit: rem
export const editorDraggableButtonLeftPadding = 1.6; // Unit: rem
export const editorDraggableButtonWidth = 1.6; // Unit: rem

export const dragMaskHeight = 0.25; // Unit: rem
export const dragMaskIndentInterval = 0.15; // Unit: rem

export const blockDataKeys = {
  indentLevel: 'indentLevel',
  numberListOrder: 'numberListOrder',
  checkListCheck: 'checkListCheck',
  toggleListToggle: 'toggleListToggle',
  parentKey: 'parentKey',
  headingType: 'headingType',
  codeContent: 'codeContent',
};

export const constBlockType = {
  default: 'unstyled',
  bulletList: 'bullet-list',
  numberList: 'number-list',
  checkList: 'check-list',
  toggleList: 'toggle-list',
  quote: 'quote',
  heading: 'heading',
  code: 'code',
};

export const headingType = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

export const constAceEditorAction = {
  left: 0,
  up: 1,
  down: 2,
  right: 3,
};

export const constMoveDirection = {
  up: 0,
  down: 1,
};