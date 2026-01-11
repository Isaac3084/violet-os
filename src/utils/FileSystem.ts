export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  created: Date;
  content?: string;
  parentId: string;
  children?: string[];
}

export interface FileSystemState {
  files: Record<string, FileItem>;
  currentPath: string[];
  clipboard?: {
    items: string[];
    operation: 'copy' | 'cut';
  };
}

class FileSystemManager {
  private files: Record<string, FileItem> = {};
  private currentPath: string[] = [];
  private clipboard?: { items: string[]; operation: 'copy' | 'cut' };

  constructor() {
    this.initializeFileSystem();
  }

  private initializeFileSystem() {
    const now = new Date();

    // Root folders
    const desktop: FileItem = {
      id: 'desktop',
      name: 'Desktop',
      type: 'folder',
      modified: now,
      created: now,
      parentId: 'root',
      children: []
    };

    const documents: FileItem = {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      modified: now,
      created: now,
      parentId: 'root',
      children: []
    };

    const downloads: FileItem = {
      id: 'downloads',
      name: 'Downloads',
      type: 'folder',
      modified: now,
      created: now,
      parentId: 'root',
      children: []
    };

    const applications: FileItem = {
      id: 'applications',
      name: 'Applications',
      type: 'folder',
      modified: now,
      created: now,
      parentId: 'root',
      children: []
    };

    // Desktop files
    const readmeFile: FileItem = {
      id: 'readme',
      name: 'README.txt',
      type: 'file',
      size: 1024,
      modified: new Date(now.getTime() - 86400000),
      created: new Date(now.getTime() - 86400000),
      parentId: 'desktop',
      content: 'Welcome to macOS 26!\n\nThis is your desktop. You can:\n- Create new files and folders\n- Organize your work\n- Access your applications\n- Browse the web with Safari\n\nEnjoy your new macOS experience!'
    };

    const screenshotFile: FileItem = {
      id: 'screenshot',
      name: 'screenshot.png',
      type: 'file',
      size: 2048576,
      modified: new Date(now.getTime() - 3600000),
      created: new Date(now.getTime() - 3600000),
      parentId: 'desktop'
    };

    // Documents files
    const resumeFile: FileItem = {
      id: 'resume',
      name: 'Resume.pdf',
      type: 'file',
      size: 245760,
      modified: new Date(now.getTime() - 172800000),
      created: new Date(now.getTime() - 172800000),
      parentId: 'documents'
    };

    const notesFile: FileItem = {
      id: 'notes',
      name: 'Meeting Notes.txt',
      type: 'file',
      size: 512,
      modified: new Date(now.getTime() - 86400000),
      created: new Date(now.getTime() - 86400000),
      parentId: 'documents',
      content: 'Team Meeting - January 11, 2026\n\nAttendees:\n- John Doe\n- Sarah Smith\n- Mike Johnson\n\nAgenda:\n1. Q1 Goals\n2. Project Timeline\n3. Budget Review\n\nAction Items:\n- Finalize project proposal\n- Schedule follow-up meeting\n- Update documentation'
    };

    const projectsFolder: FileItem = {
      id: 'projects',
      name: 'Projects',
      type: 'folder',
      modified: new Date(now.getTime() - 259200000),
      created: new Date(now.getTime() - 259200000),
      parentId: 'documents',
      children: []
    };

    // Downloads files
    const installerFile: FileItem = {
      id: 'installer',
      name: 'macOS-26-Installer.dmg',
      type: 'file',
      size: 1342177280,
      modified: new Date(now.getTime() - 604800000),
      created: new Date(now.getTime() - 604800000),
      parentId: 'downloads'
    };

    const photoFile: FileItem = {
      id: 'photo',
      name: 'vacation-photo.jpg',
      type: 'file',
      size: 3565158,
      modified: new Date(now.getTime() - 1209600000),
      created: new Date(now.getTime() - 1209600000),
      parentId: 'downloads'
    };

    // Add all files to the system
    this.files = {
      'root': { id: 'root', name: '/', type: 'folder', modified: now, created: now, parentId: '', children: ['desktop', 'documents', 'downloads', 'applications'] },
      'desktop': { ...desktop, children: ['readme', 'screenshot'] },
      'documents': { ...documents, children: ['resume', 'notes', 'projects'] },
      'downloads': { ...downloads, children: ['installer', 'photo'] },
      'applications': { ...applications, children: [] },
      'readme': readmeFile,
      'screenshot': screenshotFile,
      'resume': resumeFile,
      'notes': notesFile,
      'projects': projectsFolder,
      'installer': installerFile,
      'photo': photoFile
    };
  }

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  public getCurrentDirectory(): FileItem[] {
    if (this.currentPath.length === 0) {
      return Object.values(this.files).filter(file => file.parentId === 'root');
    }

    const currentFolderId = this.currentPath[this.currentPath.length - 1];
    const currentFolder = this.files[currentFolderId];

    if (!currentFolder || currentFolder.type !== 'folder') {
      return [];
    }

    return currentFolder.children?.map(id => this.files[id]).filter(Boolean) || [];
  }

  public getCurrentPath(): string[] {
    return [...this.currentPath];
  }

