/*************************************************
 * @file InlineStyleMath.js
 * @description Inline style for Math.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
import { useSelector } from 'react-redux';
import katex from 'katex';

/*************************************************
 * Utils & States
 *************************************************/
import { pmsc } from '../states/editorMisc';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
import { magicMathStr } from '../constant';
import { checkOverlap } from '../utils/Misc';

/*************************************************
 * Main components
 *************************************************/
const InlineStyleMath = (props) => {
  // Props
  const { math } = props.contentState.getEntity(props.entityKey).getData();
  const blockKey = props.blockKey;
  const startOffset = props.start;
  const endOffset = props.end;

  // State & Reducer
  const pageUuid = useSelector((state) => state.editorMisc.focusEditor);
  const mathRange = useSelector((state) => state.editorMisc.pages.get(pageUuid).get(pmsc.mathRange));

  // Constants
  const editingMath =
    mathRange &&
    mathRange.getStartKey() === blockKey &&
    mathRange.getEndKey() === blockKey &&
    checkOverlap(startOffset, endOffset, mathRange.getStartOffset(), mathRange.getEndOffset());
  const styleClass = editingMath ? 'geeke-inlineStyleMath-editingStyle' : 'geeke-inlineStyleMath-defaultStyle';

  if (math === magicMathStr) {
    // Render default math
    let html = katex.renderToString('\\sqrt{x}', {
      throwOnError: false,
    });
    return (
      <span className={styleClass} style={{ color: 'gray' }} contentEditable={false}>
        <span dangerouslySetInnerHTML={{ __html: html }}></span>
        <span className="geeke-inlineStyleMath-newEq">New Equation</span>
      </span>
    );
  } else {
    // Render math to Tex
    let html = katex.renderToString(math, {
      throwOnError: false,
    });

    return <span className={styleClass} contentEditable={false} dangerouslySetInnerHTML={{ __html: html }}></span>;
  }
};

export default InlineStyleMath;
