/**
 * @file BlcokTreeUtils.test.js
 * @description Test BlcokTree
 */

/*************************************************
 * IMPORT LIBRARIES
 *************************************************/
import {
  convertFromRaw
} from "draft-js";
import {
  BlockList,
  BlockTree,
} from "../utils/BlockTreeUtils";

/*************************************************
 * COMPONENTS TO TEST
 *************************************************/

/*************************************************
 * REDUX REDUCER
 *************************************************/

/*************************************************
 * TEST CODE
 *************************************************/

describe('Test BlockList', () => {
  test('append', () => {
    let blockList = new BlockList();

    expect(blockList.isEmpty()).toBeTruthy();
    blockList.append(null, [1], ['a']);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(1)).toBe(0);
    expect(blockList.getValue(1)).toBe('a');

    blockList.append(1, [2], ['b']);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(1)).toBe(0);
    expect(blockList.getIndex(2)).toBe(1);
    expect(blockList.getValue(1)).toBe('a');
    expect(blockList.getValue(2)).toBe('b');

    blockList.append(1, [3, 4], ['c', 'd']);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(1)).toBe(0);
    expect(blockList.getIndex(2)).toBe(3);
    expect(blockList.getIndex(3)).toBe(1);
    expect(blockList.getIndex(4)).toBe(2);
    expect(blockList.getValue(1)).toBe('a');
    expect(blockList.getValue(2)).toBe('b');
    expect(blockList.getValue(3)).toBe('c');
    expect(blockList.getValue(4)).toBe('d');

    blockList.append(null, [5], ['e']);
    expect(blockList.getIndex(5)).toBe(0);
    expect(blockList.getIndex(1)).toBe(1);
    expect(blockList.getIndex(2)).toBe(4);
    expect(blockList.getIndex(3)).toBe(2);
    expect(blockList.getIndex(4)).toBe(3);
    expect(blockList.getValue(5)).toBe('e');

    blockList.clear();
    blockList.append(1, [3, 4], ['c', 'd']);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(3)).toBe(0);
    expect(blockList.getIndex(4)).toBe(1);
    expect(blockList.getValue(3)).toBe('c');
    expect(blockList.getValue(4)).toBe('d');
  });

  test('delete', () => {
    let blockList = new BlockList();

    blockList.append(0, [1, 2, 3, 4, 5, 6], ['a', 'b', 'c', 'd', 'e', 'f']);

    blockList.delete(1);
    expect(blockList.getSize()).toBe(5);
    expect(blockList.isEmpty()).not.toBeTruthy();
    expect(blockList.getIndex(1)).toBeNull();
    expect(blockList.getIndex(2)).toBe(0);
    expect(blockList.getIndex(3)).toBe(1);
    expect(blockList.getIndex(4)).toBe(2);
    expect(blockList.getIndex(5)).toBe(3);
    expect(blockList.getIndex(6)).toBe(4);
    expect(blockList.getValue(1)).toBeNull();
    expect(blockList.getValue(2)).toBe('b');
    expect(blockList.getValue(3)).toBe('c');
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(5)).toBe('e');
    expect(blockList.getValue(6)).toBe('f');

    blockList.delete(3);
    expect(blockList.getSize()).toBe(4);
    expect(blockList.getIndex(2)).toBe(0);
    expect(blockList.getIndex(3)).toBeNull();
    expect(blockList.getIndex(4)).toBe(1);
    expect(blockList.getIndex(5)).toBe(2);
    expect(blockList.getIndex(6)).toBe(3);
    expect(blockList.getValue(2)).toBe('b');
    expect(blockList.getValue(3)).toBeNull();
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(5)).toBe('e');
    expect(blockList.getValue(6)).toBe('f');

    blockList.delete(100);
    expect(blockList.getSize()).toBe(4);

    blockList.delete([100, 101]);
    expect(blockList.getSize()).toBe(4);

    blockList.delete([2]);
    expect(blockList.getSize()).toBe(3);
    expect(blockList.getIndex(2)).toBeNull();
    expect(blockList.getIndex(4)).toBe(0);
    expect(blockList.getIndex(5)).toBe(1);
    expect(blockList.getIndex(6)).toBe(2);
    expect(blockList.getValue(2)).toBeNull();
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(5)).toBe('e');
    expect(blockList.getValue(6)).toBe('f');

    blockList.delete([5]);
    expect(blockList.getSize()).toBe(2);
    expect(blockList.getIndex(4)).toBe(0);
    expect(blockList.getIndex(5)).toBeNull();
    expect(blockList.getIndex(6)).toBe(1);
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(5)).toBeNull();
    expect(blockList.getValue(6)).toBe('f');

    blockList.delete([6]);
    expect(blockList.getSize()).toBe(1);
    expect(blockList.getIndex(4)).toBe(0);
    expect(blockList.getIndex(6)).toBeNull();
    expect(blockList.getValue(4)).toBe('d');
    expect(blockList.getValue(6)).toBeNull();

    blockList.clear()
    blockList.append(0, [1, 2, 3, 4, 5, 6, 7, 8], ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);

    blockList.delete([1, 2]);
    expect(blockList.getSize()).toBe(6);
    expect(blockList.getIndex(3)).toBe(0);

    blockList.delete([7, 8]);
    expect(blockList.getSize()).toBe(4);
    expect(blockList.getIndex(3)).toBe(0);
    expect(blockList.getIndex(7)).toBeNull();
  });
});

