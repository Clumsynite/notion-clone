import React, { useState, useEffect } from "react";
import { matchSorter } from "match-sorter";

import "../styles/SelectMenu.css";

const MENU_HEIGHT = 40;

const allowedTags = [
  {
    id: "headline",
    tag: "h1",
    label: "headline",
  },
  {
    id: "textinput",
    tag: "input",
    label: "textinput",
  },
  {
    id: "option",
    tag: "option",
    label: "option",
  },
];

const SelectMenu = ({ position, onSelect, close }) => {
  const [items, setItems] = useState(allowedTags);
  const [selected, setSelected] = useState(0);
  const [command, setCommand] = useState("");

  // If the tag selector menu is display outside the top viewport,
  // we display it below the block
  const isMenuOutsideOfTopViewport = position.y - MENU_HEIGHT < 0;
  const y = !isMenuOutsideOfTopViewport ? position.y - MENU_HEIGHT : position.y + MENU_HEIGHT / 3;
  const x = position.x;

  // Filter items based on given command
  useEffect(() => {
    setItems(matchSorter(allowedTags, command, { keys: ["tag"] }));
  }, [command]);

  // Attach listener to allow tag selection via keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSelect(items[selected].tag);
      } else if (e.key === "Tab" || e.key === "ArrowDown") {
        e.preventDefault();
        const newselected = selected === items.length - 1 ? 0 : selected + 1;
        setSelected(newselected);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const newselected = selected === 0 ? items.length - 1 : selected - 1;
        setSelected(newselected);
      } else if (e.key === "Backspace") {
        if (command) {
          setCommand(command.slice(0, -1));
        } else {
          close();
        }
      } else {
        setCommand(command + e.key);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line
  }, [items, selected]);

  return (
    <div
      className="select_menu_wrapper"
      style={{
        top: y,
        left: x,
        justifyContent: !isMenuOutsideOfTopViewport ? "flex-end" : "flex-start",
      }}
    >
      <div className="select_menu">
        {items.map((item, key) => {
          const isSelected = items.indexOf(item) === selected;
          return (
            <div
              className={isSelected ? ["selected", "menu_item"].join(" ") : "menu_item"}
              key={key}
              role="button"
              tabIndex="0"
              onClick={() => onSelect(item.tag)}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectMenu;
