/*************************************************
 * @file PageDragShadow.js
 * @description Show a clone of the dragged block.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import throttle from 'lodash/throttle';

/*************************************************
 * Utils & States
 *************************************************/
import { onDragEnd as _onDragEnd, createDragMaskParam } from '../utils/DraggableBlockUtils';
import {
  setDragShadowPos as _setDragShadowPos,
  setDraggingBlock as _setDraggingBlock,
  pmsc,
} from '../states/editorMisc';

/*************************************************
 * Import Components
 *************************************************/
import BlockDragMask from './BlockDragMask';

/*************************************************
 * Constants
 *************************************************/

/*************************************************
 * Main components
 *************************************************/
const PageDragShadow = (props) => {
  // Props
  const pageUuid = props.pageUuid;
  const elementId = props.elementId;
  const updateEditor = props.updateEditor;
  const editorState = props.editorState;
  const focusEditor = props.focusEditor;

  // States & Reducers
  const initShadowPos = [window.innerWidth * 2, window.innerHeight * 2];
  const dispatch = useDispatch();
  const [mousePosition, setMousePosition] = useState(initShadowPos);
  const [dragMaskParam, setDragMaskParam] = useState(null);
  const dragShadowPos = useSelector((state) => state.editorMisc.pages.get(pageUuid).get(pmsc.dragShadowPos));

  // Constants
  const enable = dragShadowPos && dragShadowPos.length >= 2 && dragShadowPos[2];

  // Functions
  const createDragMask = throttle(
    (x, y) => {
      // Set dragMaskParam. This function may consume lots of CPU resource, so use throttle to reduce CPU usage.
      // To set the dragMaskParam, createDragMaskParam needs the information about selected blocks, which is the fifth elemnt in dragShadowPos.
      let selectedBlocks = dragShadowPos.length >= 5 ? dragShadowPos[4] : [];
      setDragMaskParam(createDragMaskParam(x, y, pageUuid, editorState, selectedBlocks));
    },
    100,
    { trailing: false },
  );
  const getMousePosition = (e) => {
    // Set current mouse position.
    setMousePosition([e.clientX, e.clientY]);
    // Create/update drag mask.
    createDragMask(e.clientX, e.clientY);
  };
  const onDragEnd = (e) => {
    // Get drop handler, which is the fourth element in dragShadowPos, and by default is handleDrop_normalBlock
    const handleDrop = dragShadowPos && dragShadowPos.length >= 3 && dragShadowPos[3] ? dragShadowPos[3] : null;
    const setDraggingBlock = (dragging) => _setDraggingBlock(dispatch, pageUuid, dragging);
    const setDragShadowPos = (newPos) => _setDragShadowPos(dispatch, pageUuid, newPos);

    // If drop handler exists, update editor
    if (handleDrop) updateEditor(handleDrop(e, pageUuid, editorState));

    // Remove mouse position handler
    _onDragEnd(e, setDraggingBlock, elementId, setDragShadowPos);

    // Automatically focus editor
    focusEditor();
  };

  useEffect(() => {
    if (enable) {
      // If drag action has started, set callback function
      document.onmousemove = getMousePosition;
      document.onmouseup = onDragEnd;
    } else {
      // If action has stopped, clear callback function, and prevent creaetDragMask to run once again.
      createDragMask.cancel();
      document.onmousemove = null;
      document.onmouseup = null;

      // Move shadow block out of screen to avoid shadow blink when dragging starts.
      setMousePosition(initShadowPos);

      // This can make dragMask disappear.
      setDragMaskParam(null);
    }
  }, [enable]); // eslint-disable-line

  return (
    <>
      <BlockDragMask dragMaskParam={dragMaskParam} />
      <div
        id={elementId}
        className="geeke-pageDragShadow"
        style={{ left: mousePosition[0] - dragShadowPos[0], top: mousePosition[1] - dragShadowPos[1] }}
      ></div>
    </>
  );
};

export default PageDragShadow;