  public navigateToFolder(folderId: string): boolean {
    const folder = this.files[folderId];
    if (!folder || folder.type !== 'folder') {
      return false;
    }

    if (this.currentPath.length === 0) {
      this.currentPath = [folderId];
    } else {
      const currentFolderId = this.currentPath[this.currentPath.length - 1];
      if (folder.parentId === currentFolderId) {
        this.currentPath.push(folderId);
      } else {
        this.currentPath = [folderId];
      }
    }

    this.notify();
    return true;
  }

  public navigateUp(): boolean {
    if (this.currentPath.length === 0) {
      return false;
    }

    this.currentPath.pop();
    this.notify();
    return true;
  }

  public createFile(name: string, content: string = '', parentId?: string): boolean {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name,
      type: 'file',
      size: content.length,
      modified: new Date(),
      created: new Date(),
      content,
      parentId: parentId || (this.currentPath.length > 0 ? this.currentPath[this.currentPath.length - 1] : 'desktop')
    };

    this.files[newFile.id] = newFile;

    // Update parent folder's children
    const parent = this.files[newFile.parentId];
    if (parent && parent.children) {
      parent.children.push(newFile.id);
      parent.modified = new Date();
    }

    this.notify();
    return true;
  }

  public createFolder(name: string, parentId?: string): boolean {
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name,
      type: 'folder',
      modified: new Date(),
      created: new Date(),
      parentId: parentId || (this.currentPath.length > 0 ? this.currentPath[this.currentPath.length - 1] : 'desktop'),
      children: []
    };

    this.files[newFolder.id] = newFolder;

    // Update parent folder's children
    const parent = this.files[newFolder.parentId];
    if (parent && parent.children) {
      parent.children.push(newFolder.id);
      parent.modified = new Date();
    }

    this.notify();
    return true;
  }

  public deleteItem(itemId: string): boolean {
    const item = this.files[itemId];
    if (!item) {
      return false;
    }

    // Recursively delete children if it's a folder
    if (item.type === 'folder' && item.children) {
      for (const childId of [...item.children]) {
        this.deleteItem(childId);
      }
    }

    // Remove from parent's children
    const parent = this.files[item.parentId];
    if (parent && parent.children) {
      parent.children = parent.children.filter(id => id !== itemId);
      parent.modified = new Date();
    }

    // Delete the item
    delete this.files[itemId];
    this.notify();
    return true;
  }

  public renameItem(itemId: string, newName: string): boolean {
    const item = this.files[itemId];
    if (!item) {
      return false;
    }

    item.name = newName;
    item.modified = new Date();

    // Update parent folder's modified time
    const parent = this.files[item.parentId];
    if (parent) {
      parent.modified = new Date();
    }

    this.notify();
    return true;
  }

  public getFileContent(itemId: string): string | undefined {
    const file = this.files[itemId];
    return file?.content;
  }

  public updateFileContent(itemId: string, content: string): boolean {
    const file = this.files[itemId];
    if (!file || file.type !== 'file') {
      return false;
    }

    file.content = content;
    file.size = content.length;
    file.modified = new Date();
    this.notify();
    return true;
  }

  public copyItems(itemIds: string[]): void {
    this.clipboard = {
      items: [...itemIds],
      operation: 'copy'
    };
    this.notify();
  }

  public cutItems(itemIds: string[]): void {
    this.clipboard = {
      items: [...itemIds],
      operation: 'cut'
    };
    this.notify();
  }

  public paste(): boolean {
    if (!this.clipboard || this.clipboard.items.length === 0) {
      return false;
    }

    const targetFolderId = this.currentPath.length > 0 ? this.currentPath[this.currentPath.length - 1] : 'desktop';

    for (const itemId of this.clipboard.items) {
      const item = this.files[itemId];
      if (!item) continue;

      if (this.clipboard.operation === 'cut') {
        // Move item
        const oldParent = this.files[item.parentId];
        if (oldParent && oldParent.children) {
          oldParent.children = oldParent.children.filter(id => id !== itemId);
          oldParent.modified = new Date();
        }

        item.parentId = targetFolderId;

        const newParent = this.files[targetFolderId];
        if (newParent && newParent.children) {
          newParent.children.push(itemId);
          newParent.modified = new Date();
        }
      } else {
        // Copy item
        const newItem: FileItem = {
          ...item,
          id: Date.now().toString() + Math.random(),
          name: item.name,
          parentId: targetFolderId,
          modified: new Date(),
          created: new Date()
        };

        this.files[newItem.id] = newItem;

        const parent = this.files[targetFolderId];
        if (parent && parent.children) {
          parent.children.push(newItem.id);
          parent.modified = new Date();
        }
      }
    }

    // Clear clipboard after cut operation
    if (this.clipboard.operation === 'cut') {
      this.clipboard = undefined;
    }

    this.notify();
    return true;
  }

  public search(query: string): FileItem[] {
    const results: FileItem[] = [];
    const lowerQuery = query.toLowerCase();

    for (const file of Object.values(this.files)) {
      if (file.name.toLowerCase().includes(lowerQuery)) {
        results.push(file);
      }
    }

    return results;
  }

  public getFileInfo(itemId: string): FileItem | undefined {
    return this.files[itemId];
  }

  public getState(): FileSystemState {
    return {
      files: { ...this.files },
      currentPath: [...this.currentPath],
      clipboard: this.clipboard ? { ...this.clipboard } : undefined
    };
  }
}

// Singleton instance
export const fileSystem = new FileSystemManager();
