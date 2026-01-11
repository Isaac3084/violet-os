import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Folder,
  Trash2,
  Share2,
  Lock,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  ChevronLeft,
  MoreHorizontal,
  PenLine,
  Check,
  LayoutGrid,
  Type,
  Image as ImageIcon
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  folderId: string;
  isPinned?: boolean;
  isLocked?: boolean;
}

interface Folder {
  id: string;
  name: string;
  icon?: React.ReactNode;
  type: 'system' | 'user';
}

export const Notes: React.FC = () => {
  // --- State Management ---
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'all', name: 'All Notes', type: 'system', icon: <LayoutGrid size={15} /> },
    { id: 'personal', name: 'Personal', type: 'user', icon: <Folder size={15} /> },
    { id: 'work', name: 'Work', type: 'user', icon: <Folder size={15} /> },
    { id: 'ideas', name: 'Ideas', type: 'user', icon: <Folder size={15} /> },
    { id: 'trash', name: 'Recently Deleted', type: 'system', icon: <Trash2 size={15} /> }
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Welcome to Notes',
      content: '<h2>Welcome to your new Notes app</h2><p>Capture your thoughts, ideas, and to-do lists in a beautiful, distraction-free environment.</p><ul><li>Create folders to organize your life</li><li>Use rich text formatting</li><li>Pin important notes to the top</li></ul><p>Enjoy the best experience!</p>',
      createdAt: new Date(),
      updatedAt: new Date(),
      folderId: 'personal',
      isPinned: true
    },
    {
      id: '2',
      title: 'Project Phoenix Specs',
      content: '<h3>Q1 Goals</h3><p>We need to focus on the following key areas for the upcoming launch:</p><ol><li>Performance optimization (Target < 100ms TTI)</li><li><strong>UI smoothness</strong> and animations</li><li>Accessibility compliance (WCAG 2.1)</li></ol>',
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3600000),
      folderId: 'work'
    },
    {
      id: '3',
      title: 'Grocery List',
      content: '<ul><li>Almond Milk</li><li>Avocados 🥑</li><li>Sourdough Bread</li><li>Coffee Beans</li><li>Dark Chocolate</li></ul>',
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
      folderId: 'personal'
    }
  ]);

  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [listWidth, setListWidth] = useState(250);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // --- Derived State ---
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFolder = selectedFolderId === 'all'
        ? note.folderId !== 'trash'
        : note.folderId === selectedFolderId;

      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const activeFolder = folders.find(f => f.id === selectedFolderId);

  // --- Actions ---
  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      folderId: selectedFolderId === 'all' || selectedFolderId === 'trash' ? 'personal' : selectedFolderId
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    // Focus logic would go here
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
    ));
  };

  const deleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note?.folderId === 'trash') {
      // Permanently delete
      setNotes(prev => prev.filter(n => n.id !== id));
    } else {
      // Move to trash
      updateNote(id, { folderId: 'trash' });
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (selectedNoteId && contentRef.current) {
      updateNote(selectedNoteId, { content: contentRef.current.innerHTML });
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- Render ---
  return (
    <div className="notes-app">
      <style>{`
        .notes-app {
          height: 100%;
          display: flex;
          background: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1c1c1e;
          overflow: hidden;
        }

        /* --- Sidebar --- */
        .sidebar {
          background: #fbfbfd; /* macOS Sidebar gray */
          border-right: 1px solid rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          padding-top: 10px;
          transition: width 0.1s;
        }

        .sidebar-header {
          padding: 0 16px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #8e8e93;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .folder-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 8px;
        }

        .folder-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          margin-bottom: 2px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          color: #454545;
          transition: all 0.1s ease;
        }

        .folder-item:hover {
          background: rgba(0,0,0,0.04);
        }

        .folder-item.active {
          background: #e4e4e6; /* Active gray */
          color: #1c1c1e;
          font-weight: 500;
        }
        
        .folder-item.active svg {
          color: #f59e0b; /* Folder icon color when active */
          fill: #f59e0b;
          fill-opacity: 0.2;
        }

        .folder-icon {
          color: #999;
          display: flex;
          align-items: center;
        }

        /* --- Note List Details View --- */
        .note-list-panel {
          background: #fff;
          border-right: 1px solid rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
        }

        .list-header {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .list-title {
          font-size: 20px;
          font-weight: 700;
          color: #1c1c1e;
        }

        .search-bar {
          position: relative;
        }

        .search-input {
          width: 100%;
          background: #e3e3e8;
          border: none;
          border-radius: 8px;
          padding: 6px 10px 6px 32px;
          font-size: 13px;
          color: #333;
          outline: none;
          transition: background 0.2s;
        }

        .search-input:focus {
          background: #dcdce1;
        }

        .search-icon {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: #8e8e93;
        }

        .notes-scroll-area {
          flex: 1;
          overflow-y: auto;
        }

        .note-item {
          padding: 12px 20px;
          border-bottom: 1px solid #f2f2f7;
          cursor: pointer;
        }

        .note-item:hover {
          background: #f9f9fb;
        }

        .note-item.active {
          background: #ffeecc; /* Classic clean selection */
          border-left: 3px solid #f59e0b;
        }
        
        .note-item-title {
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .note-item-meta {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: #8e8e93;
          margin-bottom: 2px;
        }

        .note-item-preview {
          font-size: 13px;
          color: #8e8e93;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* --- Editor Area --- */
        .editor-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fff;
          position: relative;
        }

        .editor-toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 24px;
          border-bottom: 1px solid #f2f2f7;
        }

        .toolbar-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #8e8e93;
          padding: 4px;
          border-radius: 4px;
          transition: 0.2s;
        }

        .toolbar-btn:hover {
          background: #f2f2f7;
          color: #1c1c1e;
        }

        .editor-content-wrapper {
          flex: 1;
          overflow-y: auto;
          padding: 0 40px 40px;
        }

        .date-badge {
          text-align: center;
          color: #8e8e93;
          font-size: 12px;
          margin: 20px 0;
          font-weight: 500;
        }

        .title-input {
          font-size: 28px;
          font-weight: 700;
          color: #1c1c1e;
          border: none;
          outline: none;
          width: 100%;
          margin-bottom: 16px;
          background: transparent;
        }

        .content-editable {
          font-size: 16px;
          line-height: 1.6;
          color: #333;
          outline: none;
          min-height: 50%;
        }

        .content-editable p { margin-bottom: 12px; }
        .content-editable h1, .content-editable h2, .content-editable h3 { margin-top: 24px; margin-bottom: 12px; font-weight: 600; }
        .content-editable ul, .content-editable ol { margin-left: 20px; margin-bottom: 16px; }
        .content-editable blockquote { border-left: 3px solid #e5e5e5; padding-left: 16px; color: #666; font-style: italic; }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #8e8e93;
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar" style={{ width: sidebarWidth }}>
        <div className="sidebar-header">iCloud</div>
        <div className="folder-list">
          {folders.map(folder => (
            <div
              key={folder.id}
              className={`folder-item ${selectedFolderId === folder.id ? 'active' : ''}`}
              onClick={() => setSelectedFolderId(folder.id)}
            >
              <div className="folder-icon">{folder.icon}</div>
              <span>{folder.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Note List */}
      <div className="note-list-panel" style={{ width: listWidth }}>
        <div className="list-header">
          <div className="list-title">{activeFolder?.name || 'Notes'}</div>
          <div className="search-bar">
            <Search size={14} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="notes-scroll-area">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`note-item ${selectedNoteId === note.id ? 'active' : ''}`}
              onClick={() => setSelectedNoteId(note.id)}
            >
              <div className="note-item-title">{note.title || 'New Note'}</div>
              <div className="note-item-meta">
                <span>{formatDate(note.updatedAt)}</span>
                <span className="note-item-preview">
                  {note.content.replace(/<[^>]*>/g, '').substring(0, 30) || 'No additional text'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="editor-panel">
        {selectedNote ? (
          <>
            <div className="editor-toolbar">
              <button className="toolbar-btn" onClick={() => formatText('bold')} title="Bold">
                <Bold size={18} />
              </button>
              <button className="toolbar-btn" onClick={() => formatText('italic')} title="Italic">
                <Italic size={18} />
              </button>
              <button className="toolbar-btn" onClick={() => formatText('underline')} title="Underline">
                <Underline size={18} />
              </button>
              <div style={{ width: 1, height: 20, background: '#eee' }}></div>
              <button className="toolbar-btn" onClick={() => formatText('insertUnorderedList')} title="Bullet List">
                <List size={18} />
              </button>
              <button className="toolbar-btn" onClick={() => formatText('insertOrderedList')} title="Numbered List">
                <ListOrdered size={18} />
              </button>
              <div style={{ width: 1, height: 20, background: '#eee' }}></div>
              <button className="toolbar-btn" title="Add Image">
                <ImageIcon size={18} />
              </button>
              <div style={{ flex: 1 }}></div>
              <button className="toolbar-btn" onClick={createNewNote} title="New Note">
                <Plus size={18} />
              </button>
              <button className="toolbar-btn" onClick={() => selectedNoteId && deleteNote(selectedNoteId)} title="Delete">
                <Trash2 size={18} />
              </button>
            </div>

            <div className="editor-content-wrapper">
              <div className="date-badge">{formatFullDate(selectedNote.updatedAt)}</div>

              <input
                className="title-input"
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                placeholder="Title"
              />

              <div
                key={selectedNote.id} // Re-render on id change to update content
                className="content-editable"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                onInput={(e) => updateNote(selectedNote.id, { content: e.currentTarget.innerHTML })}
              />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <LayoutGrid size={64} style={{ opacity: 0.1, marginBottom: 20 }} />
            <p>Select a note or create a new one.</p>
            <button
              onClick={createNewNote}
              style={{ marginTop: 20, padding: '8px 16px', borderRadius: 6, border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
