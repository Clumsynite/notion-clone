import React, { useState, useRef, useEffect } from "react";
import ContentEditable from "react-contenteditable";
import _ from "lodash";
import { Draggable } from "react-beautiful-dnd";

import { getCaretCoordinates, setCaretToEnd } from "../helper";
import SelectMenu from "./SelectMenu";
import EditableOption from "./EditableOption";
import "./EditableBlock.css";

export default function EditableBlock({ block, updateBlock, setIsNewBlock, setToRemoveBlock, ...props }) {
  const editableRef = useRef();
  const htmlRef = useRef(block.html);
  const labelRef = useRef(block.label);
  const inputRef = useRef();

  const [html, setHtml] = useState(block.html);
  const [tag, setTag] = useState(block.tag);
  const [label, setLabel] = useState(block.label);
  const [htmlBackup, setHtmlBackup] = useState(block.html);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: null, y: null });
  const [justClosedMenu, setJustClosedMenu] = useState(1); // 0 - opened, 1 - just closed, 2 - closed
  const [options, setOptions] = useState(block.options);

  const onHtmlChange = (e) => {
    htmlRef.current = e.target.value;
  };

  const onHtmlBlur = () => {
    setHtml(htmlRef.current);
  };

  const onLabelChange = (e) => {
    labelRef.current = e.target.value;
  };

  const onLabelBlur = () => {
    setLabel(labelRef.current);
  };

  const onInputChange = (e) => {
    htmlRef.current = e.target.value;
    setHtml(htmlRef.current);
  };

  useEffect(() => {
    let htmlChanged = htmlRef.current !== html;
    let tagChanged = tag !== tag;
    let labelChanged = labelRef.current !== label;
    if (htmlChanged || tagChanged || labelChanged) {
      updateBlock({
        ...block,
        tag,
        html: _.replace(htmlRef.current, "/", ""),
        ref: editableRef.current,
        label: labelRef.current,
      });
    }
  }, [html, label, tag, labelRef.current, htmlRef.current]);

  const keyDownHandler = (e) => {
    if (e.keyCode === 191) {
      setHtmlBackup(html);
      setIsMenuOpen(true);
    }
    if (!e.shiftKey && e.keyCode === 13 && justClosedMenu === 1) {
      e.preventDefault();
      setIsNewBlock({ ...block, html: html.current, label: label.current, options, tag, ref: editableRef.current });
    }
    if (e.keyCode === 8 && !htmlRef.current) {
      e.preventDefault();
      setToRemoveBlock({ ...block, ref: editableRef.current });
    }
  };

  const onTagChange = (tag) => {
    setTag(tag);
    htmlRef.current = _.replace(htmlRef.current, "/", "");
  };

  const onKeyUpHandler = (e) => {
    if (e.key === "/") {
      onOpenMenu();
    }
  };

  const onOpenMenu = () => {
    const { x, y } = getCaretCoordinates();
    setIsMenuOpen(true);
    setMenuPosition({ x, y });
    setJustClosedMenu(0);
    document.addEventListener("click", onCloseMenu);
  };

  const onCloseMenu = () => {
    setHtmlBackup(null);
    setIsMenuOpen(false);
    setMenuPosition({ x: null, y: null });
    setJustClosedMenu(1);
    document.removeEventListener("click", onCloseMenu);
  };

  useEffect(() => {
    if (justClosedMenu === 1) setJustClosedMenu(2);
  }, [justClosedMenu]);

  useEffect(() => {
    if (tag) {
      setHtml(htmlBackup);
      if (tag === "p") setCaretToEnd(editableRef.current);
      onCloseMenu();
    }
  }, [tag]);

  const onOptionChange = (option, index) => {
    setOptions(options.map((opt, i) => (i === index ? option : opt)));
  };

  useEffect(() => {
    if (options && options.length > 0) {
      let hasChanged = _.isEqual(options, block.options);
      if (!hasChanged) {
        updateBlock({ ...block, options, ref: editableRef.current });
      }
    }
  }, [options]);

  return (
    <>
      {isMenuOpen && <SelectMenu position={menuPosition} onSelect={onTagChange} close={onCloseMenu} />}
      <Draggable draggableId={block.id} index={props.position}>
        {(provided /* use "snapshot" variable later to change style while dragging */) => (
          <div ref={provided.innerRef} className={["draggable", "flex_row"].join(" ")} {...provided.draggableProps}>
            <div style={{ flex: 9 }}>
              {tag === "input" ? (
                <div className="flex_row">
                  <ContentEditable
                    innerRef={editableRef}
                    html={labelRef.current}
                    tagName="p"
                    onChange={onLabelChange}
                    onBlur={onLabelBlur}
                    className="editable_label"
                  />
                  <input
                    ref={inputRef}
                    value={htmlRef.current}
                    onChange={onInputChange}
                    type="text"
                    className="editable_block"
                    style={{ width: "100%" }}
                  />
                </div>
              ) : tag === "option" ? (
                <div className={["flex_row", "editable_block"].join(" ")}>
                  <div>
                    <ContentEditable
                      innerRef={editableRef}
                      html={labelRef.current}
                      tagName="p"
                      onChange={onLabelChange}
                      onBlur={onLabelBlur}
                      className="editable_label"
                    />
                  </div>
                  <div className="flex_column">
                    {block.options.map((option, index) => (
                      <EditableOption key={index} option={option} onOptionChange={onOptionChange} index={index} />
                    ))}
                  </div>
                </div>
              ) : (
                <ContentEditable
                  innerRef={editableRef}
                  html={htmlRef.current}
                  tagName={tag}
                  onChange={onHtmlChange}
                  onBlur={onHtmlBlur}
                  onKeyDown={keyDownHandler}
                  onKeyUp={onKeyUpHandler}
                  className="editable_block"
                />
              )}
            </div>
            <div
              style={{ flex: 1, cursor: "pointer" }}
              className="dragHandle"
              {...provided.dragHandleProps}
              tabIndex={-1}
            >
              <span className="iconify-inline" data-icon="bi:grip-vertical" data-width="20" data-height="20"></span>
            </div>
          </div>
        )}
      </Draggable>
    </>
  );
}
