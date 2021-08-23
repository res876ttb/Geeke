/*************************************************
 * @file InlineStyleMath.js
 * @description Inline style for Math.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
import { Box } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';

/*************************************************
 * Utils & States
 *************************************************/

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
const PageOutlineBox = withStyles({
  root: {
    marginLeft: '0px',
  },
})(Box);
const PageOutlineTooltip = withStyles({
  tooltipPlacementTop: {
    margin: '6px 0px',
  },
})(Tooltip);

/*************************************************
 * Main components
 *************************************************/
const PageOutline = (props) => {
  const pageUuid = props.pageUuid;

  // Constants
  const editorId = `geeke-editor-${pageUuid}`;

  // Find all heading block
  const editorDom = document.getElementById(editorId);
  const headings = editorDom?.querySelectorAll('.geeke-headingEditor');
  if (!headings) return null;

  // Compose TOC
  let toc = [];
  let previousHeadingLevel = 0;
  for (let i = 0; i < headings.length; i++) {
    let heading = headings[i];
    let headingType = heading.getAttribute('headingtype');
    let headingId = heading.id;
    if (!headingType) continue;
    if (!headingId) continue;

    let headingLevel = Math.min(previousHeadingLevel + 1, parseInt(headingType.slice(1)));
    let headingContent = heading.textContent;

    previousHeadingLevel = headingLevel;
    toc.push(<PageOutlineList key={i} content={headingContent} level={headingLevel} headingId={headingId} />);
  }

  // Render the result
  return (
    <div className="geeke-pageOutline-wrapper" style={{ left: 0 }}>
      <PageOutlineBox display="flex" alignItems="center" p={1} m={1} sx={{ height: '100%' }}>
        <Box>
          <div style={{ position: 'relative', width: 150 }}>{toc}</div>
        </Box>
      </PageOutlineBox>
    </div>
  );
};

const PageOutlineList = (props) => {
  return (
    <div className="geeke-pageOutline-item" style={{ marginLeft: `${(props.level - 1) * 0.8}rem` }}>
      <PageOutlineTooltip title={props.content} enterDelay={500} placement="top-start">
        <a href={`#${props.headingId}`}>{props.content}</a>
      </PageOutlineTooltip>
    </div>
  );
};

export default PageOutline;
