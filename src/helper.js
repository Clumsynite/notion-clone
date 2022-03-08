import _ from "lodash";

export const getCaretCoordinates = () => {
  let x, y;
  const selection = window.getSelection();
  if (selection.rangeCount !== 0) {
    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(false);
    const rect = range.getClientRects()[0];
    if (rect) {
      x = rect.left;
      y = rect.top;
    }
  }
  return { x, y };
};

export const setCaretToEnd = (element) => {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
  element.focus();
};

export const isBlockValid = (block) => {
  if (!_.isObject(block) || Array.isArray(block)) throw "Block is not an object";
  if (!block.tag) throw "Block tag is not defined";
  if (!block.id) throw "Block id is not defined";
  if (!["p", "h1", "input", "option"].includes(block.tag)) throw `Block ${block.id} has a different tag`;
  if (block.tag === "input" && !block.label) throw `Block ${block.id} has no label`;
  if (block.tag === "option" && !block.options) throw `Block ${block.id} has no options`;
  if (block.tag === "option" && !block?.options?.length) throw `Block ${block.id} has no options`;
  if (["p", "h1"].includes(block.tag) && !block.html && block.html !== "") throw `Block ${block.id} has no html`;
  return true;
};

export const removeUnusedProperties = (blocks) => {
  let cloneDeep = _.cloneDeep(blocks);
  cloneDeep = cloneDeep.map((block) => {
    if (block.tag === "p" || block.tag === "h1") block = _.omit(block, ["options", "label"]);
    if (block.tag === "input") block = _.omit(block, ["options"]);
    if (block.tag === "option") block = _.omit(block, ["html"]);
    return block;
  });
  return cloneDeep;
};