describe('Test BlockTree', () => {
  let testString = `{"blocks":[{"key":"feut4","text":"This numbered list 1","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"numberListOrder":1}},{"key":"3i7b3","text":"This numbered list 2","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"numberListOrder":2}},{"key":"9bbfj","text":"This is numbered list 3","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":1}},{"key":"1ljkf","text":"This is numbered list 4","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":2}},{"key":"d54n0","text":"This is a normal list","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"cqoo","text":"This is the second section of numbered list","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":1}},{"key":"be498","text":"This is the second section of numbered list 2","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":2}},{"key":"6puud","text":"This is block 1","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"4uump","text":"This is block 2","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"7tegj","text":"This is block 3","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"7cl1n","text":"This is block 4","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":2}},{"key":"dn4hc","text":"This is block 5","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2cf43","text":"This is toggle list","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"toggleListToggle":true}},{"key":"8idd4","text":"This is bullet list 1","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"9btli","text":"This is bullet list 2","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"45f6v","text":"This is bullet list 3","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":2}},{"key":"2c9i4","text":"This is toggle list inside toggle list","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"toggleListToggle":false}},{"key":"3vfhs","text":"This is check list 1","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"checkListCheck":true}},{"key":"5ur9n","text":"This is check list 2","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0}},{"key":"1960r","text":"This is check list 3","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"checkListCheck":true}},{"key":"368b5","text":"This is check list 4","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}}],"entityMap":{}}`;
  let contentState = convertFromRaw(JSON.parse(testString));

  test('contentStateToTree', () => {
    let blockTree = new BlockTree(contentState);
    expect(blockTree).not.toBeUndefined();
    expect(blockTree.tree).not.toBeUndefined();
    expect(JSON.parse(JSON.stringify(blockTree.tree))).toStrictEqual([
      {
        "indexHash": {
          "map": {}
        },
        "valueArray": [
          [],
          [
            {
              "indexHash": {
                "map": {}
              },
              "valueArray": [
                [],
                []
              ],
              "keyArray": [
                "9bbfj",
                "1ljkf"
              ],
              "type": "number-list"
            },
            {
              "indexHash": {
                "map": {}
              },
              "valueArray": [
                []
              ],
              "keyArray": [
                "d54n0"
              ],
              "type": "bullet-list"
            },
            {
              "indexHash": {
                "map": {}
              },
              "valueArray": [
                [],
                []
              ],
              "keyArray": [
                "cqoo",
                "be498"
              ],
              "type": "number-list"
            }
          ]
        ],
        "keyArray": [
          "feut4",
          "3i7b3"
        ],
        "type": "number-list"
      },
      {
        "indexHash": {
          "map": {}
        },
        "valueArray": [
          [
            {
              "indexHash": {
                "map": {}
              },
              "valueArray": [
                [],
                [
                  {
                    "indexHash": {
                      "map": {}
                    },
                    "valueArray": [
                      []
                    ],
                    "keyArray": [
                      "7cl1n"
                    ],
                    "type": "unstyled"
                  }
                ]
              ],
              "keyArray": [
                "4uump",
                "7tegj"
              ],
              "type": "unstyled"
            }
          ],
          []
        ],
        "keyArray": [
          "6puud",
          "dn4hc"
        ],
        "type": "unstyled"
      },
      {
        "indexHash": {
          "map": {}
        },
        "valueArray": [
          [
            {
              "indexHash": {
                "map": {}
              },
              "valueArray": [
                [],
                [
                  {
                    "indexHash": {
                      "map": {}
                    },
                    "valueArray": [
                      []
                    ],
                    "keyArray": [
                      "45f6v"
                    ],
                    "type": "bullet-list"
                  }
                ]
              ],
              "keyArray": [
                "8idd4",
                "9btli"
              ],
              "type": "bullet-list"
            },
            {
              "indexHash": {
                "map": {}
              },
              "valueArray": [
                []
              ],
              "keyArray": [
                "2c9i4"
              ],
              "type": "toggle-list"
            }
          ]
        ],
        "keyArray": [
          "2cf43"
        ],
        "type": "toggle-list"
      },
      {
        "indexHash": {
          "map": {}
        },
        "valueArray": [
          [],
          [
            {
              "indexHash": {
                "map": {}
              },
              "valueArray": [
                [],
                []
              ],
              "keyArray": [
                "1960r",
                "368b5"
              ],
              "type": "check-list"
            }
          ]
        ],
        "keyArray": [
          "3vfhs",
          "5ur9n"
        ],
        "type": "check-list"
      }
    ]);

    let expectedParentMap = {
      "feut4": {
        "key": null,
        "blockListIndex": 0,
        "inListOrder": 0
      },
      "3i7b3": {
        "key": null,
        "blockListIndex": 0,
        "inListOrder": 1
      },
      "9bbfj": {
        "key": "3i7b3",
        "blockListIndex": 0,
        "inListOrder": 0
      },
      "1ljkf": {
        "key": "3i7b3",
        "blockListIndex": 0,
        "inListOrder": 1
      },
      "d54n0": {
        "key": "3i7b3",
        "blockListIndex": 1,
        "inListOrder": 0
      },
      "cqoo": {
        "key": "3i7b3",
        "blockListIndex": 2,
        "inListOrder": 0
      },
      "be498": {
        "key": "3i7b3",
        "blockListIndex": 2,
        "inListOrder": 1
      },
      "6puud": {
        "key": null,
        "blockListIndex": 1,
        "inListOrder": 0
      },
      "4uump": {
        "key": "6puud",
        "blockListIndex": 0,
        "inListOrder": 0
      },
      "7tegj": {
        "key": "6puud",
        "blockListIndex": 0,
        "inListOrder": 1
      },
      "7cl1n": {
        "key": "7tegj",
        "blockListIndex": 0,
        "inListOrder": 0
      },
      "dn4hc": {
        "key": null,
        "blockListIndex": 1,
        "inListOrder": 1
      },
      "2cf43": {
        "key": null,
        "blockListIndex": 2,
        "inListOrder": 0
      },
      "8idd4": {
        "key": "2cf43",
        "blockListIndex": 0,
        "inListOrder": 0
      },
      "9btli": {
        "key": "2cf43",
        "blockListIndex": 0,
        "inListOrder": 1
      },
      "45f6v": {
        "key": "9btli",
        "blockListIndex": 0,
        "inListOrder": 0
      },
      "2c9i4": {
        "key": "2cf43",
        "blockListIndex": 1,
        "inListOrder": 0
      },
      "3vfhs": {
        "key": null,
        "blockListIndex": 3,
        "inListOrder": 0
      },
      "5ur9n": {
        "key": null,
        "blockListIndex": 3,
        "inListOrder": 1
      },
      "1960r": {
        "key": "5ur9n",
        "blockListIndex": 0,
        "inListOrder": 0
      },
      "368b5": {
        "key": "5ur9n",
        "blockListIndex": 0,
        "inListOrder": 1
      }
    };
    expect(blockTree.parentMap).not.toBeUndefined();
    for (let key in expectedParentMap) {
      expect(blockTree.parentMap[key].key).toBe(expectedParentMap[key].key);
      expect(blockTree.parentMap[key].blockListIndex).toBe(expectedParentMap[key].blockListIndex);
      expect(blockTree.parentMap[key].inListOrder).toBe(expectedParentMap[key].inListOrder);
    }
  });
});