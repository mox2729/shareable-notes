// src/hooks/useNotes.js
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "shareable_notes_v1";

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } 
  catch { return []; }
}
function saveNotes(notes) { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); }

export default function useNotes() {
  const [notes, setNotes] = useState(() => loadNotes());
  useEffect(() => saveNotes(notes), [notes]);

  function createNote(overrides = {}) {
    const n = {
      id: uuidv4(),
      title: overrides.title || "Untitled",
      content: overrides.content || "",
      pinned: false,
      summary: overrides.summary || "",
      tags: overrides.tags || [],
      encrypted: false,
      encryptedPayload: null,
      versions: [],
      updatedAt: Date.now(),
    };
    setNotes(s => [n, ...s]);
    return n;
  }

  function updateNote(id, patch) {
    setNotes(s => s.map(n => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));
  }

  function deleteNote(id) { setNotes(s => s.filter(n => n.id !== id)); }
  function togglePin(id) { setNotes(s => s.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)); }
  function searchNotes(q) {
    const qq = q?.toLowerCase() || "";
    return notes.filter(n => n.title.toLowerCase().includes(qq) || (n.content || "").toLowerCase().includes(qq));
  }

  return { notes, createNote, updateNote, deleteNote, togglePin, searchNotes, setNotes };
}
