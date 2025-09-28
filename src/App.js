import React, { useEffect, useRef, useState } from "react";

// Starter single-file React app for "Shareable Notes".
// Features implemented:
// - Custom rich text editor (contentEditable) with toolbar: bold, italic, underline, align, font size
// - Create / Edit / Delete / Pin notes
// - Search notes by title/content
// - Persistence via localStorage
// - Basic note password-protection using crypto-js (AES)
// - Simple AI placeholders for summary & tag suggestions (replace with real API calls)

// To integrate: create a React app (CRA or Vite), install `crypto-js` and replace src/App.jsx with this file.

import CryptoJS from "crypto-js";

const STORAGE_KEY = "shareable_notes_v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
}

// --- AI placeholder functions ---
// Replace these implementations with real API calls (OpenAI/HuggingFace).
async function aiSummarize(text) {
  // Simple heuristic: first sentence or first 100 chars
  if (!text) return "";
  const plain = text.replace(/<[^>]+>/g, "").trim();
  const firstSentence = plain.split(/[.?!]\s/)[0];
  return firstSentence.length > 0 && firstSentence.length < 200
    ? firstSentence + (firstSentence.endsWith('.') ? '' : '.')
    : plain.slice(0, 120) + (plain.length > 120 ? '...' : '');
}

async function aiSuggestTags(text) {
  const plain = text.replace(/<[^>]+>/g, "").toLowerCase();
  // Very naive keyword picks
  const candidates = ["todo", "idea", "meeting", "project", "summary", "bug", "note", "research"];
  const picks = candidates.filter(c => plain.includes(c)).slice(0, 5);
  if (picks.length) return picks;
  // fallback: split on whitespace and take a few words
  return Array.from(new Set(plain.split(/\W+/).slice(0, 10))).slice(0, 5);
}

// Encryption helpers
function encryptText(text, password) {
  try {
    return CryptoJS.AES.encrypt(text, password).toString();
  } catch (e) {
    console.error("encrypt error", e);
    return null;
  }
}
function decryptText(cipher, password) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, password);
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    if (!plain) {
      // Wrong password or corrupted cipher
      throw new Error("Invalid password or corrupted data");
    }
    return plain;
  } catch (e) {
    console.error("decrypt error", e.message);
    return null;
  }
}


