import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import _ from "lodash";

import EditableBlock from "../Components/EditableBlock";
import { setCaretToEnd } from "../helper";

export default function EditableForm() {
  const getnewBlock = (value) => ({
    id: v4(),
    tag: "p",
    html: value || "",
    label: "Label: ",
    options: ["Option 1", "Option 2", "Option 3"],
  });

  const [blocks, setBlocks] = useState([getnewBlock("Type something to start building your form.")]);
  const [isNewBlock, setIsNewBlock] = useState(null);
  const [toRemoveBlock, setToRemoveBlock] = useState(null);
  const [changeFocus, setChangeFocus] = useState(null);

  const updateBlock = (currentBlock) => {
    let updatedBlocks = [...blocks];
    let relatedBlockIndex = _.findIndex(updatedBlocks, { id: currentBlock.id });
    updatedBlocks[relatedBlockIndex] = JSON.parse(JSON.stringify({ ...currentBlock, ref: undefined }));
    setBlocks([...updatedBlocks]);
  };

  const addNewBlock = (currentBlock) => {
    let updatedBlocks = [...blocks];
    let relatedBlockIndex = _.findIndex(updatedBlocks, { id: currentBlock.id });
    updatedBlocks[relatedBlockIndex] = JSON.parse(JSON.stringify({ ...currentBlock, ref: undefined }));
    const newBlock = getnewBlock();
    updatedBlocks.splice(relatedBlockIndex + 1, 0, newBlock);
    setBlocks([...updatedBlocks]);
    if (currentBlock.tag === "p") setChangeFocus(currentBlock.ref);
  };

  const deleteBlock = (currentBlock) => {
    const previousBlock = currentBlock.ref.previousElementSibling;
    if (previousBlock) {
      console.log(blocks.length);
      let updatedBlocks = [...blocks];
      let relatedBlockIndex = _.findIndex(updatedBlocks, { id: currentBlock.id });
      updatedBlocks.splice(relatedBlockIndex, 1);
      setBlocks([...updatedBlocks]);
      previousBlock.focus();
      setCaretToEnd(previousBlock);
    }
  };

  useEffect(() => {
    if (isNewBlock) {
      addNewBlock(isNewBlock);
      setIsNewBlock(false);
    }
  }, [isNewBlock]);

  useEffect(() => {
    if (toRemoveBlock) {
      deleteBlock(toRemoveBlock);
      setToRemoveBlock(false);
    }
  }, [toRemoveBlock]);

  useEffect(() => {
    if (changeFocus && changeFocus?.nextElementSibling) {
      changeFocus?.nextElementSibling.focus();
      setChangeFocus(false);
    }
  }, [changeFocus]);

  const manuallyAddBlock = () => {
    addNewBlock(_.last(blocks));
  };

  const onSubmit = () => {
    console.log("SUBMIT");
  };

  const onImport = () => {};
  const onExport = () => {
    const element = document.createElement("a");
    // download json to device
    let cloneDeep = _.cloneDeep(blocks);
    cloneDeep = cloneDeep.map((block) => {
      if (block.tag === "p" || block.tag === "h1") block = _.omit(block, ["options", "label"]);
      if (block.tag === "input") block = _.omit(block, ["label", "options"]);
      if (block.tag === "option") block = _.omit(block, ["html"]);
      return block;
    });
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(cloneDeep, null, 2))
    );
    element.setAttribute("download", "notion-clone-export.json");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div>
      <div className="flex_row" style={{ justifyContent: "space-between" }}>
        <h1 className="title">Notion Clone</h1>
        <div>
          <button onClick={onImport} type="button" className="btn btn-outline-secondary">
            Import
          </button>
          <button onClick={onExport} type="button" className="btn btn-outline-dark" style={{ marginLeft: 20 }}>
            Export
          </button>
        </div>
      </div>

      {blocks.map((block) => (
        <EditableBlock
          key={block.id}
          block={block}
          updateBlock={updateBlock}
          setIsNewBlock={setIsNewBlock}
          setToRemoveBlock={setToRemoveBlock}
        />
      ))}
      <div style={{ padding: "12px 0" }} className="flex_row">
        <button type="button" className="btn btn-primary" onClick={manuallyAddBlock}>
          Add
        </button>
        <button type="button" className="btn btn-dark" style={{ marginLeft: 20 }} onClick={onSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}
