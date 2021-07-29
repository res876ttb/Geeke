/*************************************************
 * @file InlineStyleLink.js
 * @description Basic block.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Snackbar, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

/*************************************************
 * Utils & States
 *************************************************/
import { checkOverlap, getCaretRange } from '../utils/Misc';
import { pmsc, setLinkRange, setPreLinkRange } from '../states/editorMisc';
import { showEditorSelection, toggleLink } from '../states/editor';

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
const InlineStyleLinkEditor = (props) => {
  // Props
  const handleFocusEditor = props.handleFocusEditor;

  // State & Reducer
  const dispatch = useDispatch();
  const [anchorPosition, setAnchorPosition] = useState({ top: -1000, left: 0 });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectionState, setSelectionState] = useState(null);
  const [linkContent, setLinkContent] = useState('');
  const [showCorssLineWarning, setShowCrossLineWarning] = useState(false);
  const [showEmptySelectionWarning, setShowEmptySelectionWarning] = useState(false);
  const pageUuid = useSelector((state) => state.editorMisc.focusEditor);
  const linkRange = useSelector((state) => state.editorMisc.pages?.get(pageUuid)?.get(pmsc.linkRange));
  const preLinkRange = useSelector((state) => state.editorMisc.pages?.get(pageUuid)?.get(pmsc.preLinkRange));
  const editorState = useSelector((state) => state.editor.cachedPages.get(pageUuid)?.get('content'));

  // Constants
  const anchorId = `geeke-inlineStyleLinkEditor-${pageUuid}`;
  const initAnchorPosition = { top: -1000, left: 0 };

  const clearState = () => {
    setAnchorPosition(initAnchorPosition);
    setLinkRange(dispatch, pageUuid, null);
    setLinkContent('');
  };

  const closeEditor = (e, curSelectionState = null) => {
    e?.stopPropagation();
    handleFocusEditor();
    clearState();
    setTimeout(
      () => showEditorSelection(dispatch, pageUuid, curSelectionState ? curSelectionState : selectionState),
      0,
    );
  };

  // Open link editor when linkRange is updated
  useEffect(() => {
    if (linkRange) {
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
      // Rule: if there are any link entity in the selection range,
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();

      // Check whether the selected text are all in the same block
      if (selectionState.getAnchorKey() !== selectionState.getFocusKey()) {
        closeEditor(null, selectionState);
        setShowCrossLineWarning(true);
        return;
      }

      const anchorBlock = contentState.getBlockForKey(selectionState.getAnchorKey());
      let firstLinkEntityKey = null;
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
            if (curEntity.type === 'LINK' && !firstLinkEntityKey) {
              firstLinkEntityKey = curEntityKey;
            }
          }
        },
      );

      let url = '';
      if (firstLinkEntityKey) {
        const entity = contentState.getEntity(firstLinkEntityKey);
        url = entity.data.url;
      }

      // If url is empty and the selection is collapsed, it is not possible to create link
      if (url.length === 0 && selectionState.isCollapsed()) {
        closeEditor(null, selectionState);
        setShowEmptySelectionWarning(true);
        return;
      }

      setLinkContent(url);
      setAnchorPosition(newPosition);
      setSelectionState(linkRange);
    } else if (anchorPosition.left !== 0) {
      clearState();
    }
  }, [linkRange]); // eslint-disable-line

  // When preLinkRange is set, focus editor, force selection, then trigger linkRange
  useEffect(() => {
    if (!preLinkRange) return;

    const selectionState = preLinkRange;
    setPreLinkRange(dispatch, pageUuid, null);
    handleFocusEditor();
    setTimeout(() => {
      showEditorSelection(dispatch, pageUuid, selectionState);
      setLinkRange(dispatch, pageUuid, selectionState);
    }, 0);
  }, [preLinkRange]); // eslint-disable-line

  // Set anchor position
  useEffect(() => {
    setAnchorEl(document.getElementById(anchorId));
  }, []); // eslint-disable-line

  // Handle keypress
  const onKeyDown = (e) => {
    const key = e.nativeEvent.keyCode;
    switch (key) {
      case 13: // Enter
        toggleLink(dispatch, pageUuid, linkContent);
        closeEditor(e);
        break;
      case 27: // Esc
        closeEditor(e);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="geeke-inlineStyleLinkEditor-Anchor" id={anchorId} style={anchorPosition}></div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorPosition.left)}
        onClose={(e) => closeEditor(e)}
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
        <TextField
          label="Edit Link"
          placeholder="Paste link here"
          size="small"
          variant="outlined"
          style={{ margin: '0rem 1rem' }}
          value={linkContent}
          onChange={(e) => setLinkContent(e.target.value)}
        />
      </Menu>

      {/* Collapsed Message */}
      <Snackbar
        open={showEmptySelectionWarning}
        autoHideDuration={5000}
        onClose={(e) => setShowEmptySelectionWarning(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={(e) => setShowEmptySelectionWarning(false)} severity="warning">
          Unable to create link without selecting any text!
        </Alert>
      </Snackbar>

      {/* Cross Line Warning */}
      <Snackbar
        open={showCorssLineWarning}
        autoHideDuration={5000}
        onClose={(e) => setShowCrossLineWarning(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={(e) => setShowCrossLineWarning(false)} severity="warning">
          Unable to create link when selection across multiple lines!
        </Alert>
      </Snackbar>
    </>
  );
};

export default InlineStyleLinkEditor;
