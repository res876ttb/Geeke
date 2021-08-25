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
import { Tooltip } from '@material-ui/core';

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
  const mathRange = useSelector((state) => state.editorMisc.pages.get(pageUuid)?.get(pmsc.mathRange));

  // TODO: improve performance when there are lots of math equations...
  const selectionState = useSelector((state) => state.editorMisc.selectionState);

  // Constants
  // TODO: this condition has cross-block bug...
  const editingMath =
    (mathRange &&
      mathRange.getStartKey() === blockKey &&
      mathRange.getEndKey() === blockKey &&
      checkOverlap(startOffset, endOffset, mathRange.getStartOffset(), mathRange.getEndOffset())) ||
    (selectionState &&
      !selectionState.isCollapsed() &&
      (selectionState.getAnchorKey() === blockKey || selectionState.getFocusKey() === blockKey) &&
      selectionState.getStartOffset() <= startOffset &&
      selectionState.getEndOffset() >= endOffset);
  const styleClass = editingMath ? 'geeke-inlineStyleMath-editingStyle' : 'geeke-inlineStyleMath-defaultStyle';
  const katexId = `geeke-inlineStyleMath-katex-${props.offsetKey}`;

  // Functions
  const handleClick = (e) => {
    let selectionState = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: startOffset,
      focusKey: blockKey,
      focusOffset: endOffset,
    });
    showEditorSelection(dispatch, pageUuid, selectionState);
    setMathRange(dispatch, pageUuid, selectionState);
  };

  // Calcualte caret position
  let caretPos = null;
  if (
    selectionState &&
    selectionState.getFocusKey() === blockKey &&
    selectionState.isCollapsed() &&
    checkOverlap(startOffset, endOffset, selectionState.getFocusOffset(), selectionState.getAnchorOffset(), true)
  ) {
    let middle = (endOffset + startOffset) / 2;
    if (selectionState.getStartOffset() >= middle) {
      caretPos = 'right';
    } else if (selectionState.getStartOffset() < middle) {
      caretPos = 'left';
    }
  }

  // Generate blink caret
  let leftCaret = null;
  let rightCaret = null;
  let caret = caretPos ? <span className="geeke-inlineStyleMath-caret"></span> : null;
  if (caretPos === 'left') {
    leftCaret = caret;
  } else if (caretPos === 'right') {
    rightCaret = caret;
  }

  // TODO: prevent additional MATH equation re-rendering
  // Render math DOM
  let mathDom = null;
  if (math === magicMathStr) {
    // Render default math
    let html = katex.renderToString('\\sqrt{x}', {
      throwOnError: false,
    });
    mathDom = (
      <Tooltip title={'(none)'} enterDelay={500}>
        <span id={katexId} className={styleClass} style={{ color: 'gray' }}>
          <span dangerouslySetInnerHTML={{ __html: html }}></span>
          <span className="geeke-inlineStyleMath-newEq">New Equation</span>
        </span>
      </Tooltip>
    );
  } else {
    // Render math to Tex
    let html = katex.renderToString(math, {
      throwOnError: false,
    });

    mathDom = (
      <Tooltip title={math} enterDelay={500}>
        <span id={katexId} className={styleClass} dangerouslySetInnerHTML={{ __html: html }}></span>
      </Tooltip>
    );
  }

  // Render the result
  return (
    <span>
      <span className="geeke-inlineStyleMath-editingWrapper" contentEditable={false} onClick={handleClick}>
        {leftCaret}
        {mathDom}
        {rightCaret}
      </span>
      <span className="geeke-inlineStyleMath-transparent">{props.children}</span>
    </span>
  );
};

export default InlineStyleMath;
