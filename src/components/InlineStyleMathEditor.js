/*************************************************
 * @file InlineStyleMathEditor.js
 * @description Editor for inline math.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectionState } from 'draft-js';
import { Menu, Snackbar, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

/*************************************************
 * Utils & States
 *************************************************/
import { checkOverlap, getCaretRange } from '../utils/Misc';
import { pmsc, setEditingMath, setMathRange } from '../states/editorMisc';
import { createEmptyInlineMath, removeInlineMath, showEditorSelection, updateInlineMathData } from '../states/editor';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
import { remToPx } from '../constant';

/*************************************************
 * Main components
 *************************************************/
const InlineStyleMathEditor = (props) => {
  // Props
  const handleFocusEditor = props.handleFocusEditor;

  // State & Reducer
  const dispatch = useDispatch();
  const [anchorPosition, setAnchorPosition] = useState({ top: -1000, left: 0 });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectionState, setSelectionState] = useState(null);
  const [mathContent, setMathContent] = useState('');
  const [lastMathContent, setLastMathContent] = useState('');
  const [showCorssLineWarning, setShowCrossLineWarning] = useState(false);
  const [mathEntityKey, setMathEntityKey] = useState(null);
  const [curBlockKey, setCurBlockKey] = useState(null);
  const [focusEditor, setFocusEditor] = useState(false);
  const pageUuid = useSelector((state) => state.editorMisc.focusEditor);
  const mathRange = useSelector((state) => state.editorMisc.pages?.get(pageUuid)?.get(pmsc.mathRange));
  const editorState = useSelector((state) => state.editor.cachedPages.get(pageUuid)?.get('content'));

  // Constants
  const anchorId = `geeke-inlineStyleMathEditor-${pageUuid}`;
  const initAnchorPosition = { top: -1000, left: 0 };

  const clearState = () => {
    setAnchorPosition(initAnchorPosition);
    setMathRange(dispatch, pageUuid, null);
    setMathContent('');
    setFocusEditor(false);
    setCurBlockKey(null);
  };

  const closeEditor = (e, curSelectionState = null) => {
    e?.stopPropagation();
    // Lock editor to prevent rendering cursor
    setEditingMath(dispatch, pageUuid, true);
    setTimeout(() => {
      clearState();
      // Unlock editor to enable editing
      setEditingMath(dispatch, pageUuid, false);
      setTimeout(
        () => showEditorSelection(dispatch, pageUuid, curSelectionState ? curSelectionState : selectionState),
        0,
      );
    });
  };

  // Open math editor when mathRange is updated
  useEffect(() => {
    if (mathRange) {
      // Get position
      const editorDom = document.getElementById(`geeke-editor-${pageUuid}`);
      const editorRect = editorDom.getBoundingClientRect();
      const selectionRect = getCaretRange().getBoundingClientRect();
      const menuHeight = remToPx(1.5);
      const newPosition = {
        top: editorDom.offsetTop + (selectionRect.top - editorRect.top) + menuHeight,
        left: editorDom.offsetLeft + (selectionRect.left - editorRect.left) + selectionRect.width / 2,
      };

      // Get entity data
      // Rule: if there are any math entity in the selection range,
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();

      // Check whether the selected text are all in the same block
      if (selectionState.getAnchorKey() !== selectionState.getFocusKey()) {
        closeEditor(null, selectionState);
        setShowCrossLineWarning(true);
        return;
      }

      const anchorBlock = contentState.getBlockForKey(selectionState.getAnchorKey());
      let firstMathEntityKey = null;
      let curEntityKey = null;
      anchorBlock.findEntityRanges(
        (value) => {
          curEntityKey = value.entity;
          return true;
        },
        (start, end) => {
          if (!curEntityKey) return;
          const curEntity = contentState.getEntity(curEntityKey);
          const startOffset = selectionState.getStartOffset();
          const endOffset = selectionState.getEndOffset();
          if (checkOverlap(start, end, startOffset, endOffset, false)) {
            if (curEntity.type === 'MATH' && !firstMathEntityKey) {
              firstMathEntityKey = curEntityKey;
            }
          }
        },
      );

      let newMathEntityKey = null;

      // If firstMathEntityKey is not null, then get the math content
      let math = '';
      if (firstMathEntityKey) {
        const entity = contentState.getEntity(firstMathEntityKey);
        math = entity.data.math;
        newMathEntityKey = firstMathEntityKey;
      }

      // If math is empty, we have to create a character that represent the inline style.
      if (math.length === 0) {
        if (selectionState.isCollapsed()) {
          // If math is empty string, create a default one
          createEmptyInlineMath(dispatch, pageUuid, null, null, (entityKey) => {
            newMathEntityKey = entityKey;
          });
        } else {
          let curBlock = contentState.getBlockForKey(selectionState.getFocusKey());
          math = curBlock.getText().slice(selectionState.getStartOffset(), selectionState.getEndOffset());
          createEmptyInlineMath(dispatch, pageUuid, math, null, (entityKey) => {
            newMathEntityKey = entityKey;
          });
        }

        setLastMathContent('');
      } else {
        setLastMathContent(math);
      }

      setMathEntityKey(newMathEntityKey);
      setCurBlockKey(selectionState.getFocusKey());
      setMathContent(math);
      setAnchorPosition(newPosition);
      setSelectionState(mathRange);
      setFocusEditor(true);
    } else if (anchorPosition.left !== 0) {
      clearState();
    }
  }, [mathRange]); // eslint-disable-line

  // Set anchor position
  useEffect(() => {
    setAnchorEl(document.getElementById(anchorId));
  }, []); // eslint-disable-line

  // revertEntity
  const revertEntity = () => {
    if (lastMathContent === '') {
      // This entity is newly created. Remove the entity to revert the change.
      removeInlineMath(dispatch, pageUuid, curBlockKey, mathEntityKey);
    } else {
      // This entity is not newly created. Set original math content to revert the change.
      updateInlineMathData(dispatch, pageUuid, mathEntityKey, lastMathContent);
    }
  };

  // Handle keypress
  const onKeyDown = (e) => {
    const key = e.nativeEvent.keyCode;
    switch (key) {
      case 13: // Enter
        if (mathContent === '') {
          removeInlineMath(dispatch, pageUuid, curBlockKey, mathEntityKey, true);
          closeEditor(e, new SelectionState({
            anchorKey: selectionState.getStartKey(),
            anchorOffset: selectionState.getStartOffset(),
            focusKey: selectionState.getStartKey(),
            focusOffset: selectionState.getStartOffset(),
          }));
        } else {
          closeEditor(e);
        }
        break;
      case 27: // Esc
        // Remove entity
        revertEntity();
        closeEditor(e);
        break;
      default:
        break;
    }
  };

  // handleUpdateMathContent
  const handleUpdateMathContent = (e) => {
    setMathContent(e.target.value);
    setFocusEditor(true);
    updateInlineMathData(dispatch, pageUuid, mathEntityKey, e.target.value);

    // Used for triggerring draftjs re-render
    if (focusEditor) handleFocusEditor();
  };

  return (
    <>
      <div className="geeke-inlineStyleMathEditor-Anchor" id={anchorId} style={anchorPosition}></div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorPosition.left)}
        onClose={(e) => {
          revertEntity();
          setFocusEditor(false);
          closeEditor(e);
        }}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onKeyDown={onKeyDown}
      >
        <div>
          <label style={{ fontSize: '0px' }}>å</label>
          <TextField
            label="Edit Math Equation"
            placeholder={'1+e^{i\\pi}=0'}
            size="small"
            variant="outlined"
            style={{ margin: '0rem 1rem' }}
            value={mathContent}
            onChange={handleUpdateMathContent}
            inputRef={(input) => input && focusEditor && input.focus()}
            autoFocus
          />
        </div>
      </Menu>

      {/* Cross Line Warning */}
      <Snackbar
        open={showCorssLineWarning}
        autoHideDuration={5000}
        onClose={(e) => setShowCrossLineWarning(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={(e) => setShowCrossLineWarning(false)} severity="warning">
          Unable to create inline math when selection across multiple lines!
        </Alert>
      </Snackbar>
    </>
  );
};

export default InlineStyleMathEditor;
