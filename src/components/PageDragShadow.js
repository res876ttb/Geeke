/*************************************************
 * @file PageDragShadow.js
 * @description Show a clone of the dragged block.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import throttle from 'lodash/throttle';

/*************************************************
 * Utils & States
 *************************************************/
import {
  onDragEnd as _onDragEnd,
  createDragMaskParam,
} from '../utils/DraggableBlockUtils';

/*************************************************
 * Import Components
 *************************************************/
import BlockDragMask from './BlockDragMask';

/*************************************************
 * Styles
 *************************************************/
import '../styles/PageDragShadow.css';

/*************************************************
 * Constants
 *************************************************/

/*************************************************
 * Main components
 *************************************************/
const PageDragShadow = props => {
  // Props
  const pageUuid = props.pageUuid;
  const elementId = props.elementId;
  const dragShadowPos = props.dragShadowPos;
  const setDragShadowPos = props.setDragShadowPos;
  const setReadOnly = props.setReadOnly;
  const updateEditor = props.updateEditor;
  const editorState = props.editorState;
  const focusEditor = props.focusEditor;

  // Constants
  const enable = dragShadowPos && dragShadowPos.length >= 2 && dragShadowPos[2];
  const initShadowPos = [window.innerWidth * 2, window.innerHeight * 2];

  // States & Reducers
  const [mousePosition, setMousePosition] = useState(initShadowPos);
  const [dragMaskParam, setDragMaskParam] = useState(null);

  // Functions
  const createDragMask = throttle((x, y) => {
    setDragMaskParam(createDragMaskParam(x, y, pageUuid, editorState, dragShadowPos.length >= 5 ? dragShadowPos[4] : []));
  }, 100);
  const getMousePosition = e => {
    setMousePosition([e.clientX, e.clientY]);
    createDragMask(e.clientX, e.clientY);
  }
  const onDragEnd = e => {
    const handleDrop = dragShadowPos && dragShadowPos.length >= 3 && dragShadowPos[3] ? dragShadowPos[3] : null;
    if (handleDrop) updateEditor(handleDrop(e, pageUuid, editorState));

    _onDragEnd(e, setReadOnly, elementId, setDragShadowPos);
    focusEditor();
  }

  useEffect(() => {
    if (enable) {
      document.onmousemove = getMousePosition;
      document.onmouseup = onDragEnd;
    } else {
      document.onmousemove = null;
      document.onmouseup = null;
      setMousePosition(initShadowPos);
      setDragMaskParam(null);
    }
  }, [enable]); // eslint-disable-line

  return (
    <>
    <BlockDragMask dragMaskParam={dragMaskParam} />
    <div id={elementId} className='geeke-pageDragShadow' style={{left: mousePosition[0] - dragShadowPos[0], top: mousePosition[1] - dragShadowPos[1]}}></div>
    </>
  );
}

export default PageDragShadow;