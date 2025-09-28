import React from "react";

export default function EditorToolbar({ exec }) {
  return (
    <div className="toolbar" style={{ marginBottom: 8 }}>
      <button onClick={() => exec("bold")}><b>B</b></button>
      <button onClick={() => exec("italic")}><i>I</i></button>
      <button onClick={() => exec("underline")}><u>U</u></button>
      <button onClick={() => exec("insertUnorderedList")}>• List</button>
      <button onClick={() => exec("justifyLeft")}>Left</button>
      <button onClick={() => exec("justifyCenter")}>Center</button>
      <button onClick={() => exec("justifyRight")}>Right</button>
    </div>
  );
}
