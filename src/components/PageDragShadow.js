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
  const elementId = props.elementId;
  const dragShadowPos = props.dragShadowPos;
  const setDragShadowPos = props.setDragShadowPos;
  const setReadOnly = props.setReadOnly;

  // States & Reducers
  const [mousePosition, setMousePosition] = useState([0, 0]);

  // Constants
  const enable = dragShadowPos && dragShadowPos.length >= 2 && dragShadowPos[2];

  // Functions
  const getMousePosition = e => {
    setMousePosition([e.clientX, e.clientY]);
  }
  const onDragEnd = e => _onDragEnd(e, setReadOnly, elementId, setDragShadowPos);

  useEffect(() => {
    if (enable) {
      document.onmousemove = getMousePosition;
      document.onmouseup = onDragEnd;
    } else {
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }, [enable]); // eslint-disable-line

  return (
    <div id={elementId} className='geeke-pageDragShadow' style={{left: mousePosition[0] - dragShadowPos[0], top: mousePosition[1] - dragShadowPos[1]}}></div>
  );
}

export default PageDragShadow;