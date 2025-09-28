import React, { useState } from "react";
import useNotes from "../hooks/useNotes";
import NotesList from "../components/NotesList";
import RichTextEditor from "../components/RichTextEditor";
import { callAi } from "../api/aiClient";
import DOMPurify from "dompurify";

export default function Home() {
  const { notes, createNote, updateNote } = useNotes();
  const [active, setActive] = useState(null);

  function handleNew() {
    const n = createNote();
    setActive(n);
  }

  async function handleSave(content, title = "Untitled") {
    if (!active) return;

    // optional: AI summary
    let summary = "";
    try {
      const resp = await callAi("summarize", content);
      summary = resp?.data?.output?.[0]?.content?.[0]?.text?.slice(0, 200) || "";
    } catch (err) {
      console.warn("AI summarize failed:", err);
    }

    updateNote(active.id, { content, title, summary });
  }

  return (
    <div style={{ display: "flex", gap: 20, padding: 12 }}>
      <aside style={{ width: 300 }}>
        <NotesList notes={notes} onOpen={setActive} onCreate={handleNew} />
      </aside>
      <main style={{ flex: 1 }}>
        {active ? (
          <>
            <input
              value={active.title}
              onChange={(e) => updateNote(active.id, { title: e.target.value })}
              style={{ width: "100%", marginBottom: 8, fontSize: 16 }}
            />
            <RichTextEditor
              value={active.content}
              onChange={(html) => updateNote(active.id, { content: html })}
            />
            <button onClick={() => handleSave(active.content, active.title)} style={{ marginTop: 8 }}>
              Save
            </button>
          </>
        ) : (
          <div>Select or create a note</div>
        )}
      </main>
    </div>
  );
}
