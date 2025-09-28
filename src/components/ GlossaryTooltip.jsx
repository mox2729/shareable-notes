import React, { useState } from "react";

export default function GlossaryTooltip({ term, definition, children }) {
  const [show, setShow] = useState(false);

  return (
    <span
      style={{ position: "relative", cursor: "help", borderBottom: "1px dotted #555" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          backgroundColor: "#333",
          color: "#fff",
          padding: 4,
          borderRadius: 4,
          fontSize: 12,
          whiteSpace: "nowrap",
          zIndex: 100
        }}>
          {definition}
        </div>
      )}
    </span>
  );
}
