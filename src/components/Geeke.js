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
import { addPage, fetchRootPages } from '../states/editor';

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
    
    // For debug convenience
    else {
      addPage(dispatch, null);
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
