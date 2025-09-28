import React, { useRef, useEffect } from "react";
import EditorToolbar from "./EditorToolbar";

export default function RichTextEditor({ value, onChange, placeholder = "Write your note..." }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function exec(command) {
    document.execCommand(command, false, null);
    onChange(ref.current.innerHTML);
    ref.current.focus();
  }

  function handleInput() {
    onChange(ref.current.innerHTML);
  }

  return (
    <div>
      <EditorToolbar exec={exec} />
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        style={{
          border: "1px solid #ddd",
          minHeight: 200,
          padding: 12,
          borderRadius: 4
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
