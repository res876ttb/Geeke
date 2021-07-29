/*************************************************
 * @file InlineStyleLink.js
 * @description Basic block.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, Snackbar, Tooltip } from '@material-ui/core';
import { SelectionState } from 'draft-js';
import { withStyles } from '@material-ui/styles';
import { Alert } from '@material-ui/lab';
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import EditIcon from '@material-ui/icons/Edit';
import CopyToClipboard from 'react-copy-to-clipboard';

/*************************************************
 * Utils & States
 *************************************************/
import { pmsc, setPreLinkRange } from '../states/editorMisc';
import { removeEntity } from '../states/editor';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
const CustomTooltip = withStyles({
  tooltip: {
    maxWidth: 'none',
  },
})(Tooltip);
const CustomButton = withStyles({
  root: {
    padding: '0rem 0.125rem',
    minWidth: '0rem',
    color: 'inherit',
  },
})(Button);
const CustomCopyIcon = withStyles({
  root: {
    fontSize: '1rem'
  }
})(FileCopyIcon);
const CustomEditIcon = withStyles({
  root: {
    fontSize: '1rem'
  }
})(EditIcon);

/*************************************************
 * Main components
 *************************************************/
const InlineStyleLink = (props) => {
  // Props
  const { url } = props.contentState.getEntity(props.entityKey).getData();

  // States
  const dispatch = useDispatch();
  const pageUuid = useSelector((state) => state.editorMisc.focusEditor);
  const triggerEsc = useSelector((state) => state.editorMisc.pages?.get(pageUuid)?.get(pmsc.triggerEsc));
  const [open, setOpen] = useState(false);
  const [keepClose, setKeepClose] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  // Hide tooltip when esc is pressed
  useEffect(() => {
    setOpen(false);
  }, [triggerEsc]);

  // Handle copy link
  const handleCopyLink = e => {
    setShowCopyMessage(true);
  };
  const handleCloseCopyMessage = e => setShowCopyMessage(false);

  // Handle remove link
  const handleRemoveLink = e => {
    removeEntity(dispatch, pageUuid, new SelectionState({
      focusKey: props.blockKey,
      focusOffset: props.end,
      anchorKey: props.blockKey,
      anchorOffset: props.start
    }), true);
  };

  // Handle edit link
  const handleEditLink = e => {
    console.log(props);
    setOpen(false);
    setKeepClose(true);
    setPreLinkRange(dispatch, pageUuid, new SelectionState({
      focusKey: props.blockKey,
      focusOffset: props.end,
      anchorKey: props.blockKey,
      anchorOffset: props.start
    }));
    setTimeout(() => setKeepClose(false), 300);
  };

  // Parse url
  const purl = new URL(url);

  // Title
  // Reference: https://www.freecodecamp.org/news/how-to-use-html-to-open-link-in-new-tab/
  // Use noopener & noreferrer to enhance security
  const title = (
    <Grid container direction="row" justifyContent="center" alignItems="center">
      <CopyToClipboard text={purl.href}>
        <CustomButton onClick={handleCopyLink}>
          <CustomCopyIcon />
        </CustomButton>
      </CopyToClipboard>
      <CustomButton onClick={handleEditLink}>
        <CustomEditIcon />
      </CustomButton>
      <CustomButton onClick={handleRemoveLink}>
        <LinkOffIcon fontSize='small' />
      </CustomButton>
      <div className="geeke-outlink-seperator"></div>
      <a className="geeke-outlink-nostyle" target="_blank" rel="noopener noreferrer" href={purl.href}>
        <Grid container direction="row" justifyContent="center" alignItems="center">
          <LinkIcon fontSize="small" />
          <span className="geeke-outlink-text">{purl.href}</span>
        </Grid>
      </a>
    </Grid>
  );

  return (
    <>
      <CustomTooltip
        interactive
        arrow
        title={title}
        open={open && !keepClose}
        onOpen={() => keepClose ? null : setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <a className="geeke-outlink" href={purl.href}>
          {props.children}
        </a>
      </CustomTooltip>

      {/* Copy Message */}
      <Snackbar
        open={showCopyMessage}
        autoHideDuration={5000}
        onClose={handleCloseCopyMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseCopyMessage} severity="success">
          Copied!
        </Alert>
      </Snackbar>
    </>
  );
};

export default InlineStyleLink;
