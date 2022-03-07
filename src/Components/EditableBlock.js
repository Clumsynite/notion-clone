import React, { useState, useRef, useEffect } from "react";
import ContentEditable from "react-contenteditable";
import _ from "lodash";

import { getCaretCoordinates, setCaretToEnd } from "../helper";
import SelectMenu from "./SelectMenu";

export default function EditableBlock({ block, updateBlock, setIsNewBlock, setToRemoveBlock }) {
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
  const [justClosedMenu, setJustClosedMenu] = useState(false);

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
    if (htmlChanged || tagChanged) {
      updateBlock({
        ...block,
        tag,
        html: _.replace(htmlRef.current, "/", ""),
        ref: editableRef.current,
        label: labelRef.current,
      });
    }
  }, [html]);

  const keyDownHandler = (e) => {
    if (e.keyCode === 191) {
      setHtmlBackup(html);
      setIsMenuOpen(true);
    }
    if (!e.shiftKey && e.keyCode === 13 && !justClosedMenu) {
      e.preventDefault();
      setIsNewBlock({ ...block, ref: editableRef.current });
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
    setJustClosedMenu(true);
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
    if (justClosedMenu) setJustClosedMenu(false);
  }, [justClosedMenu]);

  useEffect(() => {
    if (tag) {
      setHtml(htmlBackup);
      if (tag === "p") setCaretToEnd(editableRef.current);
      onCloseMenu();
    }
  }, [tag]);

  return (
    <>
      {isMenuOpen && <SelectMenu position={menuPosition} onSelect={onTagChange} close={onCloseMenu} />}
      {tag === "input" ? (
        <div className="flex_row">
          <ContentEditable
            innerRef={editableRef}
            html={labelRef.current}
            tagName="p"
            onChange={onLabelChange}
            onBlur={onLabelBlur}
            className="editable_block"
          />
          <input
            ref={inputRef}
            value={htmlRef.current}
            onChange={onInputChange}
            type="text"
            className="editable_block"
          />
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
    </>
  );
}
