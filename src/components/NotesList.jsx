import React from "react";
import NoteCard from "./NoteCard";

export default function NotesList({ notes, onOpen, onCreate }) {
  return (
    <div>
      <button onClick={onCreate} style={{ marginBottom: 12 }}>+ New Note</button>
      {notes.map(n => (
        <NoteCard key={n.id} note={n} onOpen={onOpen} />
      ))}
    </div>
  );
}
