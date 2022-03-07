import React, { useState, useRef } from "react";
import ContentEditable from "react-contenteditable";

export default function EditableOption({ option, index, onOptionChange }) {
  const optionRef = useRef();
  const textRef = useRef(option);
  const [text, setText] = useState(option);

  const onChange = (e) => {
    textRef.current = e.target.value;
  };

  const onBlur = () => {
    setText(textRef.current);
    onOptionChange(textRef.current, index);
  };

  return (
    <ContentEditable
      tagName="p"
      className="editable_options"
      innerRef={optionRef}
      html={textRef.current}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
