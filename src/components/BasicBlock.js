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
  Modifier,
  ContentState,
  SelectionState,
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
  addBlock,
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
  const parentUuid = props.parentId;
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

  const mapKeyToEditorCommand = e => {
    switch (e.keyCode) {
      case 13: // Enter
        if (!e.shiftKey) {
          e.preventDefault();
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
        {
          let contentState = editorState.getCurrentContent();
          const selectionState = editorState.getSelection();
          const startKey = selectionState.getStartKey();
          const endKey = selectionState.getEndKey();
          const startOffset = selectionState.getStartOffset();
          const endOffset = selectionState.getEndOffset();

          // Split focused block into 2 blocks
          if (startKey !== endKey || startOffset !== endOffset) {
            contentState = Modifier.removeRange(contentState, selectionState, 'forward');
            contentState = Modifier.splitBlock(contentState, new SelectionState({
              anchorKey: startKey,
              anchorOffset: startOffset,
              focusKey: startKey,
              focusOffset: startOffset
            }));
          } else {
            contentState = Modifier.splitBlock(contentState, selectionState);
          }

          const blockArray = contentState.getBlocksAsArray();
          let newBlockArray = [];
          let newNextBlockArray = [];
          let idx = 0;

          for(; idx < blockArray.length; idx++) {
            newBlockArray.push(blockArray[idx]);
            if (blockArray[idx].getKey() === startKey) break;
          }

          for (idx += 1; idx < blockArray.length; idx++) {
            newNextBlockArray.push(blockArray[idx]);
          }

          // Move cursor to correct position
          let newCurEditorState = EditorState.createWithContent(ContentState.createFromBlockArray(newBlockArray));
          let newNextEditorState = EditorState.createWithContent(ContentState.createFromBlockArray(newNextBlockArray));
          let newCurContentState = newCurEditorState.getCurrentContent();
          let newNextContentState = newNextEditorState.getCurrentContent();
          if (newBlockArray.length > 0) {
            newCurEditorState = EditorState.acceptSelection(newCurEditorState, new SelectionState({
              anchorKey: newCurContentState.getLastBlock().getKey(),
              anchorOffset: newCurContentState.getLastBlock().getLength(),
              focusKey: newCurContentState.getLastBlock().getKey(),
              focusOffset: newCurContentState.getLastBlock().getLength(),
            }));
          }
          if (newNextBlockArray.length > 0) {
            newNextEditorState = EditorState.acceptSelection(newNextEditorState, new SelectionState({
              anchorKey: newNextContentState.getFirstBlock().getKey(),
              anchorOffset: 0,
              focusKey: newNextContentState.getFirstBlock().getKey(),
              focusOffset: 0,
            }));
          }

          // Apply new editors state
          let newBlockId = addBlock(dispatch, pageUuid, parentUuid, uuid);
          updateContent(dispatch, uuid, newCurEditorState);
          updateContent(dispatch, newBlockId, newNextEditorState);
          setFocusedBlock(dispatch, pageUuid, newBlockId);
        }
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
              parentId={uuid}
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
