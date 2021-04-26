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

export const dragMaskHeight = 3; // Unit: px
export const dragMaskIndentInterval = 0.15; // Unit: rem

export const blockDataKeys = {
  indentLevel: 'indentLevel',
}