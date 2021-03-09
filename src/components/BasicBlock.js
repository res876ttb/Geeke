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
const keyCommandConst = {
  lessIndent: 1,
  moreIndent: 2,
  newBlock: 3,
  moveCursorUp: 4,
  moveCursorDown: 5,
  selectUp: 6,
  selectDown: 7,
};

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

  useEffect(() => { // TODO: Keep pressing enter key may cause wrong cursor position
    if (editorState === '') {
      updateEditorState(EditorState.createEmpty());
      setTimeout(() => {
        editor.current.focus();
      }, 0.1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editor.current) {
      if (focus) {
        editor.current.focus();
      } else {
        editor.current.blur();
      }
    }
  }, [focus]);

  const getTruncatedContentState = editorState => {
    
  };

  const mapKeyToEditorCommand = e => {
    switch (e.keyCode) {
      case 13: // Enter
        if (!e.shiftKey) {
          const contentState = editorState.getCurrentContent();
          const selectionState = editorState.getSelection();
          const blockMap = contentState.getBlockMap();

          console.log(selectionState.getStartKey(), selectionState.getStartOffset(), selectionState.getEndKey(), selectionState.getEndOffset());
          console.log(selectionState.getAnchorKey(), selectionState.getAnchorOffset(), selectionState.getFocusKey(), selectionState.getFocusOffset());
          console.log(blockMap, blockMap.get(selectionState.getStartKey()));

          return keyCommandConst.newBlock;
        }
        break;
      
      case 9: // Tab
        if (e.shiftKey) {
          return keyCommandConst.lessIndent;
        } else {
          return keyCommandConst.moreIndent;
        }
      
      case 8: // Backspace
        break;
      
      case 46: // Delete
        break;
      
      case 38: // Arrow key Up
        if (e.shiftKey) {
          // return keyCommandConst.selectUp;
          break;
        } else {
          const contentState = editorState.getCurrentContent();
          const selectionState = editorState.getSelection();
          const firstBlockKey = contentState.getFirstBlock().getKey();
          const focusBlockKey = selectionState.getFocusKey();
          if (firstBlockKey === focusBlockKey) {
            return keyCommandConst.moveCursorUp;
          } else {
            break;
          }
        }

      case 40: // Arrow key Down
        if (e.shiftKey) {
          // return keyCommandConst.selectDown;
          break;
        } else {
          const contentState = editorState.getCurrentContent();
          const selectionState = editorState.getSelection();
          const lastBlockKey = contentState.getLastBlock().getKey();
          const focusBlockKey = selectionState.getFocusKey();
          if (lastBlockKey === focusBlockKey) {
            return keyCommandConst.moveCursorDown;
          } else {
            break;
          }
        }

      default:
        break;
    }

    return getDefaultKeyBinding(e);
  };

  const handleKeyCommand = (command, editorState) => {
    switch (command) {
      case keyCommandConst.moreIndent:
        setMoreIndent(dispatch, pageUuid, [uuid]);
        break;
      
      case keyCommandConst.lessIndent:
        setLessIndent(dispatch, pageUuid, [uuid]);
        break;
      
      case keyCommandConst.newBlock:
        let newBlockId = props.handleNewBlock(uuid)
        updateContent(dispatch, newBlockId, EditorState.createEmpty());
        setFocusedBlock(dispatch, pageUuid, newBlockId);
        break;
      
      case keyCommandConst.moveCursorUp:
        let previousUuid = getPreviousBlock(state, pageUuid, uuid);
        setFocusedBlock(dispatch, pageUuid, previousUuid);
        break;
      
      case keyCommandConst.moveCursorDown:
        let nextUuid = getNextBlock(state, pageUuid, uuid);
        setFocusedBlock(dispatch, pageUuid, nextUuid);
        break;
      
      case keyCommandConst.selectUp:
        break;
      
      case keyCommandConst.selectDown:
        break;

      default:
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
          updateEditorState(newState);
          return true;
        } else {
          return false;
        }
    }

    return true;
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
