/*************************************************
 * @file InlineStyleMath.js
 * @description Inline style for Math.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectionState } from 'draft-js';
import katex from 'katex';

/*************************************************
 * Utils & States
 *************************************************/
import { pmsc, setMathRange } from '../states/editorMisc';
import { checkOverlap } from '../utils/Misc';
import { showEditorSelection } from '../states/editor';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
import { magicMathStr } from '../constant';

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
  const dispatch = useDispatch();
  const pageUuid = useSelector((state) => state.editorMisc.focusEditor);
  const mathRange = useSelector((state) => state.editorMisc.pages.get(pageUuid).get(pmsc.mathRange));

  // Constants
  const editingMath =
    mathRange &&
    mathRange.getStartKey() === blockKey &&
    mathRange.getEndKey() === blockKey &&
    checkOverlap(startOffset, endOffset, mathRange.getStartOffset(), mathRange.getEndOffset());
  const styleClass = editingMath ? 'geeke-inlineStyleMath-editingStyle' : 'geeke-inlineStyleMath-defaultStyle';

  // Functions
  const handleClick = (e) => {
    console.log(startOffset, endOffset);
    let selectionState = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: startOffset,
      focusKey: blockKey,
      focusOffset: endOffset,
    });
    showEditorSelection(dispatch, pageUuid, selectionState);
    setMathRange(dispatch, pageUuid, selectionState);
  };

  let mathDom = null;
  if (math === magicMathStr) {
    // Render default math
    let html = katex.renderToString('\\sqrt{x}', {
      throwOnError: false,
    });
    mathDom = (
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

    mathDom = <span className={styleClass} contentEditable={false} dangerouslySetInnerHTML={{ __html: html }}></span>;
  }

  // Render the result
  return <span onClick={handleClick}>{mathDom}</span>;
};

export default InlineStyleMath;
