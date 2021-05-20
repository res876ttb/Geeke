/*************************************************
 * @file PageDragShadow.js
 * @description Show a clone of the dragged block.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';

/*************************************************
 * Utils & States
 *************************************************/
import {
  onDragEnd as _onDragEnd
} from '../utils/DraggableBlockUtils';

/*************************************************
 * Import Components
 *************************************************/

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

  // Constants
  const enable = dragShadowPos && dragShadowPos.length >= 2 && dragShadowPos[2];
  const initShadowPos = [window.innerWidth * 2, window.innerHeight * 2];

  // States & Reducers
  const [mousePosition, setMousePosition] = useState(initShadowPos);

  // Functions
  const getMousePosition = e => {
    setMousePosition([e.clientX, e.clientY]);
  }
  const onDragEnd = e => {
    const handleDrop = dragShadowPos && dragShadowPos.length >= 3 && dragShadowPos[3] ? dragShadowPos[3] : null;
    if (handleDrop) updateEditor(handleDrop(e, pageUuid, editorState));

    _onDragEnd(e, setReadOnly, elementId, setDragShadowPos);
  }

  useEffect(() => {
    if (enable) {
      document.onmousemove = getMousePosition;
      document.onmouseup = onDragEnd;
    } else {
      document.onmousemove = null;
      document.onmouseup = null;
      setMousePosition(initShadowPos);
    }
  }, [enable]); // eslint-disable-line

  return (
    <div id={elementId} className='geeke-pageDragShadow' style={{left: mousePosition[0] - dragShadowPos[0], top: mousePosition[1] - dragShadowPos[1]}}></div>
  );
}

export default PageDragShadow;