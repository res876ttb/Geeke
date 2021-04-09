/*************************************************
 * @file BasicBlock.js
 * @description Basic block. This block provides
 *  basic editing features like bold, italic, and
 *  etc.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, {useEffect, useRef} from 'react';
import {
  Editor, 
  EditorState,
} from 'draft-js';
import {useDispatch, useSelector} from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import {
  blockType,
  updateContent,
  removeBlockSelection,
} from '../states/editor';
import {
  defaultKeyboardHandlingConfig,
  mapKeyToEditorCommand as _mapKeyToEditorCommand,
  handleKeyCommand as _handleKeyCommand,
} from '../utils/BlockKeyboardUtils';
import {
  draggableOnDragEnter,
  draggableOnDragLeave,
  draggableOnDragStart,
  draggableOnDrop,
  draggableOnKeyDown,
  draggableOnMouseEnter,
  draggableOnMouseLeave,
  draggableOnMouseMove,
} from '../utils/DraggableBlockUtils';

/*************************************************
 * Import Components
 *************************************************/
import BlockDragMask from './BlockDragMask';

/*************************************************
 * Styles
 *************************************************/
import '../styles/BasicBlock.css';

/*************************************************
 * Constant
 *************************************************/
import {
  indentWidth,
  draggableLeftPadding,
  editorLeftPadding,
} from '../constant';

/*************************************************
 * Main components
 *************************************************/
const BasicBlock = props => {
  // Props
  const uuid = props.dataId;
  const parentUuid = props.parentId;
  const pageUuid = props.pageId;
  const isFirstBlock = props.isFirstBlock;
  const depth = props.depth;

  // States & Reducers
  const state = useSelector(state => state.editor);
  const block = useSelector(state => state.editor.cachedBlocks[uuid]);
  const editorState = useSelector(state => state.editor.cachedBlocks[uuid].content);
  const cachedBlocks = useSelector(state => state.editor.cachedBlocks);
  const dispatch = useDispatch();
  const editor = useRef(null);

  // Constants
  const selectedBlock = state.selectedBlocks[pageUuid].blocks.indexOf(uuid) > -1;
  const readOnly = state.tempLock[pageUuid] ? true : false;
  const focusedBlock = state.focusedBlock[pageUuid];
  const focus = uuid === focusedBlock;
  const hovering = uuid === state.hoveredBlock[pageUuid];
  const dragging = uuid === state.draggedBlock[pageUuid];

  const updateEditorState = newState => {
    updateContent(dispatch, uuid, newState);
  }

  useEffect(() => { // TODO: Keep pressing enter key may cause wrong cursor position
    if (editorState === '') {
      updateEditorState(EditorState.createEmpty());
      setTimeout(() => {
        editor.current.focus();
      }, 0.1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editor.current && focusedBlock) {
      if (focus) {
        editor.current.focus();
      } else {
        editor.current.blur();
      }
    }
  }, [focus, focusedBlock]);

  const mapKeyToEditorCommand = e => {
    return _mapKeyToEditorCommand(e, {...defaultKeyboardHandlingConfig}, editorState, isFirstBlock);
  };

  const handleKeyCommand = (command, editorState) => {
    return _handleKeyCommand(dispatch, pageUuid, parentUuid, uuid, state, editorState, command);
  }

  const handleRemoveBlockSelection = () => {
    removeBlockSelection(dispatch, pageUuid);
  }

  const blocks = 
  <div>
    {block.blocks.map((blockUuid, idx) => {
      switch(cachedBlocks[blockUuid].type) {
        case blockType.basic:
          return (
            <BasicBlock key={blockUuid}
              dataId={blockUuid}
              pageId={pageUuid}
              parentId={uuid}
              isFirstBlock={idx === 0}
              depth={depth + 1}
            />
          );

        default:
          return null;
      };
    })}
  </div>;

  return (
    <div
      className='geeke-blockWrapper'
      draggable='true'
      onDragEnter= {e => draggableOnDragEnter (e, dispatch, pageUuid, uuid)}
      onDragOver=  {e => draggableOnDragEnter (e, dispatch, pageUuid, uuid)}
      onDragLeave= {e => draggableOnDragLeave (e, dispatch, pageUuid      )}
      onDragStart= {e => draggableOnDragStart (e, dispatch, pageUuid, uuid)}
      onDrop=      {e => draggableOnDrop      (e, dispatch, pageUuid      )}
      onKeyDown=   {e => draggableOnKeyDown   (e, dispatch, pageUuid      )}
      onMouseEnter={e => draggableOnMouseEnter(e, dispatch, pageUuid, uuid)}
      onMouseLeave={e => draggableOnMouseLeave(e, dispatch, pageUuid      )}
      onMouseMove= {e => draggableOnMouseMove (e, dispatch, pageUuid, uuid)}
    >
      <div
        className={'geeke-draggableWrapper' + (hovering ? '' : ' geeke-invisible')}
        style={{marginLeft: `${draggableLeftPadding + indentWidth * depth}rem`}}
      >
        <img draggable="false" src='./drag.svg' alt='handleBlockDrag'></img>
      </div>
      <div className={(selectedBlock ? 'geeke-selectedBlock' : '')} draggable='true' onDragStart={e => e.preventDefault()}>
        <div
          className={'geeke-editorWrapper'} 
          style={{paddingLeft: `${editorLeftPadding + indentWidth * depth}rem`}}
        >
          {
            editorState === '' ? null :
            <Editor
              ref={editor}
              editorState={editorState}
              onChange={newEditorState => updateEditorState(newEditorState)}
              keyBindingFn={mapKeyToEditorCommand}
              handleKeyCommand={handleKeyCommand}
              onFocus={handleRemoveBlockSelection}
              readOnly={readOnly}
            />
          }
        </div>
        {
          block.blocks.length > 0 ?
          <>{blocks}</> : null
        }
      </div>
  
      <BlockDragMask show={dragging} />
    </div>
  )
}

export default BasicBlock;
