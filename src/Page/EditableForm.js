import React, { useState, useEffect } from "react";
import EditableBlock from "../Components/EditableBlock";
import { v4 } from "uuid";
import _ from "lodash";
import { setCaretToEnd } from "../helper";

export default function EditableForm() {
  const getnewBlock = (value) => ({
    id: v4(),
    tag: "p",
    html: value || "",
    label: "Label: ",
  });

  const [blocks, setBlocks] = useState([getnewBlock("Type something to start building your form.")]);
  const [isNewBlock, setIsNewBlock] = useState(null);
  const [toRemoveBlock, setToRemoveBlock] = useState(null);
  const [changeFocus, setChangeFocus] = useState(null);

  const updateBlock = (currentBlock) => {
    let updatedBlocks = [...blocks];
    let relatedBlockIndex = _.findIndex(updatedBlocks, { id: currentBlock.id, html: currentBlock.html });
    updatedBlocks[relatedBlockIndex] = currentBlock;
    setBlocks([...updatedBlocks]);
  };

  const addNewBlock = (currentBlock) => {
    let updatedBlocks = [...blocks];
    let relatedBlockIndex = _.findIndex(updatedBlocks, { id: currentBlock.id, html: currentBlock.html });
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
      let relatedBlockIndex = _.findIndex(updatedBlocks, { id: currentBlock.id, html: currentBlock.html });
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

  return (
    <div>
      {blocks.map((block) => (
        <EditableBlock
          key={block.id}
          block={block}
          updateBlock={updateBlock}
          setIsNewBlock={setIsNewBlock}
          setToRemoveBlock={setToRemoveBlock}
        />
      ))}
    </div>
  );
}
