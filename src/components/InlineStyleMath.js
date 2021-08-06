/*************************************************
 * @file InlineStyleMath.js
 * @description Inline style for Math.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
import katex from 'katex';

/*************************************************
 * Utils & States
 *************************************************/

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/

/*************************************************
 * Main components
 *************************************************/
const InlineStyleMath = (props) => {
  // Props
  const { math } = props.contentState.getEntity(props.entityKey).getData();

  // Render math to Tex
  var html = katex.renderToString(math, {
    throwOnError: false,
  });

  return <span contentEditable={false} dangerouslySetInnerHTML={{ __html: html }}></span>;
};

export default InlineStyleMath;
