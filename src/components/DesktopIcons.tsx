import React, { useState, useEffect } from 'react';
import { fileSystem } from '../utils/FileSystem';
import { FileItem } from '../utils/FileSystem';
import { Folder, Image, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const DesktopIcons: React.FC = () => {
    const [items, setItems] = useState<FileItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const updateItems = () => {
            // Manually getting desktop folder contents for now since we don't have a direct 'getFolder' method exposed publicly easily
            // But we can check internal state via getFileInfo but getting children is harder without exposed method.
            // Wait, fileSystem.files is private. 
            // I can use getCurrentDirectory() if I trick it? No.
            // I should add a getFolderContents method to FileSystem?
            // Or I can just access the state since I know 'desktop' is a folder.

            // Let's use the public getState to access "files" but wait, getState copies everything. that's fine for now.
            const state = fileSystem.getState();
            const desktop = state.files['desktop'];
            if (desktop && desktop.children) {
                const desktopItems = desktop.children.map(id => state.files[id]).filter(Boolean);
                setItems(desktopItems);
            }
        };

        updateItems();
        const unsubscribe = fileSystem.subscribe(updateItems);
        return () => unsubscribe();
    }, []);

    const getIcon = (item: FileItem) => {
        if (item.type === 'folder') return <Folder size={48} fill="#00C7FC" color="#00C7FC" fillOpacity={0.2} />;
        if (item.name.endsWith('.png') || item.name.endsWith('.jpg')) return <Image size={48} color="#FF9800" />;
        return <FileText size={48} color="#fff" />;
    };

    return (
        <div
            className="desktop-icons-container"
            onClick={() => setSelectedId(null)}
            style={{
                position: 'absolute',
                top: '32px', // Below MenuBar
                right: '0',
                bottom: '0',
                left: '0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                alignContent: 'flex-end', // Align to right side like macOS
                pointerEvents: 'none', // Allow clicking through to select background? No, we want to click icons.
                zIndex: 0
            }}
        >
            <style>{`
        .desktop-icon {
          width: 80px;
          height: 90px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          margin-left: 10px;
          cursor: pointer;
          pointer-events: auto;
          border-radius: 4px;
          transition: background 0.1s;
        }
        
        .desktop-icon:hover {
           background: rgba(255,255,255,0.1);
        }
        
        .desktop-icon.selected {
           background: rgba(255,255,255,0.2);
           border: 1px solid rgba(255,255,255,0.3);
        }

        .icon-label {
          margin-top: 4px;
          font-size: 12px;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.8);
          text-align: center;
          word-break: break-word;
          line-height: 1.2;
          padding: 2px 4px;
          border-radius: 4px;
        }
        
        .desktop-icon.selected .icon-label {
          background: #0060FA;
        }
      `}</style>

            {items.map((item, index) => (
                <motion.div
                    key={item.id}
                    className={`desktop-icon ${selectedId === item.id ? 'selected' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(item.id);
                    }}
                    onDoubleClick={() => alert(`Opening ${item.name}`)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    drag
                    dragMomentum={false}
                >
                    {getIcon(item)}
                    <span className="icon-label">{item.name}</span>
                </motion.div>
            ))}
        </div>
    );
};
