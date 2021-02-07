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
  HYPERLINK: 11,
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

  PREFIX_ITALIC: "«si:",
  POSTFIX_ITALIC: ":si»",

  PREFIX_UNDERLINE: "«su:",
  POSTFIX_UNDERLINE: ":su»",

  PREFIX_STRIKETHROUGH: "«st:",
  POSTFIX_STRIKETHROUGH: ":st»",

  PREFIX_LINK: "«sl:",
  POSTFIX_LINK: ":sl»",

  PREFIX_MATH: "«sm:",
  POSTFIX_MATH: ":sm»",

  PREFIX_CODE: "«sc:",
  POSTFIX_CODE: ":sc»",
};

/*************************************************
 * FUNCTIONS
 *************************************************/
export function contentStyler(content, type, start, end, param) {
  let PREFIX, POSTFIX;

  switch(type) {
    case stylerEnum.BOLD:
      PREFIX = stylerConst.PREFIX_BOLD;
      POSTFIX = stylerConst.POSTFIX_BOLD;
      break;
    
    case stylerEnum.ITALIC:
      PREFIX = stylerConst.PREFIX_ITALIC;
      POSTFIX = stylerConst.POSTFIX_ITALIC;
      break;
    
    case stylerEnum.UNDERLINE:
      PREFIX = stylerConst.PREFIX_UNDERLINE;
      POSTFIX = stylerConst.POSTFIX_UNDERLINE;
      break;
    
    case stylerEnum.STRIKETHROUGH:
      PREFIX = stylerConst.PREFIX_STRIKETHROUGH;
      POSTFIX = stylerConst.POSTFIX_STRIKETHROUGH;
      break;
    
    case stylerEnum.LINK:
      PREFIX = stylerConst.PREFIX_LINK;
      POSTFIX = stylerConst.POSTFIX_LINK;
      break;
      
    case stylerEnum.CODE:
      PREFIX = stylerConst.PREFIX_CODE;
      POSTFIX = stylerConst.POSTFIX_CODE;
      break;
    
    case stylerEnum.MATH:
      PREFIX = stylerConst.PREFIX_MATH;
      POSTFIX = stylerConst.POSTFIX_MATH;
      break;
    
    case stylerEnum.COLOR:      // TODO
      break;

    case stylerEnum.BACKGROUND: // TODO
      break;

    case stylerEnum.HYPERLINK:  // TODO
      break;
    
    case stylerEnum.MENTION:    // TODO: pages, blocks, users, dates
      break;
    
    default:
      console.error('Unknown type:', type);
      break;
  }

  return styleToggler(content, start, end, PREFIX, POSTFIX);
}

/**
 * @function styleToggler
 * @description Toggle string bold status in content.
 * @param {string} content 
 * @param {int} start 
 * @param {int} end 
 * «sb:bold»
 */
export function styleToggler(content, start, end, PREFIX, POSTFIX) {
  let pairList = findStylerPair(content, PREFIX, POSTFIX); // return: [{start, end}, {start, end}] <- position of start/end char

  /**
   * Remove style
   * 1. Exactly overlapped
   * 2. Overlapped by another bigger range
   */
  for (let i = 0; i < pairList.length; i++) {
    // 1. Exactly overlapped
    if (start == pairList[i].start && end == pairList[i].end) {
      let part1 = content.substring(0, start - stylerConst.PREFIX_LEN);
      let part2 = content.substring(start, end + 1);
      let part3 = content.substring(end + 1 + stylerConst.POSTFIX_LEN);
      return part1 + part2 + part3;
    }

    // 2. Overlapped by another bigger range
    if (start >= pairList[i].start && end <= pairList[i].end) {
      let res = '', tmp = '';
      // Remove start
      if (pairList[i].start == start) {
        res = content.substring(0, start - stylerConst.PREFIX_LEN);
      } else {
        res = content.substring(0, start);
        res += POSTFIX;
      }

      res += content.substring(start, end + 1);
      
      // Remove end
      if (pairList[i].end == end) {
        res += content.substring(end + 1 + stylerConst.POSTFIX_LEN);
      } else {
        res += PREFIX;
        res += content.substring(end + 1);
      }

      return res;
    }
  }

  /**
   * Add style
   * 1. Find first bold range that overlaps with current range.
   * 2. Add bold string.
   * 3. Repeat 1 & 2.
   * 4. Remove continuous bold prefix/postfix.
   */
  // console.log(content, start, end);
  let i = pairList.length - 1;
  let lastEnd = end;
  let res = '';
  for (; i >= 0 && start < lastEnd; i--) {
    if (pairList[i].end < start) break;

    // Move lastEnd
    if (pairList[i].start > start && pairList[i].start <= end && pairList[i].end > end) {
      lastEnd = pairList[i].start - stylerConst.PREFIX_LEN - 1;
      res = content.substring(lastEnd + 1);
    }
    // Check whether this bold range overlaps with current range.
    else if (pairList[i].end < end && pairList[i].end >= start) {
      if (lastEnd == end) {
        res = content.substring(lastEnd + 1);
      }
      // Add bold string
      res = PREFIX + content.substring(pairList[i].end + stylerConst.POSTFIX_LEN + 1, lastEnd + 1) + POSTFIX + res;
      res = content.substring(pairList[i].start - stylerConst.PREFIX_LEN, pairList[i].end + stylerConst.POSTFIX_LEN + 1) + res;
      lastEnd = pairList[i].start - stylerConst.PREFIX_LEN - 1;
    }
  }

  if (lastEnd == end) {
    // No overlapping
    res = content.substring(0, start) + PREFIX + content.substring(start, end + 1) + POSTFIX + content.substring(end + 1);
  } else if (lastEnd >= start) {
    // If 1 or more overlapping, but not left partial overlapping
    res = PREFIX + content.substring(start, lastEnd + 1) + POSTFIX + res;
    res = content.substring(0, start) + res;
  } else {
    // Left partial overlapping
    res = content.substring(0, pairList[i + 1].start - stylerConst.PREFIX_LEN) + res;
  }

  // Remove continuous bold symbols
  res = res.replace(RegExp(`${POSTFIX}${PREFIX}`, 'g'), '');

  return res;
}

/**
 * @function findStylerPair
 * @description Find position of bold symbol.
 * @param {string} content 
 * @returns A list of styler string position, which includes the start and end position.
 *          EX: "abcd«sb:efg:sb»higj" will output [[8,10]] for bold style.
 *                       ^ ^
 */
export function findStylerPair(content, PREFIX, POSTFIX) {
  let result = [];
  let start = -1;

  for (let i = 0; i < content.length; i++) {
    if (content[i] == stylerConst.PREFIX) {
    if (content.substr(i, stylerConst.PREFIX_LEN) == PREFIX) {
      i += stylerConst.PREFIX_LEN;
      start = i;

      for (; i < content.length; i++) {
        if (content[i] == stylerConst.POSTMARK) {
        if (content.substr(i, stylerConst.POSTFIX_LEN) == POSTFIX) {
          result.push({start: start, end: i - 1});
          i = i + stylerConst.POSTFIX_LEN - 1;
          break;
        }}
      }
    }}
  }

  return result;
}
