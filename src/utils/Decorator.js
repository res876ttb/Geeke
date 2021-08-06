/*************************************************
 * @file Decorator.js
 * @description Decorator for Geeke.
 *************************************************/

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/
import { CompositeDecorator } from 'draft-js';
import InlineStyleLink from '../components/InlineStyleLink';
import InlineStyleMath from '../components/InlineStyleMath';

/*************************************************
 * CONSTANTS
 *************************************************/

/*************************************************
 * STRATEGIES
 *************************************************/
const inlineLinkStretagy = (contentBlock, callback, contentState) =>
  inlineEntityStretagy(contentBlock, callback, contentState, 'LINK');

const inlineMathStretagy = (contentBlock, callback, contentState) =>
  inlineEntityStretagy(contentBlock, callback, contentState, 'MATH');

const inlineEntityStretagy = (contentBlock, callback, contentState, inlineStyle) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === inlineStyle;
  }, callback);
};

/*************************************************
 * DECORATOR
 *************************************************/
export const decorator = new CompositeDecorator([
  {
    strategy: inlineLinkStretagy,
    component: InlineStyleLink,
  },
  {
    strategy: inlineMathStretagy,
    component: InlineStyleMath,
  },
]);
