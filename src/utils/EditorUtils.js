/**
 * @file EditorUtils.js
 * @description Utilities for editors. For example, text styler.
 */

/*************************************************
 * IMPORT
 *************************************************/

/*************************************************
 * CONST
 *************************************************/
export const stylerEnum = {
  BOLD: 1,
  ITALIC: 2,
  UNDERLINE: 3,
  STRIKETHROUGH: 4,
  LINK: 5,
  CODE: 6,
  MATH: 7,
  COLOR: 8,
  BACKGROUND: 9,
  MENTION: 10,
}

/*************************************************
 * FUNCTIONS
 *************************************************/
export function contentStyler(content, type, start, end, param) {
  switch(type) {
    case stylerEnum.BOLD:
      return stylerBold(content, start, end);
    
    case stylerEnum.ITALIC:
      break;
    
    case stylerEnum.UNDERLINE:
      break;
    
    case stylerEnum.STRIKETHROUGH:
      break;
    
    case stylerEnum.LINK:
      break;
      
    case stylerEnum.CODE:
      break;
    
    case stylerEnum.MATH:
      break;
    
    case stylerEnum.COLOR:
      break;

    case stylerEnum.BACKGROUND:
      break;
    
    case stylerEnum.MENTION:
      break;
    
    default:
      console.error('Unknown type:', type);
      break;
  }
}

function stylerBold(content, start, end) {
  let boldList = findBold(content); // [{start, end}, {start, end}]
  for (let i = 0; i < boldList.length; i++) {
    /**
     * Cancel bold
     * 1. Exactly overlapped
     * 2. Overlapped by another bigger range
     */

    // 1. Exactly overlapped
    if (start == boldList[i].start && start == boldList.end) {
      
    }
  }
}