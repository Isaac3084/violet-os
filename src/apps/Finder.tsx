import React, { useState, useEffect } from 'react';
import { Folder, File, HardDrive, ChevronRight, ChevronDown } from 'lucide-react';
import { fileSystem } from '../utils/FileSystem';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified?: string;
  children?: FileItem[];
}

export const Finder: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['desktop', 'documents', 'downloads', 'applications']));
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentFiles, setCurrentFiles] = useState<FileItem[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);

  useEffect(() => {
    refreshCurrentDirectory();
  }, [currentPath]);

  useEffect(() => {
    const handleClickOutside = () => {
      closeContextMenu();
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu]);

  const refreshCurrentDirectory = () => {
    const files = fileSystem.getCurrentDirectory();
    const formattedFiles: FileItem[] = files.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size ? `${(file.size / 1024).toFixed(1)} KB` : undefined,
      modified: file.modified.toLocaleDateString(),
      children: file.type === 'folder' ? [] : undefined
    }));
    setCurrentFiles(formattedFiles);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item.id);
    if (item.type === 'folder') {
      fileSystem.navigateToFolder(item.id);
      setCurrentPath([...fileSystem.getCurrentPath()]);
    } else {
      // Open file with appropriate app
      openFile(item);
    }
  };

  const openFile = (file: FileItem) => {
    const content = fileSystem.getFileContent(file.id);
    if (content) {
      // Create a new window with the file content
      alert(`Opening ${file.name}:\n\n${content}`);
    } else {
      alert(`Opening ${file.name} with default application`);
    }
  };

  const handleBack = () => {
    if (fileSystem.navigateUp()) {
      setCurrentPath([...fileSystem.getCurrentPath()]);
    }
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name && name.trim()) {
      if (fileSystem.createFolder(name.trim())) {
        refreshCurrentDirectory();
      } else {
        alert('Failed to create folder. The name might be invalid or already exists.');
      }
    }
  };

  const handleCreateFile = () => {
    const name = prompt('Enter file name:');
    if (name && name.trim()) {
      if (fileSystem.createFile(name.trim(), 'This is a new file created in Finder.')) {
        refreshCurrentDirectory();
      } else {
        alert('Failed to create file. The name might be invalid or already exists.');
      }
    }
  };

  const handleDelete = () => {
    if (selectedItem) {
      // Create a custom confirmation dialog instead of using confirm()
      const shouldDelete = window.confirm('Are you sure you want to delete this item?');
      if (shouldDelete) {
        fileSystem.deleteItem(selectedItem);
        setSelectedItem(null);
        refreshCurrentDirectory();
      }
    }
  };

  const handleRename = () => {
    if (selectedItem) {
      const file = fileSystem.getFileInfo(selectedItem);
      const newName = prompt('Enter new name:', file?.name);
      if (newName && newName.trim() && file && newName.trim() !== file.name) {
        if (fileSystem.renameItem(selectedItem, newName.trim())) {
          refreshCurrentDirectory();
        } else {
          alert('Failed to rename item. The name might be invalid or already exists.');
        }
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const renderSidebarItem = (item: any, level: number = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const Icon = item.type === 'folder' ? Folder : File;

    return (
      <div key={item.id}>
        <div
          className={`finder-sidebar-item ${selectedItem === item.id ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleItemClick(item)}
          onContextMenu={(e) => handleContextMenu(e, item.id)}
        >
          {item.type === 'folder' && (
            <span style={{ marginRight: '4px' }}>
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          )}
          <Icon size={16} style={{ marginRight: '8px' }} />
          <span>{item.name}</span>
        </div>
        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {item.children.map((child: any) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getCurrentFolder = (): FileItem[] => {
    return currentFiles;
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ id: 'root', name: 'macOS HD', type: 'folder' as const }];
    
    currentPath.forEach(folderId => {
      const folder = fileSystem.getFileInfo(folderId);
      if (folder && folder.type === 'folder') {
        breadcrumbs.push(folder as any);
      }
    });
    
    return breadcrumbs;
  };

  const renderMainContent = () => {
    const items = getCurrentFolder();
    
    return (
      <div className="finder-main-content">
        <div className="finder-toolbar">
          <button className="finder-button" onClick={handleBack} title="Back">
            ← Back
          </button>
          <div className="finder-path">
            {currentPath.length === 0 ? 'macOS HD' : currentPath.join(' / ')}
          </div>
          <button className="finder-button" onClick={handleCreateFile} title="New File">
            + File
          </button>
          <button className="finder-button" onClick={handleCreateFolder} title="New Folder">
            + Folder
          </button>
        </div>
        
        {contextMenu && (
          <div 
            className="finder-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={closeContextMenu}
          >
            <div className="finder-context-menu-item" onClick={() => { handleRename(); closeContextMenu(); }}>
              Rename
            </div>
            <div className="finder-context-menu-item" onClick={() => { handleCreateFile(); closeContextMenu(); }}>
              New File
            </div>
            <div className="finder-context-menu-item" onClick={() => { handleCreateFolder(); closeContextMenu(); }}>
              New Folder
            </div>
            <div className="finder-context-menu-item" onClick={() => { 
              fileSystem.copyItems([contextMenu.itemId]); 
              closeContextMenu();
            }}>
              Copy
            </div>
            <div className="finder-context-menu-item" onClick={() => { 
              fileSystem.cutItems([contextMenu.itemId]); 
              closeContextMenu();
            }}>
              Cut
            </div>
            <div className="finder-context-menu-item" onClick={() => { 
              fileSystem.paste(); 
              refreshCurrentDirectory();
              closeContextMenu();
            }}>
              Paste
            </div>
            <div className="finder-context-menu-item" onClick={() => { handleDelete(); closeContextMenu(); }}>
              Delete
            </div>
          </div>
        )}
        
        <div className="finder-grid">
          {items.map((item) => {
            const Icon = item.type === 'folder' ? Folder : File;
            return (
              <div
                key={item.id}
                className={`finder-grid-item ${selectedItem === item.id ? 'selected' : ''}`}
                onClick={() => handleItemClick(item)}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
              >
                <Icon size={48} />
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .finder-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .finder-toolbar {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border-bottom: 1px solid #e0e0e0;
          gap: 8px;
        }
        
        .finder-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .finder-button:hover {
          background: #f0f0f0;
        }
        
        .finder-path {
          flex: 1;
          padding: 4px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
        }
        
        .finder-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .finder-sidebar {
          width: 200px;
          background: #f8f8f8;
          border-right: 1px solid #e0e0e0;
          padding: 8px 0;
          overflow-y: auto;
        }
        
        .finder-sidebar-item {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 13px;
          color: #333;
          transition: background-color 0.2s ease;
        }
        
        .finder-sidebar-item:hover {
          background: #e8e8e8;
        }
        
        .finder-sidebar-item.selected {
          background: #007AFF;
          color: white;
        }
        
        .finder-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .finder-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 16px;
          padding: 20px;
          align-content: start;
        }
        
        .finder-grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          text-align: center;
          color: #333;
          transition: background-color 0.2s ease;
        }
        
        .finder-grid-item:hover {
          background: #f0f0f0;
        }
        
        .finder-grid-item.selected {
          background: #007AFF;
          color: white;
        }
        
        .finder-grid-item span {
          margin-top: 8px;
          word-break: break-word;
        }
        
        .finder-context-menu {
          position: fixed;
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 1000;
          min-width: 150px;
        }
        
        .finder-context-menu-item {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 13px;
          color: #333;
        }
        
        .finder-context-menu-item:hover {
          background: #f0f0f0;
        }
      `}</style>
      
      <div className="finder-content">
        <div className="finder-sidebar">
          <div style={{ padding: '8px', fontWeight: 'bold', fontSize: '12px', color: '#666' }}>
            FAVORITES
          </div>
          {fileSystem.getCurrentDirectory().filter(item => item.parentId === 'root').map(item => renderSidebarItem(item))}
          
          <div style={{ padding: '8px', fontWeight: 'bold', fontSize: '12px', color: '#666', marginTop: '16px' }}>
            LOCATIONS
          </div>
          <div className="finder-sidebar-item">
            <HardDrive size={16} style={{ marginRight: '8px' }} />
            <span>macOS HD</span>
          </div>
        </div>
        
        {renderMainContent()}
      </div>
    </div>
  );
};
