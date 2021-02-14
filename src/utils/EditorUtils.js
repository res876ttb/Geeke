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
export const styleType = {
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
export const colorConst = {
  BLUE: 'b',
  BROWN: 'w',
  DEFAULT: 'd',
  GRAY: 'a',
  GREEN: 'g',
  ORANGE: 'o',
  PINK: 'i',
  PURPLE: 'p',
  RED: 'r',
  YELLOW: 'y',
};

const prepostConst = {
  PREFIX: 0,
  POSTFIX: 1,
};

const _stylerConst = {
  PREFIX: '«',
  POSTFIX: '»',
  MARK: ':',
  BOLD: 'sb',
  ITALIC: 'si',
  UNDERLINE: 'su',
  STRIKETHROUGH: 'st',
  LINK: 'sl',
  MATH: 'sm',
  CODE: 'sc',

  COLOR_BLUE: 'cb',
  COLOR_BROWN: 'cw',
  COLOR_DEFAULT: 'cd',
  COLOR_GRAY: 'ca',
  COLOR_GREEN: 'cg',
  COLOR_ORANGE: 'co',
  COLOR_PINK: 'ci',
  COLOR_PURPLE: 'cp',
  COLOR_RED: 'cr',
  COLOR_YELLOW: 'cy',

  BACKGROUND_BLUE: 'bb',
  BACKGROUND_BROWN: 'bw',
  BACKGROUND_DEFAULT: 'bd',
  BACKGROUND_GRAY: 'ba',
  BACKGROUND_GREEN: 'bg',
  BACKGROUND_ORANGE: 'bo',
  BACKGROUND_PINK: 'bi',
  BACKGROUND_PURPLE: 'bp',
  BACKGROUND_RED: 'br',
  BACKGROUND_YELLOW: 'by',
};

export const stylerConst = {
  PREFIX_LEN: 4,
  POSTFIX_LEN: 4,
  TYPE_LEN: 2,

  PREFIX: _stylerConst.PREFIX,
  POSTFIX: _stylerConst.POSTFIX,
  MARK: _stylerConst.MARK,

  PREFIX_BOLD: stylerPrefix(_stylerConst.BOLD),
  POSTFIX_BOLD: stylerPostfix(_stylerConst.BOLD),

  PREFIX_ITALIC: stylerPrefix(_stylerConst.ITALIC),
  POSTFIX_ITALIC: stylerPostfix(_stylerConst.ITALIC),

  PREFIX_UNDERLINE: stylerPrefix(_stylerConst.UNDERLINE),
  POSTFIX_UNDERLINE: stylerPostfix(_stylerConst.UNDERLINE),

  PREFIX_STRIKETHROUGH: stylerPrefix(_stylerConst.STRIKETHROUGH),
  POSTFIX_STRIKETHROUGH: stylerPostfix(_stylerConst.STRIKETHROUGH),

  PREFIX_LINK: stylerPrefix(_stylerConst.LINK),
  POSTFIX_LINK: stylerPostfix(_stylerConst.LINK),

  PREFIX_MATH: stylerPrefix(_stylerConst.MATH),
  POSTFIX_MATH: stylerPostfix(_stylerConst.MATH),

  PREFIX_CODE: stylerPrefix(_stylerConst.CODE),
  POSTFIX_CODE: stylerPostfix(_stylerConst.CODE),

  PREFIX_COLOR_BLUE: stylerPrefix(_stylerConst.COLOR_BLUE),
  PREFIX_COLOR_BROWN: stylerPrefix(_stylerConst.COLOR_BROWN),
  PREFIX_COLOR_DEFAULT: stylerPrefix(_stylerConst.COLOR_DEFAULT),
  PREFIX_COLOR_GRAY: stylerPrefix(_stylerConst.COLOR_GRAY),
  PREFIX_COLOR_GREEN: stylerPrefix(_stylerConst.COLOR_GREEN),
  PREFIX_COLOR_ORANGE: stylerPrefix(_stylerConst.COLOR_ORANGE),
  PREFIX_COLOR_PINK: stylerPrefix(_stylerConst.COLOR_PINK),
  PREFIX_COLOR_PURPLE: stylerPrefix(_stylerConst.COLOR_PURPLE),
  PREFIX_COLOR_RED: stylerPrefix(_stylerConst.COLOR_RED),
  PREFIX_COLOR_YELLOW: stylerPrefix(_stylerConst.COLOR_YELLOW),
  POSTFIX_COLOR_BLUE: stylerPostfix(_stylerConst.COLOR_BLUE),
  POSTFIX_COLOR_BROWN: stylerPostfix(_stylerConst.COLOR_BROWN),
  POSTFIX_COLOR_DEFAULT: stylerPostfix(_stylerConst.COLOR_DEFAULT),
  POSTFIX_COLOR_GRAY: stylerPostfix(_stylerConst.COLOR_GRAY),
  POSTFIX_COLOR_GREEN: stylerPostfix(_stylerConst.COLOR_GREEN),
  POSTFIX_COLOR_ORANGE: stylerPostfix(_stylerConst.COLOR_ORANGE),
  POSTFIX_COLOR_PINK: stylerPostfix(_stylerConst.COLOR_PINK),
  POSTFIX_COLOR_PURPLE: stylerPostfix(_stylerConst.COLOR_PURPLE),
  POSTFIX_COLOR_RED: stylerPostfix(_stylerConst.COLOR_RED),
  POSTFIX_COLOR_YELLOW: stylerPostfix(_stylerConst.COLOR_YELLOW),

  PREFIX_BACKGROUND_BLUE: stylerPrefix(_stylerConst.BACKGROUND_BLUE),
  PREFIX_BACKGROUND_BROWN: stylerPrefix(_stylerConst.BACKGROUND_BROWN),
  PREFIX_BACKGROUND_DEFAULT: stylerPrefix(_stylerConst.BACKGROUND_DEFAULT),
  PREFIX_BACKGROUND_GRAY: stylerPrefix(_stylerConst.BACKGROUND_GRAY),
  PREFIX_BACKGROUND_GREEN: stylerPrefix(_stylerConst.BACKGROUND_GREEN),
  PREFIX_BACKGROUND_ORANGE: stylerPrefix(_stylerConst.BACKGROUND_ORANGE),
  PREFIX_BACKGROUND_PINK: stylerPrefix(_stylerConst.BACKGROUND_PINK),
  PREFIX_BACKGROUND_PURPLE: stylerPrefix(_stylerConst.BACKGROUND_PURPLE),
  PREFIX_BACKGROUND_RED: stylerPrefix(_stylerConst.BACKGROUND_RED),
  PREFIX_BACKGROUND_YELLOW: stylerPrefix(_stylerConst.BACKGROUND_YELLOW),
  POSTFIX_BACKGROUND_BLUE: stylerPostfix(_stylerConst.BACKGROUND_BLUE),
  POSTFIX_BACKGROUND_BROWN: stylerPostfix(_stylerConst.BACKGROUND_BROWN),
  POSTFIX_BACKGROUND_DEFAULT: stylerPostfix(_stylerConst.BACKGROUND_DEFAULT),
  POSTFIX_BACKGROUND_GRAY: stylerPostfix(_stylerConst.BACKGROUND_GRAY),
  POSTFIX_BACKGROUND_GREEN: stylerPostfix(_stylerConst.BACKGROUND_GREEN),
  POSTFIX_BACKGROUND_ORANGE: stylerPostfix(_stylerConst.BACKGROUND_ORANGE),
  POSTFIX_BACKGROUND_PINK: stylerPostfix(_stylerConst.BACKGROUND_PINK),
  POSTFIX_BACKGROUND_PURPLE: stylerPostfix(_stylerConst.BACKGROUND_PURPLE),
  POSTFIX_BACKGROUND_RED: stylerPostfix(_stylerConst.BACKGROUND_RED),
  POSTFIX_BACKGROUND_YELLOW: stylerPostfix(_stylerConst.BACKGROUND_YELLOW),
};

/*************************************************
 * FUNCTIONS
 *************************************************/
function stylerPrefix(type) {
  return `${_stylerConst.PREFIX}${type}${_stylerConst.MARK}`;
}

function stylerPostfix(type) {
  return `${_stylerConst.MARK}${type}${_stylerConst.POSTFIX}`;
}

/**
 * @function getColorStyle
 * @description Get color prefix/postfix constant.
 * @param {styleType} type
 * @param {colorConst} color
 * @param {prepostConst} prepost
 */
function getColorStyle(type, color, prepost) {
  switch (type) {
    case styleType.COLOR:
      if (prepost == prepostConst.PREFIX) {
        switch(color) {
          case colorConst.BLUE:
            return stylerConst.PREFIX_COLOR_BLUE;
          case colorConst.BROWN:
            return stylerConst.PREFIX_COLOR_BROWN;
          case colorConst.DEFAULT:
            return stylerConst.PREFIX_COLOR_DEFAULT;
          case colorConst.GRAY:
            return stylerConst.PREFIX_COLOR_GRAY;
          case colorConst.GREEN:
            return stylerConst.PREFIX_COLOR_GREEN;
          case colorConst.ORANGE:
            return stylerConst.PREFIX_COLOR_ORANGE;
          case colorConst.PINK:
            return stylerConst.PREFIX_COLOR_PINK;
          case colorConst.PURPLE:
            return stylerConst.PREFIX_COLOR_PURPLE;
          case colorConst.RED:
            return stylerConst.PREFIX_COLOR_RED;
          case colorConst.YELLOW:
            return stylerConst.PREFIX_COLOR_YELLOW;
          default:
            console.error(`Unknown color: ${color}.`)
            return null;
        }
      } else if (prepost == prepostConst.POSTFIX) {
        switch(color) {
          case colorConst.BLUE:
            return stylerConst.POSTFIX_COLOR_BLUE;
          case colorConst.BROWN:
            return stylerConst.POSTFIX_COLOR_BROWN;
          case colorConst.DEFAULT:
            return stylerConst.POSTFIX_COLOR_DEFAULT;
          case colorConst.GRAY:
            return stylerConst.POSTFIX_COLOR_GRAY;
          case colorConst.GREEN:
            return stylerConst.POSTFIX_COLOR_GREEN;
          case colorConst.ORANGE:
            return stylerConst.POSTFIX_COLOR_ORANGE;
          case colorConst.PINK:
            return stylerConst.POSTFIX_COLOR_PINK;
          case colorConst.PURPLE:
            return stylerConst.POSTFIX_COLOR_PURPLE;
          case colorConst.RED:
            return stylerConst.POSTFIX_COLOR_RED;
          case colorConst.YELLOW:
            return stylerConst.POSTFIX_COLOR_YELLOW;
          default:
            console.error(`Unknown color: ${color}.`)
            return null;
        }
      } else {
        console.error(`Unknown prepost: ${prepost}.`);
        return null;
      }
    
    case styleType.BACKGROUND:
      if (prepost == prepostConst.PREFIX) {
        switch(color) {
          case colorConst.BLUE:
            return stylerConst.PREFIX_BACKGROUND_BLUE;
          case colorConst.BROWN:
            return stylerConst.PREFIX_BACKGROUND_BROWN;
          case colorConst.DEFAULT:
            return stylerConst.PREFIX_BACKGROUND_DEFAULT;
          case colorConst.GRAY:
            return stylerConst.PREFIX_BACKGROUND_GRAY;
          case colorConst.GREEN:
            return stylerConst.PREFIX_BACKGROUND_GREEN;
          case colorConst.ORANGE:
            return stylerConst.PREFIX_BACKGROUND_ORANGE;
          case colorConst.PINK:
            return stylerConst.PREFIX_BACKGROUND_PINK;
          case colorConst.PURPLE:
            return stylerConst.PREFIX_BACKGROUND_PURPLE;
          case colorConst.RED:
            return stylerConst.PREFIX_BACKGROUND_RED;
          case colorConst.YELLOW:
            return stylerConst.PREFIX_BACKGROUND_YELLOW;
          default:
            console.error(`Unknown color: ${color}.`)
            return null;
        }
      } else if (prepost == prepostConst.POSTFIX) {
        switch(color) {
          case colorConst.BLUE:
            return stylerConst.POSTFIX_BACKGROUND_BLUE;
          case colorConst.BROWN:
            return stylerConst.POSTFIX_BACKGROUND_BROWN;
          case colorConst.DEFAULT:
            return stylerConst.POSTFIX_BACKGROUND_DEFAULT;
          case colorConst.GRAY:
            return stylerConst.POSTFIX_BACKGROUND_GRAY;
          case colorConst.GREEN:
            return stylerConst.POSTFIX_BACKGROUND_GREEN;
          case colorConst.ORANGE:
            return stylerConst.POSTFIX_BACKGROUND_ORANGE;
          case colorConst.PINK:
            return stylerConst.POSTFIX_BACKGROUND_PINK;
          case colorConst.PURPLE:
            return stylerConst.POSTFIX_BACKGROUND_PURPLE;
          case colorConst.RED:
            return stylerConst.POSTFIX_BACKGROUND_RED;
          case colorConst.YELLOW:
            return stylerConst.POSTFIX_BACKGROUND_YELLOW;
          default:
            console.error(`Unknown color: ${color}.`)
            return null;
        }
      } else {
        console.error(`Unknown prepost: ${prepost}.`);
        return null;
      }
    
    default:
      console.error(`Unknown type: ${type}.`);
      break
  }
}

export function contentStyler(content, type, start, end, param) {
  let PREFIX, POSTFIX;

  switch(type) {
    case styleType.BOLD:
      PREFIX = stylerConst.PREFIX_BOLD;
      POSTFIX = stylerConst.POSTFIX_BOLD;
      break;
    
    case styleType.ITALIC:
      PREFIX = stylerConst.PREFIX_ITALIC;
      POSTFIX = stylerConst.POSTFIX_ITALIC;
      break;
    
    case styleType.UNDERLINE:
      PREFIX = stylerConst.PREFIX_UNDERLINE;
      POSTFIX = stylerConst.POSTFIX_UNDERLINE;
      break;
    
    case styleType.STRIKETHROUGH:
      PREFIX = stylerConst.PREFIX_STRIKETHROUGH;
      POSTFIX = stylerConst.POSTFIX_STRIKETHROUGH;
      break;
    
    case styleType.LINK:
      PREFIX = stylerConst.PREFIX_LINK;
      POSTFIX = stylerConst.POSTFIX_LINK;
      break;
      
    case styleType.CODE:
      PREFIX = stylerConst.PREFIX_CODE;
      POSTFIX = stylerConst.POSTFIX_CODE;
      break;
    
    case styleType.MATH:
      PREFIX = stylerConst.PREFIX_MATH;
      POSTFIX = stylerConst.POSTFIX_MATH;
      break;
    
    case styleType.COLOR:
      PREFIX = getColorStyle(styleType.COLOR, param, prepostConst.PREFIX);
      POSTFIX = getColorStyle(styleType.COLOR, param, prepostConst.POSTFIX);
      break;

    case styleType.BACKGROUND:
      PREFIX = getColorStyle(styleType.BACKGROUND, param, prepostConst.PREFIX);
      POSTFIX = getColorStyle(styleType.BACKGROUND, param, prepostConst.POSTFIX);
      break;

    case styleType.HYPERLINK:  // TODO
      break;
    
    case styleType.MENTION:    // TODO: pages, blocks, users, dates
      break;
    
    default:
      console.error('Unknown type:', type);
      break;
  }

  content = styleToggler(content, start, end, PREFIX, POSTFIX);
  content = splitStyle(content);
  return content;
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
        if (content[i] == stylerConst.MARK) {
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

/**
 * @function splitStyle
 * @description Split 2 overlapped styles.
 * @param {string} content 
 */
export function splitStyle(content) {
  let stylePairs = findAllStylerPair(content);
  if (stylePairs.length < 2) return content;

  let i = stylePairs.length - 2;
  let curPair = stylePairs[i + 1], prePair;
  
  /**
   * 1. Check pairs from the end.
   * 1.1. If the previous pair does not partially overlap with the current one, move to the previous pairs and repelat step 1.
   * 1.2. Else, go to step 2.
   * 2. Split the previous pairs. Then, move to the previous pair and repeat step 1.
   */
  while (i >= 0) {
    prePair = stylePairs[i];

    // 1. Check pairs from the end.
    if (prePair.end > curPair.start && prePair.end <= curPair.end) {
      if (prePair.start < curPair.start) {
        // 1.2. Partially overlapped.
        // 2. Split the previous pairs.
        //    xxxAxxxCxxxBxxxDxxx <- Before. AB is a pair, CD is a pair
        //    xxxAxxBCAxxBxxxDxxx <- After.
        let PREPAIR_POSTFIX = content.substr(prePair.end + 1, stylerConst.POSTFIX_LEN);
        let PREPAIR_PREFIX = content.substr(prePair.start - stylerConst.PREFIX_LEN, stylerConst.PREFIX_LEN);
        let CURPAIR_PREFIX = content.substr(curPair.start - stylerConst.PREFIX_LEN, stylerConst.PREFIX_LEN);
        content = content.substring(0, curPair.start - stylerConst.PREFIX_LEN) + 
                  PREPAIR_POSTFIX + CURPAIR_PREFIX + PREPAIR_PREFIX +
                  content.substring(curPair.start);

        // 2. Move to the previous pair and repeat step 1.
        curPair = prePair;
      }
    } else {
      // 1.1. Move to the previous pair.
      curPair = prePair;
    }

    i--;
  }

  return content;
}

/**
 * @function findAllStylerPair
 * @description Find all kinds of style pairs.
 * @param {string} content
 * @returns A list sorted by end position.
 */
export function findAllStylerPair(content) {
  let i = 0;
  let pairs = [];
  let prefixes = [];

  for (; i < content.length; i++) {
    if (content[i] == stylerConst.PREFIX) {
      let prefix = content.substr(i, stylerConst.PREFIX_LEN);
      if (Object.values(stylerConst).indexOf(prefix) == -1) continue;

      prefixes.push(i + stylerConst.PREFIX_LEN);
    } else if (content[i] == stylerConst.POSTFIX) {
      let postfix = content.substr(i - stylerConst.POSTFIX_LEN + 1, stylerConst.POSTFIX_LEN);
      if (Object.values(stylerConst).indexOf(postfix) == -1) continue;

      let type = postfix.substr(1, stylerConst.TYPE_LEN);
      for (let j = 0; j < prefixes.length; j++) {
        if (type == content.substr(prefixes[j] - stylerConst.PREFIX_LEN + 1, stylerConst.TYPE_LEN)) {
          pairs.push({start: prefixes[j], end: i - stylerConst.POSTFIX_LEN});
          prefixes.splice(j, 1);
          break;
        }
      }
    }
  }

  if (prefixes.length > 0) {
    console.error(`Something went wrong in findAllStylerPair. Prefixes: ${prefixes}`);
  }

  return pairs;
}