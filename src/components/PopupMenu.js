/*************************************************
 * @file PopupMenu.js
 * @description Popup menu for Geeke.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Fade, MenuItem, MenuList, Paper, Popper } from '@material-ui/core';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import StrikethroughSIcon from '@material-ui/icons/StrikethroughS';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import FormatColorTextIcon from '@material-ui/icons/FormatColorText';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import FontDownloadOutlinedIcon from '@material-ui/icons/FontDownloadOutlined';
import FontDownloadIcon from '@material-ui/icons/FontDownload';
import CodeIcon from '@material-ui/icons/Code';
import throttle from 'lodash/throttle';

/*************************************************
 * Utils & States
 *************************************************/
import {
  showEditorSelection,
  toggleBold as _toggleBold,
  toggleItalic as _toggleItalic,
  toggleStrikethrough as _toggleStrikethrough,
  toggleUnderline as _toggleUnderline,
  toggleCode as _toggleCode,
  setTextColor as _setTextColor,
  setBackgroundColor as _setBackgroundColor,
} from '../states/editor';
import { pmsc } from '../states/editorMisc';
import { remToPx } from '../constant';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
import { styleMap } from '../constant';
const textColorList = [
  {text: 'Default', color: 'inherit'},
  {text: 'Red',     color: styleMap.TEXTRED.color},
  {text: 'Orange',  color: styleMap.TEXTORANGE.color},
  {text: 'Yellow',  color: styleMap.TEXTYELLOW.color},
  {text: 'Green',   color: styleMap.TEXTGREEN.color},
  {text: 'Blue',    color: styleMap.TEXTBLUE.color},
  {text: 'Purple',  color: styleMap.TEXTPURPLE.color},
  {text: 'Pink',    color: styleMap.TEXTPINK.color},
  {text: 'Brown',   color: styleMap.TEXTBROWN.color},
  {text: 'Gray',    color: styleMap.TEXTGRAY.color},
];

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [textColorEl, setTextColorEl] = useState(null);
  const [backgroundColorEl, setBackgroundColorEl] = useState(null);

  // Constants
  const anchorId = `geeke-popupMenuAnchor-${pageUuid}`;

  // Set anchor
  useEffect(() => {
    setAnchorEl(document.getElementById(anchorId));
  }, []); // eslint-disable-line

  // Update position info
  const throttle_updateMenuPosition = throttle((menuRange) => {
    if (!menuRange) {
      setShowMenu(false);
      setTextColorEl(null);
      setBackgroundColorEl(null);
      setTimeout(() => {
        setMenuPosition({top: -1000, left: 0});
      }, 200);
    } else {
      const editorDom = document.getElementById(`geeke-editor-${pageUuid}`);
      const editorRect = editorDom.getBoundingClientRect();
      const selectionRect = menuRange.getBoundingClientRect();
      const menuHeight = remToPx(0.5);
      const newPosition = {
        top:  editorDom.offsetTop +  (selectionRect.top - editorRect.top)   - menuHeight,
        left: editorDom.offsetLeft + (selectionRect.left - editorRect.left) + selectionRect.width / 2,
      };
      setMenuPosition(newPosition);
      setShowMenu(true);
    }
  }, 100, {'trailing': true});
  useEffect(() => {
    throttle_updateMenuPosition(menuRange);
  }, [menuRange]); // eslint-disable-line

  // Functions
  const keepFocusOnEditor = (e) => {
    e.stopPropagation();
    handleFocusEditor();
    setTimeout(() => {
      showEditorSelection(dispatch, pageUuid);
    });
  };

  const toggleStyle = toggleFunc => {
    toggleFunc(dispatch, pageUuid);
    if (textColorEl) {
      setTextColorEl(null);
    }
    if (backgroundColorEl) {
      setBackgroundColorEl(null);
    }
  }
  const toggleBold = e => toggleStyle(_toggleBold);
  const toggleItalic = e => toggleStyle(_toggleItalic);
  const toggleUnderline = e => toggleStyle(_toggleUnderline);
  const toggleStrikethrough = e => toggleStyle(_toggleStrikethrough);
  const toggleCode = e => toggleStyle(_toggleCode);

  const toggleFontColorMenu = e => {
    // Hide other menus
    setBackgroundColorEl(null);

    // Toggle fontColorMenu
    if (!textColorEl) {
      setTextColorEl(e.currentTarget);
    } else {
      setTextColorEl(null);
    }
  };

  const toggleBackgroundColorMenu = e => {
    // Hide other menus
    setTextColorEl(null);

    // Toggle backgroundColorMenu
    if (!backgroundColorEl) {
      setBackgroundColorEl(e.currentTarget);
    } else {
      setBackgroundColorEl(null);
    }
  };

  const setTextColor = color => _setTextColor(dispatch, pageUuid, color);
  const setBackgroundColor = color => _setBackgroundColor(dispatch, pageUuid, color);

  // Component
  const seperator = <div className='geeke-popupMenuSeperator'></div>
  const dropdownIcon = <span className='geeke-popupMenu-dropdownIcon'>▾</span>

  const fontColorButtons = (
    <Popper open={Boolean(textColorEl)} transition anchorEl={textColorEl} placement='bottom-start' onClose={() => setTextColorEl(null)}>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper elevation={3}>
            <MenuList>
              {textColorList.map((context, i) => {
                return  <MenuItem key={i} dense onMouseDown={keepFocusOnEditor} onClick={() => setTextColor(context.text)}>
                          <FontDownloadOutlinedIcon fontSize='small' style={{color: context.color, paddingRight: '0.5rem'}} />
                          {context.text}
                        </MenuItem>
              })}
            </MenuList>
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  const backgroundColorButtons = (
    <Popper open={Boolean(backgroundColorEl)} transition anchorEl={backgroundColorEl} placement='bottom-start' onClose={() => setBackgroundColorEl(null)}>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper elevation={3}>
            <MenuList>
              {textColorList.map((context, i) => {
                return  <MenuItem key={i} dense onMouseDown={keepFocusOnEditor} onClick={() => setBackgroundColor(context.text)}>
                          <FontDownloadIcon fontSize='small' style={{color: context.color, paddingRight: '0.5rem'}} />
                          {context.text}
                        </MenuItem>
              })}
            </MenuList>
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  return (
    <>
      <div id={anchorId} className={'geeke-popupMenu-Anchor'} style={menuPosition}></div>
      <Popper open={showMenu} transition anchorEl={anchorEl} placement='top-start'>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper elevation={3}>
              <Button className='geeke-popupMenuButton' onMouseDown={keepFocusOnEditor} onClick={toggleBold}><FormatBoldIcon fontSize='small' /></Button>
              <Button className='geeke-popupMenuButton' onMouseDown={keepFocusOnEditor} onClick={toggleItalic}><FormatItalicIcon fontSize='small' /></Button>
              <Button className='geeke-popupMenuButton' onMouseDown={keepFocusOnEditor} onClick={toggleUnderline}><FormatUnderlinedIcon fontSize='small' /></Button>
              <Button className='geeke-popupMenuButton' onMouseDown={keepFocusOnEditor} onClick={toggleStrikethrough}><StrikethroughSIcon fontSize='small' /></Button>
              <Button className='geeke-popupMenuButton' onMouseDown={keepFocusOnEditor} onClick={toggleCode}><CodeIcon fontSize='small' /></Button>
              {seperator}
              <Button className='geeke-popupMenuButton' onMouseDown={keepFocusOnEditor} onClick={toggleFontColorMenu}><FormatColorTextIcon fontSize='small' /> {dropdownIcon}</Button>
              {seperator}
              <Button className='geeke-popupMenuButton' onMouseDown={keepFocusOnEditor} onClick={toggleBackgroundColorMenu}><BorderColorIcon fontSize='small' /> {dropdownIcon}</Button>
            </Paper>
          </Fade>
        )}
      </Popper>
      {fontColorButtons}
      {backgroundColorButtons}
    </>
  );
}

export default PopupMenu;
