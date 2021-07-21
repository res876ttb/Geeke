/*************************************************
 * @file PopupMenu.js
 * @description Popup menu for Geeke.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import StrikethroughSIcon from '@material-ui/icons/StrikethroughS';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import throttle from 'lodash/throttle';

/*************************************************
 * Utils & States
 *************************************************/
import {
  toggleBold as _toggleBold,
  toggleItalic as _toggleItalic,
  toggleStrikethrough as _toggleStrikethrough,
  toggleUnderline as _toggleUnderline,
} from '../states/editor';
import { pmsc } from '../states/editorMisc';
import { remToPx } from '../constant';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/

/*************************************************
 * Main components
 *************************************************/
const PopupMenu = props => {
  // Props
  const pageUuid = props.pageUuid;
  const handleFocusEditor = props.handleFocusEditor;

  // Reducers
  const dispatch = useDispatch();
  const menuRange = useSelector(state => state.editorMisc.pages.get(pageUuid).get(pmsc.popupMenuRange));
  const [menuPosition, setMenuPosition] = useState({top: -1000, left: 0});
  const [showMenu, setShowMenu] = useState(false);

  // Update position info
  const throttle_updateMenuPosition = throttle((menuRange) => {
    if (!menuRange) {
      setShowMenu(false);
      setTimeout(() => {
        setMenuPosition({top: -1000, left: 0});
      }, 200);
    } else {
      const editorDom = document.getElementById(`geeke-editor-${pageUuid}`);
      const editorRect = editorDom.getBoundingClientRect();
      const selectionRect = menuRange.getBoundingClientRect();
      const menuHeight = remToPx(2.5);
      const newPosition = {
        top:  editorDom.offsetTop +  (selectionRect.top - editorRect.top)   - menuHeight,
        left: editorDom.offsetLeft + (selectionRect.left - editorRect.left) + selectionRect.width / 2,
      };
      setMenuPosition(newPosition);
      setShowMenu(true);
    }
  }, 100, {'trailing': false});
  useEffect(() => {
    throttle_updateMenuPosition(menuRange);
  }, [menuRange]); // eslint-disable-line

  // Functions
  const toggleBold = e => {
    e.stopPropagation();
    handleFocusEditor();
    setTimeout(() => {
      _toggleBold(dispatch, pageUuid);
    });
  };
  const toggleItalic = e => {
    e.stopPropagation();
    handleFocusEditor();
    setTimeout(() => {
      _toggleItalic(dispatch, pageUuid);
    });
  };
  const toggleUnderline = e => {
    e.stopPropagation();
    handleFocusEditor();
    setTimeout(() => {
      _toggleUnderline(dispatch, pageUuid);
    });
  };
  const toggleStrikethrough = e => {
    e.stopPropagation();
    handleFocusEditor();
    setTimeout(() => {
      _toggleStrikethrough(dispatch, pageUuid);
    });
  };

  return (
    <div className={'geeke-popupMenuWrapper' + (showMenu ? '' : ' geeke-invisible')} style={menuPosition} onMouseDown={() => console.log('I am clicked!')}>
      <Button className='geeke-popupMenuButton' onMouseDown={toggleBold}><FormatBoldIcon fontSize='small' /></Button>
      <Button className='geeke-popupMenuButton' onMouseDown={toggleItalic}><FormatItalicIcon fontSize='small' /></Button>
      <Button className='geeke-popupMenuButton' onMouseDown={toggleUnderline}><FormatUnderlinedIcon fontSize='small' /></Button>
      <Button className='geeke-popupMenuButton' onMouseDown={toggleStrikethrough}><StrikethroughSIcon fontSize='small' /></Button>
    </div>
  );
}

export default PopupMenu;
