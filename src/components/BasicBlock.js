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
  deleteBlocks,
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
  deleteBlockBackward: 8,
  deleteBlockForward: 9,
  moveCursorUpForward: 10,
  moveCursorDownBackward: 11,
};

/*************************************************
 * Main components
 *************************************************/
const BasicBlock = props => {
  const uuid = props.dataId;
  const parentUuid = props.parentId;
  const pageUuid = props.pageId;
  const isFirstBlock = props.isFirstBlock;

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
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const firstBlock = contentState.getFirstBlock();
    const lastBlock = contentState.getLastBlock();
    const firstBlockKey = firstBlock.getKey();
    const lastBlockKey = lastBlock.getKey();
    const focusBlockKey = selectionState.getFocusKey();
    const focusOffset = selectionState.getFocusOffset();

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
        if (firstBlockKey === focusBlockKey && focusOffset === 0) {
          if (isFirstBlock) {
            return keyCommandConst.lessIndent;
          } else {
            return keyCommandConst.deleteBlockBackward;
          }
        }
        break;
      
      case 46: // Delete
        break;
      
      case 37: // Arrow key left
        if (firstBlockKey === focusBlockKey && focusOffset === 0) {
          if (e.shiftKey) {
            // Switch to block select mode
            break;
          } else {
            return keyCommandConst.moveCursorUpForward;
          }
        }
        break;
      
      case 38: // Arrow key Up
        if (e.shiftKey) {
          // return keyCommandConst.selectUp;
          break;
        } else {
          if (firstBlockKey === focusBlockKey) {
            return keyCommandConst.moveCursorUp;
          } else {
            break;
          }
        }
      
      case 39: // Arrow key right
        if (lastBlockKey === focusBlockKey && focusOffset === lastBlock.getLength()) {
          if (e.shiftKey) {
            // Switch to block selection mode
            break;
          } else {
            return keyCommandConst.moveCursorDownBackward;
          }
        }
        break;

      case 40: // Arrow key Down
        if (e.shiftKey) {
          // return keyCommandConst.selectDown;
          break;
        } else {
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
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const moveCursorUp = () => {
      const previousUuid = getPreviousBlock(state, pageUuid, uuid);
      if (previousUuid === uuid) {
        let firstBlock = contentState.getFirstBlock();
        let newSelectionState = new SelectionState({
          anchorKey: firstBlock.getKey(),
          anchorOffset: 0,
          focusKey: firstBlock.getKey(),
          focusOffset: 0,
        });
        updateContent(dispatch, uuid, EditorState.forceSelection(editorState, newSelectionState));
      } else {
        setFocusedBlock(dispatch, pageUuid, previousUuid);
      }
    };

    const moveCursorDown = () => {
      const nextUuid = getNextBlock(state, pageUuid, uuid);
      if (nextUuid === uuid) {
        let lastBlock = contentState.getLastBlock();
        let newSelectionState = new SelectionState({
          anchorKey: lastBlock.getKey(),
          anchorOffset: lastBlock.getLength(),
          focusKey: lastBlock.getKey(),
          focusOffset: lastBlock.getLength(),
        });
        updateContent(dispatch, uuid, EditorState.forceSelection(editorState, newSelectionState));
      } else {
        setFocusedBlock(dispatch, pageUuid, nextUuid);
      }
    };

    switch (command) {
      case keyCommandConst.moreIndent:
        setMoreIndent(dispatch, pageUuid, [uuid]);
        break;
      
      case keyCommandConst.lessIndent:
        setLessIndent(dispatch, pageUuid, [uuid]);
        break;
      
      case keyCommandConst.newBlock: {
        const startKey = selectionState.getStartKey();
        const endKey = selectionState.getEndKey();
        const startOffset = selectionState.getStartOffset();
        const endOffset = selectionState.getEndOffset();

        let newContentState = contentState;

        // Split focused block into 2 blocks
        if (startKey !== endKey || startOffset !== endOffset) {
          newContentState = Modifier.removeRange(newContentState, selectionState, 'forward');
          newContentState = Modifier.splitBlock(newContentState, new SelectionState({
            anchorKey: startKey,
            anchorOffset: startOffset,
            focusKey: startKey,
            focusOffset: startOffset
          }));
        } else {
          newContentState = Modifier.splitBlock(newContentState, selectionState);
        }

        // Split block array into 2 heaps: current heap and the new heap.
        const blockArray = newContentState.getBlocksAsArray();
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
        const newBlockId = addBlock(dispatch, pageUuid, parentUuid, uuid);
        updateContent(dispatch, uuid, newCurEditorState);
        updateContent(dispatch, newBlockId, newNextEditorState);
        setFocusedBlock(dispatch, pageUuid, newBlockId);
      } break;
      
      case keyCommandConst.deleteBlockBackward:
        if (isFirstBlock) break;
        if (!contentState.hasText()) {
          moveCursorUp();
          deleteBlocks(dispatch, pageUuid, parentUuid, [uuid], false);
        } else {
          let previousBlockUuid = getPreviousBlock(state, pageUuid, uuid);
          let previousEditorState = state.cachedBlocks[previousBlockUuid].content;

          // If the content is not ready, move current editorState into it
          if (previousEditorState === '') {
            moveCursorUp();
            updateContent(dispatch, previousBlockUuid, editorState);
            deleteBlocks(dispatch, pageUuid, parentUuid, [uuid], false);
            break;
          }

          let previousContentState = previousEditorState.getCurrentContent();
          let previousBlockArray = previousContentState.getBlocksAsArray();
          let previousLastBlock = previousContentState.getLastBlock();
          let curBlockArray = contentState.getBlocksAsArray();
          let curFirstBlock = contentState.getFirstBlock();
          let fakeSelectionState = new SelectionState({
            anchorKey: previousLastBlock.getKey(),
            anchorOffset: previousLastBlock.getLength(),
            focusKey: curFirstBlock.getKey(),
            focusOffset: 0,
          });
          let newSelectionState = new SelectionState({
            anchorKey: previousLastBlock.getKey(),
            anchorOffset: previousLastBlock.getLength(),
            focusKey: previousLastBlock.getKey(),
            focusOffset: previousLastBlock.getLength(),
          });

          // Remove the barrier between these 2 blocks by remove the fake selection range
          let newPreviousContentState = ContentState.createFromBlockArray(previousBlockArray.concat(curBlockArray));
          newPreviousContentState = Modifier.removeRange(newPreviousContentState, fakeSelectionState, 'forward');

          // Create new editor state with the new selection
          let newPreviousEditorState = EditorState.createWithContent(newPreviousContentState);
          newPreviousEditorState = EditorState.acceptSelection(newPreviousEditorState, newSelectionState);

          moveCursorUp();
          updateContent(dispatch, previousBlockUuid, newPreviousEditorState);
          deleteBlocks(dispatch, pageUuid, parentUuid, [uuid], false);
        }
        break;

      case keyCommandConst.moveCursorUp:
        moveCursorUp();
        break;
      
      case keyCommandConst.moveCursorUpForward: {
        let previousBlockUuid = getPreviousBlock(state, pageUuid, uuid);
        let previousEditorState = state.cachedBlocks[previousBlockUuid].content;

        if (previousEditorState !== '' && previousBlockUuid !== uuid) {
          let previousContentState = previousEditorState.getCurrentContent();
          let previousLastBlock = previousContentState.getLastBlock();
          let newSelectionState = new SelectionState({
            anchorKey: previousLastBlock.getKey(),
            anchorOffset: previousLastBlock.getLength(),
            focusKey: previousLastBlock.getKey(),
            focusOffset: previousLastBlock.getLength(),
          });
          previousEditorState = EditorState.acceptSelection(previousEditorState, newSelectionState);
          updateContent(dispatch, previousBlockUuid, previousEditorState);
        }
        moveCursorUp();
      } break;
      
      case keyCommandConst.moveCursorDown:
        moveCursorDown();
        break;
      
      case keyCommandConst.moveCursorDownBackward: {
        let nextBlockUuid = getNextBlock(state, pageUuid, uuid);
        let nextEditorState = state.cachedBlocks[nextBlockUuid].content;

        if (nextEditorState !== '' && nextBlockUuid !== uuid) {
          let nextContentState = nextEditorState.getCurrentContent();
          let nextFirstBlock = nextContentState.getFirstBlock();
          let newSelectionState = new SelectionState({
            anchorKey: nextFirstBlock.getKey(),
            anchorOffset: 0,
            focusKey: nextFirstBlock.getKey(),
            focusOffset: 0,
          });
          nextEditorState = EditorState.acceptSelection(nextEditorState, newSelectionState);
          updateContent(dispatch, nextBlockUuid, nextEditorState);
        }
        moveCursorDown();
      } break;
      
      case keyCommandConst.selectUp:
        break;
      
      case keyCommandConst.selectDown:
        break;

      default: {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
          updateEditorState(newState);
          return true;
        } else {
          return false;
        }
      }
    }

    return true;
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
