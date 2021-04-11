/*************************************************
 * @file Page.js
 * @description Page component.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import {
  blockType,
  loadAllBlocks,
  parseBlockParents
} from '../states/editor';

/*************************************************
 * Import Components
 *************************************************/
import BasicBlock from './BasicBlock';
import PageTitle from './PageTitle';
import BlockSelector from './BlockSelector';
import BlockDragMask from './BlockDragMask';

/*************************************************
 * Styles
 *************************************************/
import '../styles/Page.css';

/*************************************************
 * Main components
 *************************************************/
const Page = props => {
  // Props
  const uuid = props.dataId;

  // States and Reducers
  const dispatch = useDispatch();
  const page = useSelector(state => state.editor.cachedPages[uuid]);
  const cachedBlocks = useSelector(state => state.editor.cachedBlocks);

  // Synchornize current page with server every 3 seconds.

  // Handle load all blocks
  useEffect(() => {
    loadAllBlocks(dispatch, uuid);
    parseBlockParents(dispatch, uuid);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get child blocks
  const blocks = 
  <div>
    {page.blocks.map((blockUuid, idx) => {
      switch(cachedBlocks[blockUuid].type) {
        case blockType.basic:
          return (
            <BasicBlock key={blockUuid}
              dataId={blockUuid}
              pageId={uuid}
              parentId={uuid}
              isFirstBlock={idx === 0}
              depth={0}
              lockDrop={false}
            />
          );
        
        default:
          console.error(`Unknown block type: ${cachedBlocks[blockUuid].type}`);
          return null;
      }
    })}
  </div>;

  return (
    <div>
      <PageTitle uuid={uuid} />
      <BlockSelector pageId={uuid} />
      {blocks}
      <BlockDragMask pageId={uuid} />
      <div className='geeke-pageBottom'></div>
      {/* TODO: make it work: drop on bottom of a page */}
    </div>
  )
}

export default Page;
