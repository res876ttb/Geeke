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
import {
  defaultKeyboardHandlingConfig,
  mapKeyToEditorCommand as _mapKeyToEditorCommand,
} from '../utils/BlockKeyboardUtils';

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
    return _mapKeyToEditorCommand(e, {...defaultKeyboardHandlingConfig}, editorState, isFirstBlock);
  };

  const handleKeyCommand = (command, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    // If move successfully, return true
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
        return false;
      } else {
        setFocusedBlock(dispatch, pageUuid, previousUuid);
        return true;
      }
    };

    // If move successfully, return true
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
        return false;
      } else {
        setFocusedBlock(dispatch, pageUuid, nextUuid);
        return true;
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
      
      case keyCommandConst.deleteBlockForward:
        if (moveCursorUp()) {
          let previousBlockUuid = getPreviousBlock(state, pageUuid, uuid);
          let previousEditorState = state.cachedBlocks[previousBlockUuid].content;
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

          updateContent(dispatch, previousBlockUuid, newPreviousEditorState);
          deleteBlocks(dispatch, pageUuid, parentUuid, [uuid], false);
        }
        break;

      case keyCommandConst.deleteBlockBackward: {
        let nextBlockUuid = getNextBlock(state, pageUuid, uuid);
        if (nextBlockUuid !== uuid) {
          let nextEditorState = state.cachedBlocks[nextBlockUuid].content;
          let nextContentState = nextEditorState.getCurrentContent();
          let nextBlockArray = nextContentState.getBlocksAsArray();
          let nextFirstBlock = nextContentState.getFirstBlock();
          let curBlockArray = contentState.getBlocksAsArray();
          let curLastBlock = contentState.getLastBlock();
          let fakeSelectionState = new SelectionState({
            anchorKey: curLastBlock.getKey(),
            anchorOffset: curLastBlock.getLength(),
            focusKey: nextFirstBlock.getKey(),
            focusOffset: 0,
          });
          let newSelectionState = new SelectionState({
            anchorKey: curLastBlock.getKey(),
            anchorOffset: curLastBlock.getLength(),
            focusKey: curLastBlock.getKey(),
            focusOffset: curLastBlock.getLength(),
          });

          // Remove the barrier between these 2 blocks by remove the fake selection range
          let newCurContentState = ContentState.createFromBlockArray(curBlockArray.concat(nextBlockArray));
          newCurContentState = Modifier.removeRange(newCurContentState, fakeSelectionState, 'forward');

          // Create new editor state with the new selection
          let newCurEditorState = EditorState.createWithContent(newCurContentState);
          newCurEditorState = EditorState.forceSelection(newCurEditorState, newSelectionState);

          updateContent(dispatch, uuid, newCurEditorState);
          deleteBlocks(dispatch, pageUuid, state.blockParents[nextBlockUuid], [nextBlockUuid], false);
        }
      } break;

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
