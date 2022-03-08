import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import _ from "lodash";

import EditableBlock from "../Components/EditableBlock";
import { isBlockValid, removeUnusedProperties, setCaretToEnd } from "../helper";
import { DragDropContext } from "react-beautiful-dnd";
import { Droppable } from "react-beautiful-dnd";

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
  const [selectedJSON, setSelectedJSON] = useState(null);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (selectedJSON) {
      let parsedJSON;
      let reader = new FileReader();
      reader.onload = (e) => {
        parsedJSON = JSON.parse(e.target.result);

        if (parsedJSON) {
          try {
            for (let block of parsedJSON) {
              isBlockValid(block);
            }
            setBlocks(parsedJSON);
          } catch (error) {
            console.error(error);
            setError(_.isObject(error) ? "An Error Ocurred" : error);
          }
        }
      };
      reader.readAsText(selectedJSON);
      setSelectedJSON(false);
    }
  }, [selectedJSON]);

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => {
      setError(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [error]);

  const manuallyAddBlock = () => {
    addNewBlock(_.last(blocks));
  };

  const onSubmit = () => {
    console.log("SUBMIT");
  };

  const onExport = () => {
    const element = document.createElement("a");
    // download json to device
    const cleanJson = removeUnusedProperties(blocks);
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanJson, null, 2))
    );
    element.setAttribute("download", "notion-clone-export.json");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const onDragEndHandler = (result) => {
    const { destination, source } = result;

    // If we don't have a destination (due to dropping outside the droppable)
    // or the destination hasn't changed, we change nothing
    if (!destination || destination.index === source.index) {
      return;
    }

    console.log({ destination, source });
    const updatedBlocks = [...blocks];
    const removedBlocks = updatedBlocks.splice(source.index - 1, 1);
    updatedBlocks.splice(destination.index - 1, 0, removedBlocks[0]);
    setBlocks([...updatedBlocks]);
  };

  return (
    <div>
      <div className="flex_row" style={{ justifyContent: "space-between" }}>
        <h1 className="title">Notion Clone</h1>
        <div>
          <input
            type="file"
            id="file"
            accept="application/json" // only allow json files
            onChange={(e) => setSelectedJSON(e.target.files[0] || null)}
            style={{ display: "none" }}
          />
          <label
            htmlFor="file"
            style={{
              backgroundColor: "#fff",
              color: "#000",
              padding: 6,
              fontSize: 16,
              border: "1px solid #000",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: "normal",
            }}
          >
            Import
          </label>
          <button onClick={onExport} type="button" className="btn btn-outline-dark" style={{ marginLeft: 20 }}>
            Export
          </button>
        </div>
      </div>
      <div style={{ minHeight: 14 }}>{error && <div style={{ color: "red", fontSize: "12px" }}>{error}</div>}</div>

      <DragDropContext onDragEnd={onDragEndHandler}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {blocks.map((block, position) => {
                return (
                  <EditableBlock
                    key={block.id}
                    block={block}
                    updateBlock={updateBlock}
                    setIsNewBlock={setIsNewBlock}
                    setToRemoveBlock={setToRemoveBlock}
                    position={position + 1}
                    id={"blocks"}
                  />
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
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
