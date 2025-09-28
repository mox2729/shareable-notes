import React from "react";

export default function NoteCard({ note, onOpen }) {
  return (
    <div
      className="note-card"
      style={{
        border: "1px solid #ccc",
        padding: 8,
        marginBottom: 8,
        borderRadius: 4,
        cursor: "pointer",
        backgroundColor: note.pinned ? "#fffae6" : "#fff"
      }}
      onClick={() => onOpen(note)}
    >
      <h4>{note.title}</h4>
      <p>{note.summary}</p>
      <small>{new Date(note.updatedAt).toLocaleString()}</small>
    </div>
  );
}
