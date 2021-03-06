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
  getDefaultKeyBinding,
  RichUtils,
  KeyBindingUtil,
} from 'draft-js';
import {useDispatch, useSelector} from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import {
  setFocusedBlock,
  getPreviousBlock,
  getNextBlock,
  setMoreIndent,
  setLessIndent,
  blockType,
  updateContent,
} from '../states/editor';

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

/*************************************************
 * Main components
 *************************************************/
const BasicBlock = props => {
  const uuid = props.dataId;
  const pageUuid = props.pageId;

  const state = useSelector(state => state.editor);
  const block = useSelector(state => state.editor.cachedBlocks[uuid]);
  const editorState = useSelector(state => state.editor.cachedBlocks[uuid].content);
  const cachedBlocks = useSelector(state => state.editor.cachedBlocks);
  const dispatch = useDispatch();
  const editor = useRef(null);

  const focusedBlock = state.focusedBlock[pageUuid];
  const focus = uuid === focusedBlock;

  const updateEditorState = newState => {
    updateContent(dispatch, uuid, newState);
  }

  useEffect(() => { // TODO: fix continues pression of enter cause incorrect position
    if (editorState === '') {
      updateEditorState(EditorState.createEmpty());
      setTimeout(() => {
        editor.current.focus();
      }, 0.1);
    }
  }, []);

  useEffect(() => {
    if (editor.current) {
      if (focus) {
        editor.current.focus();
      } else {
        editor.current.blur();
      }
    }
  }, [focus]);

  const mapKeyToEditorCommand = e => {
    const preventDefault = null; // Prevent default action.
    let res = null;
    switch (e.keyCode) {
      case 13: // Enter
        if (!e.shiftKey) {
          e.preventDefault();
          
          let newBlockId = props.handleNewBlock(uuid)
          setFocusedBlock(dispatch, pageUuid, newBlockId);
          return preventDefault;
        }
        break;
      
      case 9: // Tab
        if (e.shiftKey) {
          // 1 LESS indent level
          setLessIndent(dispatch, pageUuid, [uuid]);
          e.preventDefault();
        } else {
          // 1 MORE indent level
          setMoreIndent(dispatch, pageUuid, [uuid]);
          e.preventDefault();
        }
        break;

      case 76: // L
        res = (KeyBindingUtil.hasCommandModifier(e) && e.shiftKey) ? 'inline-latex' : null;
        break;
      
      case 38: // Arrow key Up
        if (e.shiftKey) {
          return preventDefault;
        } else {
          let previousUuid = getPreviousBlock(state, pageUuid, uuid);
          setFocusedBlock(dispatch, pageUuid, previousUuid);
        }
        break;

      case 40: // Arrow key Down
        if (e.shiftKey) {
          return preventDefault;
        } else {
          let nextUuid = getNextBlock(state, pageUuid, uuid);
          setFocusedBlock(dispatch, pageUuid, nextUuid);
        }
        break;

      default:
        break;
    }

    if (res != null) {
      return res;
    } else {
      return getDefaultKeyBinding(e);
    }
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      updateEditorState(newState);
      return true;
    }
    return false;
  }

  const blocks = 
  <div>
    {block.blocks.map(blockUuid => {
      switch(cachedBlocks[blockUuid].type) {
        case blockType.basic:
          return (
            <BasicBlock key={blockUuid}
              dataId={blockUuid}
              pageId={pageUuid}
              handleNewBlock={props.handleNewBlock}
            />
          );

        default:
          return <></>
      };
    })}
  </div>;

  return (
    <>
      <div className='test-outline'>
        {
          editorState === '' ? null :
          <Editor 
            ref={editor}
            editorState={editorState}
            onChange={newEditorState => updateEditorState(newEditorState)}
            keyBindingFn={mapKeyToEditorCommand}
            handleKeyCommand={handleKeyCommand}
          />
        }
      </div>
      {
        block.blocks.length > 0 ?
        <div className='geeke-indent'>
          {blocks}
        </div> : null
      }
    </>
  )
}

export default BasicBlock;
