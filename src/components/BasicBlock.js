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
  setHoverBlock,
} from '../states/editor';
import {
  defaultKeyboardHandlingConfig,
  mapKeyToEditorCommand as _mapKeyToEditorCommand,
  handleKeyCommand as _handleKeyCommand,
} from '../utils/BlockKeyboardUtils';
import {
  onBasicBlockDragStart
} from '../utils/DraggableBlockUtils';

/*************************************************
 * Import Components
 *************************************************/

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
  const hover = uuid === state.hoveredBlock[pageUuid];

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
          return <></>
      };
    })}
  </div>;

  return (
    <div
      className={'geeke-blockWrapper' + (selectedBlock ? ' geeke-selectedBlock' : '')}
      draggable='true'
      onDragStart={e => {e.stopPropagation(); onBasicBlockDragStart();}}
      onMouseEnter={e => {e.stopPropagation(); setHoverBlock(dispatch, pageUuid, uuid);}}
      onMouseLeave={e => {e.stopPropagation(); setHoverBlock(dispatch, pageUuid, null);}}
      onMouseMove={e => {e.stopPropagation(); setHoverBlock(dispatch, pageUuid, uuid);}}
      onKeyDown={e => {e.stopPropagation(); setHoverBlock(dispatch, pageUuid, null);}}
    >
      <div
        className={'geeke-draggableWrapper' + (hover ? '' : ' geeke-invisible')}
        style={{marginLeft: `${draggableLeftPadding + indentWidth * depth}rem`}}
      >
        <img draggable="false" src='./drag.svg' alt='handleBlockDrag'></img>
      </div>
      <div draggable='true' onDragStart={e => e.preventDefault()}>
        <div className='geeke-editorWrapper' style={{marginLeft: `${indentWidth * depth}rem`}}>
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
    </div>
  )
}

export default BasicBlock;
