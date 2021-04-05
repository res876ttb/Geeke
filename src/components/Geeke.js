/*************************************************
 * @file Geeke.js
 * @description Framework component of Geeke.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import { getRootPages } from '../utils/Sync';
import { fetchRootPages } from '../states/editor';
import { createFakePage } from '../utils/Mockup';

/*************************************************
 * Import Components
 *************************************************/
import Page from './Page';

/*************************************************
 * Styles
 *************************************************/
import '../styles/Geeke.css';

/*************************************************
 * Main components
 *************************************************/
const Geeke = () => {
  const pageTree = useSelector(state => state.editor.pageTree);
  const dispatch = useDispatch();

  useEffect(() => {
    let rootPages = getRootPages();
    if (rootPages.length > 0) {
      console.log(rootPages);
      fetchRootPages(dispatch, rootPages);
    }
    
    // Mock page (for debug convenience only)
    else {
      createFakePage(dispatch);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // For debug convenience
  let page = null;
  if (Object.keys(pageTree.root).length > 0) {
    page = <Page dataId={Object.keys(pageTree.root)[0]} />;
  }

  return (
    <div>
      {/* For debug convenience */}
      {page}
    </div>
  )
}

export default Geeke;
