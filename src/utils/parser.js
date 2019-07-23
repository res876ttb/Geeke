import { isValidElement } from "react";

/**
 * @name parser.js
 * @desc Parser for Markdown string.
 */

// ============================================
// import
import {
  getNewID
} from './id.js';

// ============================================
// private function

// markdown decorator: Bold parser
// test: https://regex101.com/r/l1yUUj/1
function mddBoldParser(mds) {
  // remove wrong bold html style
  
  // make bold html style
  mds = mds.replace(/\<b\>\<span class='md-bold' mdid=\'\d+\.\d+\'\>\*\*\<\/span\>([^\s][^\*\n]*[^\s]|[^\s])\<span class='md-bold'\>\*\*\<\/span\>\<b\\\>/g, "**$1**");
  mds = mds.replace(/\*\*([^\s][^\*\n]*[^\s]|[^\s])\*\*/g, `<b><span class='md-bold' mdid='${getNewID()}'>**</span>$1<span class='md-bold'>**</span></b>`);

  return mds;
}

// markdown decorator core
function markdownDecoratorCore(mds) {
  mds = mddBoldParser(mds);
  
  // wrap with div temporarily
  mds = '<div>' + mds + '</div>';
  
  return mds;
}

// ============================================
// public function

export function markdownDecorator(marstr) {
  return markdownDecoratorCore(marstr);
}
