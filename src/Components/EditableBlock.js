import React, { useState, useRef, useEffect } from "react";
import ContentEditable from "react-contenteditable";

export default function EditableBlock({ block, updateBlock, setIsNewBlock, setToRemoveBlock }) {
  const editableRef = useRef();
  const htmlRef = useRef(block.html);

  const [html, setHtml] = useState(block.html);
  const [tag, setTag] = useState(block.tag);
  const [previousKey, setPreviousKey] = useState(null);
  const [htmlBackup, setHtmlBackup] = useState(block.html);

  useEffect(() => {
    // htmlRef.current = block.html;
  }, []);

  const handleChange = (evt) => {
    htmlRef.current = evt.target.value;
  };

  const handleBlur = () => {
    setHtml(htmlRef.current);
  };

  useEffect(() => {
    let htmlChanged = htmlRef.current !== html;
    let tagChanged = tag !== tag;
    if (htmlChanged || tagChanged) {
      updateBlock({ ...block, tag, html: htmlRef.current, ref: editableRef.current });
    }
  }, [html]);

  const keyDownHandler = (evt) => {
    if (evt.keyCode === 191) {
      setHtmlBackup(html);
    }
    if (previousKey !== 16 && evt.keyCode === 13) {
      evt.preventDefault();
      setIsNewBlock({ ...block, ref: editableRef.current });
    }
    if (evt.keyCode === 8 && !htmlRef.current) {
      evt.preventDefault();
      setToRemoveBlock({ ...block, ref: editableRef.current });
    }
    setPreviousKey(evt.keyCode);
  };

  return (
    <ContentEditable
      innerRef={editableRef}
      html={htmlRef.current}
      tagName={tag}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={keyDownHandler}
      className="editable_block"
    />
  );
}
