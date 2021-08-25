/*************************************************
 * @file InlineStyleMath.js
 * @description Inline style for Math.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';
import debounce from 'lodash/debounce';
import { useSelector } from 'react-redux';
import { constBlockType, remToPx } from '../constant';

/*************************************************
 * Utils & States
 *************************************************/

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/
// NOTE: adjust **topOffset** when the top padding is adjusted...
const topOffset = 2 * remToPx(2);

const PageOutlineBox = withStyles({
  root: {
    marginLeft: '0px',
    paddingLeft: '0px',
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
  // Props
  const pageUuid = props.pageUuid;

  // Constants
  const editorId = `geeke-editor-${pageUuid}`;

  // States & Reducers
  const editorState = useSelector((state) => state.editor.cachedPages.get(pageUuid)?.get('content'));
  const [focusHeading, setFocusHeading] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [showToc, setShowToc] = useState(false);

  // Register function to onscroll
  const handleScrollEnd = debounce(() => {
    // const curY = window.scrollY + topOffset;
    const curY = topOffset;

    const closestBsearchIdx = (blocks) => {
      // Find the element that is less then target but closest to the target
      let start = 0;
      let end = blocks.length;
      let middle = -1;
      let lastStart = start;
      let lastEnd = end;

      while (start < end) {
        middle = Math.floor((start + end) / 2);
        let offsetTop = blocks[middle].getBoundingClientRect().top;

        if (offsetTop === curY) {
          lastStart = -1;
          return middle;
        } else if (offsetTop < curY) {
          start = middle;
        } else {
          end = middle;
        }

        if (lastStart === start && lastEnd === end) break;

        lastStart = start;
        lastEnd = end;
      }

      if (lastStart >= 0) {
        if (blocks[lastEnd].getBoundingClientRect().top < curY) return lastEnd;
        else return lastStart;
      } else {
        return middle;
      }
    };

    const editorDom = document.getElementById(editorId);
    const blocks = editorDom.children[0].children[0].children[0].children[0].children;
    if (!blocks || blocks.length === 0) {
      console.error('Known issue! Unable to find block!');
      return;
    }

    // Find blocks that at top
    const targetBlockIdx = closestBsearchIdx(blocks);

    // Iterate back to find the heading block and its blockId
    if (!editorState) {
      console.error('EditorState is undefined!!!!!');
      return;
    }
    const contentState = editorState.getCurrentContent();
    let curIdx = targetBlockIdx;

    while (curIdx >= 0) {
      const curBlockKey = blocks[curIdx].getAttribute('data-offset-key').split('-')[0];
      if (!curBlockKey) {
        console.error('Unable to find block key from DOM');
        return;
      }
      const curBlock = contentState.getBlockForKey(curBlockKey);
      if (curBlock.getType() === constBlockType.heading) break;
      curIdx--;
    }

    // If curIdx >= 0, it means that this block is a heading block
    if (curIdx < 0) return;
    const blockId = blocks[curIdx]?.children[0]?.children[1]?.id;
    if (!blockId) console.error('Unable to find ID of the heading block!');
    setFocusHeading(blockId);
  }, 200);

  useEffect(() => {
    // For hot reloading
    // But if function handleScrollEnd is changed, this method does not work...
    window.removeEventListener('scroll', handleScrollEnd);

    window.addEventListener('scroll', handleScrollEnd);
  }, []); // eslint-disable-line

  // Handle cursor movement
  const handleMouseEnter = () => {
    setHovering(true);
    setShowToc(true);
  };
  const handleMouseLeave = () => {
    setHovering(false);
    setTimeout(() => {
      setShowToc(false);
    }, 100);
  };

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
    let focus = headingId === focusHeading || (!focusHeading && i === 0);

    previousHeadingLevel = headingLevel;
    toc.push(
      <PageOutlineList
        key={i}
        content={headingContent}
        level={headingLevel}
        headingId={headingId}
        focus={focus}
        hovering={hovering}
        showToc={showToc}
      />,
    );
  }

  // Render the result
  return (
    <div className="geeke-pageOutline-wrapper" style={{ left: 0 }}>
      <PageOutlineBox display="flex" alignItems="center" p={1} m={1} sx={{ height: '100%' }}>
        <Box>
          <div style={{ maxWidth: 150, position: 'relative' }} onMouseLeave={handleMouseLeave}>
            <div className="geeke-pageOutline-inbox" onMouseEnter={handleMouseEnter}></div>
            {toc}
          </div>
        </Box>
      </PageOutlineBox>
    </div>
  );
};

const PageOutlineList = (props) => {
  const tocItem = (
    <PageOutlineTooltip title={props.content} enterDelay={500} placement="top-start">
      <a href={`#${props.headingId}`}>{props.content}</a>
    </PageOutlineTooltip>
  );

  return (
    <>
      <div
        className={'geeke-pageOutline-item' + (props.hovering ? '' : ' geeke-pageOutline-itemHidden')}
        style={{ marginLeft: `${(props.level - 1) * 0.8}rem`, color: props.focus ? 'blue' : 'unset' }}
      >
        {props.showToc ? tocItem : 'i'}
      </div>
      <div
        className={'geeke-pageOutline-line' + (props.hovering ? ' geeke-pageOutline-lineHidden' : '')}
        style={{
          width: remToPx(0.5) + remToPx(2) * Math.pow(0.6, props.level - 1),
          background: props.focus ? 'rgb(0, 110, 255)' : 'rgba(65, 65, 65, 0.5)',
        }}
      ></div>
    </>
  );
};

export default PageOutline;