export default function App() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const editorRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);
    if (loaded.length) setSelectedId(loaded[0].id);
  }, []);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Helper to get selected note
  const selectedNote = notes.find(n => n.id === selectedId) || null;

  // Create a new note
  function createNote() {
    const newNote = {
      id: uid(),
      title: "Untitled",
      content: "",
      pinned: false,
      encrypted: false,
      encryptedPayload: null,
      summary: "",
      tags: [],
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedId(newNote.id);
    // focus editor after brief timeout
    setTimeout(() => {
      if (editorRef.current) editorRef.current.focus();
    }, 50);
  }

  // Delete a note
  function deleteNote(id) {
    if (!window.confirm("Delete this note?")) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // Save current note's content
  async function saveCurrentNote() {
    if (!selectedNote) return;
    const content = editorRef.current ? editorRef.current.innerHTML : selectedNote.content;
    const title = titleRef.current ? titleRef.current.value : selectedNote.title;

    // AI update: summary & tags
    const summary = await aiSummarize(content);
    const tags = await aiSuggestTags(content);

    setNotes(prev => prev.map(n => n.id === selectedNote.id ? {
      ...n,
      content,
      title,
      summary,
      tags,
      updatedAt: Date.now(),
    } : n));
  }

  function togglePin(id) {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
      // Keep pinned notes at top
      updated.sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt - a.updatedAt));
      return updated;
    });
  }

  // Encrypt / decrypt note
  function protectNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const pwd = prompt("Enter a password to encrypt this note:");
    if (!pwd) return alert("Password required to encrypt.");
    const cipher = encryptText(note.content, pwd);
    if (!cipher) return alert("Encryption failed.");
    setNotes(prev => prev.map(n => n.id === id ? { ...n, encrypted: true, encryptedPayload: cipher, content: "" } : n));
    if (selectedId === id) setSelectedId(null);
  }

  function unlockNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note || !note.encrypted) return;
    const pwd = prompt("Enter password to decrypt note:");
    if (!pwd) return;
    const plain = decryptText(note.encryptedPayload, pwd);
    if (!plain) return alert("Incorrect password or decryption failed.");
    setNotes(prev => prev.map(n => n.id === id ? { ...n, encrypted: false, encryptedPayload: null, content: plain } : n));
    setSelectedId(id);
  }

  // Apply basic formatting via document.execCommand (works well enough for starter)
  function applyFormat(command, value = null) {
    document.execCommand(command, false, value);
    // keep focus in editor
    if (editorRef.current) editorRef.current.focus();
  }

  // When selecting a note, set editor content (if not encrypted)
  function selectNote(note) {
    if (note.encrypted) {
      // cannot view until unlocked
      if (window.confirm("This note is encrypted. Unlock now?")) unlockNote(note.id);
      return;
    }
    setSelectedId(note.id);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = note.content || "";
      if (titleRef.current) titleRef.current.value = note.title || "";
    }, 0);
  }

  // filter notes by search
  const filtered = notes.filter(n => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (n.title && n.title.toLowerCase().includes(s)) || (n.content && n.content.toLowerCase().includes(s));
  });

  // When selectedNote changes, update editor content
  useEffect(() => {
    if (!selectedNote) {
      if (editorRef.current) editorRef.current.innerHTML = "";
      if (titleRef.current) titleRef.current.value = "";
      return;
    }
    if (selectedNote.encrypted) {
      if (editorRef.current) editorRef.current.innerHTML = "";
      if (titleRef.current) titleRef.current.value = "Encrypted note";
      return;
    }
    if (editorRef.current) editorRef.current.innerHTML = selectedNote.content || "";
    if (titleRef.current) titleRef.current.value = selectedNote.title || "";
  }, [selectedId, selectedNote]);

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 320, borderRight: '1px solid #eee', padding: 12, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={createNote}>+ New</button>
          <input
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          {filtered.length === 0 && <div style={{ padding: 12 }}>No notes</div>}
          {filtered.map(n => (
            <div key={n.id} style={{ padding: 8, borderBottom: '1px solid #f3f3f3', display: 'flex', gap: 8, alignItems: 'center', background: n.id === selectedId ? '#fbfbff' : 'transparent' }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => selectNote(n)}>
                <div style={{ fontWeight: 600 }}>{n.title || 'Untitled'}</div>
                <div style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} dangerouslySetInnerHTML={{ __html: n.summary || (n.content ? n.content.slice(0, 120) : '') }} />
                <div style={{ marginTop: 6 }}>
                  {n.tags && n.tags.slice(0,3).map(t => (
                    <span key={t} style={{ fontSize: 11, padding: '2px 6px', background: '#eef', marginRight: 4, borderRadius: 4 }}>{t}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button title="Pin" onClick={() => togglePin(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{n.pinned ? '📌' : '📍'}</button>
                <button title="Encrypt" onClick={() => protectNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🔒</button>
                <button title="Delete" onClick={() => deleteNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div style={{ flex: 1, padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => applyFormat('bold')}>Bold</button>
          <button onClick={() => applyFormat('italic')}>Italic</button>
          <button onClick={() => applyFormat('underline')}>Underline</button>
          <button onClick={() => applyFormat('justifyLeft')}>Left</button>
          <button onClick={() => applyFormat('justifyCenter')}>Center</button>
          <button onClick={() => applyFormat('justifyRight')}>Right</button>
          <select onChange={e => applyFormat('fontSize', e.target.value)} defaultValue="3">
            <option value="1">XS</option>
            <option value="2">S</option>
            <option value="3">M</option>
            <option value="4">L</option>
            <option value="5">XL</option>
          </select>
          <button onClick={saveCurrentNote} style={{ marginLeft: 'auto' }}>Save</button>
          <button onClick={() => {
            if (!selectedNote) return alert('Select or create a note first');
            // Quick export
            const content = editorRef.current ? editorRef.current.innerHTML : '';
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${(selectedNote.title||'note')}.html`;
            a.click();
            URL.revokeObjectURL(url);
          }}>Export</button>
        </div>

        {/* Title input */}
        <input ref={titleRef} placeholder="Note title" style={{ fontSize: 20, padding: 8, marginBottom: 8 }} />

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6, overflowY: 'auto' }}
        />

        {/* Note meta and AI outputs */}
        <div style={{ marginTop: 12, borderTop: '1px dashed #eee', paddingTop: 8 }}>
          {selectedNote ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div>Last edited: {new Date(selectedNote.updatedAt).toLocaleString()}</div>
              <div>Encrypted: {selectedNote.encrypted ? 'Yes' : 'No'}</div>
              <div style={{ marginLeft: 'auto' }}>
                <strong>Summary:</strong> {selectedNote.summary}
              </div>
            </div>
          ) : (
            <div>Select a note or create a new one to start editing.</div>
          )}
        </div>
      </div>
    </div>
  );
}
