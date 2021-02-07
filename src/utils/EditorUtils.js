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
// Styler type
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

// Styler style
export const stylerConst = {
  PREFIX_LEN: 4,
  POSTFIX_LEN: 4,

  PREFIX: "«",
  POSTFIX: "»",
  POSTMARK: ":",

  PREFIX_BOLD: "«sb:",
  POSTFIX_BOLD: ":sb»",
};

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
    
    case stylerEnum.MENTION: // ???
      break;
    
    default:
      console.error('Unknown type:', type);
      break;
  }
}

/**
 * @function stylerBold
 * @description Toggle string bold status in content.
 * @param {string} content 
 * @param {int} start 
 * @param {int} end 
 * «sb:bold»
 */
export function stylerBold(content, start, end) {
  let boldList = findBold(content); // [{start, end}, {start, end}] <- position of start/end char

  /**
   * Remove bold
   * 1. Exactly overlapped
   * 2. Overlapped by another bigger range
   */
  for (let i = 0; i < boldList.length; i++) {
    // 1. Exactly overlapped
    if (start == boldList[i].start && end == boldList[i].end) {
      let part1 = content.substring(0, start - stylerConst.PREFIX_LEN);
      let part2 = content.substring(start, end + 1);
      let part3 = content.substring(end + 1 + stylerConst.POSTFIX_LEN);
      return part1 + part2 + part3;
    }

    // 2. Overlapped by another bigger range
    if (start >= boldList[i].start && end <= boldList[i].end) {
      let res = '', tmp = '';
      // Remove start
      if (boldList[i].start == start) {
        res = content.substring(0, start - stylerConst.PREFIX_LEN);
      } else {
        res = content.substring(0, start);
        res += stylerConst.POSTFIX_BOLD;
      }

      res += content.substring(start, end + 1);
      
      // Remove end
      if (boldList[i].end == end) {
        res += content.substring(end + 1 + stylerConst.POSTFIX_LEN);
      } else {
        res += stylerConst.PREFIX_BOLD;
        res += content.substring(end + 1);
      }

      return res;
    }
  }

  /**
   * Add bold
   * 1. Find first bold range that overlaps with current range.
   * 2. Add bold string.
   * 3. Repeat 1 & 2.
   * 4. Remove continuous bold prefix/postfix.
   */
  // console.log(content, start, end);
  let i = boldList.length - 1;
  let lastEnd = end;
  let res = '';
  for (; i >= 0 && start < lastEnd; i--) {
    if (boldList[i].end < start) break;

    // Move lastEnd
    if (boldList[i].start > start && boldList[i].start <= end && boldList[i].end > end) {
      lastEnd = boldList[i].start - stylerConst.PREFIX_LEN - 1;
      res = content.substring(lastEnd + 1);
    }
    // Check whether this bold range overlaps with current range.
    else if (boldList[i].end < end && boldList[i].end >= start) {
      if (lastEnd == end) {
        res = content.substring(lastEnd + 1);
      }
      // Add bold string
      res = stylerConst.PREFIX_BOLD + content.substring(boldList[i].end + stylerConst.POSTFIX_LEN + 1, lastEnd + 1) + stylerConst.POSTFIX_BOLD + res;
      res = content.substring(boldList[i].start - stylerConst.PREFIX_LEN, boldList[i].end + stylerConst.POSTFIX_LEN + 1) + res;
      lastEnd = boldList[i].start - stylerConst.PREFIX_LEN - 1;
    }
  }

  if (lastEnd == end) {
    // No overlapping
    res = content.substring(0, start) + stylerConst.PREFIX_BOLD + content.substring(start, end + 1) + stylerConst.POSTFIX_BOLD + content.substring(end + 1);
  } else if (lastEnd >= start) {
    // If 1 or more overlapping, but not left partial overlapping
    res = stylerConst.PREFIX_BOLD + content.substring(start, lastEnd + 1) + stylerConst.POSTFIX_BOLD + res;
    res = content.substring(0, start) + res;
  } else {
    // Left partial overlapping
    res = content.substring(0, boldList[i + 1].start - stylerConst.PREFIX_LEN) + res;
  }

  // Remove continuous bold symbols
  res = res.replace(RegExp(`${stylerConst.POSTFIX_BOLD}${stylerConst.PREFIX_BOLD}`, 'g'), '');

  return res;
}

/**
 * @function findBold
 * @description Find position of bold symbol.
 * @param {string} content 
 * @returns A list of bold string position, which includes the start and end position.
 *          EX: "abcd«sb:efg:sb»higj" will output [[8,10]]
 *                       ^ ^
 */
export function findBold(content) {
  let result = [];
  let start = -1;

  for (let i = 0; i < content.length; i++) {
    if (content[i] == stylerConst.PREFIX) {
    if (content.substr(i, stylerConst.PREFIX_LEN) == stylerConst.PREFIX_BOLD) {
      i += stylerConst.PREFIX_LEN;
      start = i;

      for (; i < content.length; i++) {
        if (content[i] == stylerConst.POSTMARK) {
        if (content.substr(i, stylerConst.POSTFIX_LEN) == stylerConst.POSTFIX_BOLD) {
          result.push({start: start, end: i - 1});
          i = i + stylerConst.POSTFIX_LEN - 1;
          break;
        }}
      }
    }}
  }

  return result;
}