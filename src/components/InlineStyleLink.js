/*************************************************
 * @file InlineStyleLink.js
 * @description Basic block.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Tooltip } from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';
import { withStyles } from '@material-ui/styles';

/*************************************************
 * Utils & States
 *************************************************/

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
import { pmsc } from '../states/editorMisc';
const CustomTooltip = withStyles({
  tooltip: {
    maxWidth: 'none',
  },
})(Tooltip);

/*************************************************
 * Main components
 *************************************************/
const InlineStyleLink = (props) => {
  // Props
  const { url } = props.contentState.getEntity(props.entityKey).getData();

  // States
  const pageUuid = useSelector((state) => state.editorMisc.focusEditor);
  const triggerEsc = useSelector((state) => state.editorMisc.pages?.get(pageUuid)?.get(pmsc.triggerEsc));
  const [open, setOpen] = useState(false);

  // Hide tooltip when esc is pressed
  useEffect(() => {
    setOpen(false);
  }, [triggerEsc]);

  // Parse url
  const purl = new URL(url);

  // Title
  // Reference: https://www.freecodecamp.org/news/how-to-use-html-to-open-link-in-new-tab/
  // Use noopener & noreferrer to enhance security
  const title = (
    <a className="geeke-outlink-nostyle" target="_blank" rel="noopener noreferrer" href={purl.href}>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <LinkIcon fontSize="small" />
        <span className="geeke-outlink-text">{purl.href}</span>
      </Grid>
    </a>
  );

  return (
    <CustomTooltip
      interactive
      arrow
      title={title}
      open={open || true}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      <a className="geeke-outlink" href={purl.href}>
        {props.children}
      </a>
    </CustomTooltip>
  );
};

export default InlineStyleLink;
