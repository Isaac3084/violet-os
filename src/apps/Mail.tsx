import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Reply, 
  ReplyAll, 
  Forward, 
  Trash2, 
  Archive,
  Star,
  Paperclip,
  Send,
  Bold,
  Italic,
  Underline,
  Link,
  Image as ImageIcon
} from 'lucide-react';

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  preview: string;
  content: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam';
}

export const Mail: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      from: 'John Doe',
      fromEmail: 'john.doe@example.com',
      to: 'me@example.com',
      subject: 'Meeting Tomorrow',
      preview: 'Hi, just wanted to confirm our meeting tomorrow at 2 PM...',
      content: `<p>Hi,</p><p>Just wanted to confirm our meeting tomorrow at 2 PM. We'll be discussing the Q1 roadmap and budget allocations.</p><p>Please bring your project proposals and any questions you might have.</p><p>Best regards,<br/>John</p>`,
      date: new Date(Date.now() - 3600000),
      isRead: false,
      isStarred: true,
      hasAttachment: true,
      folder: 'inbox'
    },
    {
      id: '2',
      from: 'Sarah Johnson',
      fromEmail: 'sarah.j@example.com',
      to: 'me@example.com',
      subject: 'Project Update',
      preview: 'The latest version of the design mockups are ready for review...',
      content: `<p>Hi team,</p><p>The latest version of the design mockups are ready for review. I've incorporated all the feedback from our last meeting.</p><p>Key changes:</p><ul><li>Updated color scheme to match brand guidelines</li><li>Improved navigation flow</li><li>Added mobile responsive layouts</li></ul><p>Please review and let me know if you have any questions.</p><p>Thanks,<br/>Sarah</p>`,
      date: new Date(Date.now() - 7200000),
      isRead: true,
      isStarred: false,
      hasAttachment: true,
      folder: 'inbox'
    },
    {
      id: '3',
      from: 'GitHub',
      fromEmail: 'noreply@github.com',
      to: 'me@example.com',
      subject: '[GitHub] Security alert',
      preview: 'We detected a sign-in to your account from a new device...',
      content: `<p>Hi there,</p><p>We detected a sign-in to your GitHub account from a new device.</p><p><strong>Device:</strong> Chrome on macOS<br/><strong>Location:</strong> San Francisco, CA<br/><strong>Time:</strong> January 11, 2026 at 10:30 AM</p><p>If this was you, you can safely ignore this email. If you didn't sign in, please <a href="#">reset your password</a> immediately.</p><p>Thanks,<br/>The GitHub Security Team</p>`,
      date: new Date(Date.now() - 86400000),
      isRead: false,
      isStarred: false,
      hasAttachment: false,
      folder: 'inbox'
    }
  ]);

  const [selectedEmailId, setSelectedEmailId] = useState<string>('1');
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: ''
  });

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: '📥', count: emails.filter(e => e.folder === 'inbox' && !e.isRead).length },
    { id: 'sent', name: 'Sent', icon: '📤', count: 0 },
    { id: 'drafts', name: 'Drafts', icon: '📝', count: 0 },
    { id: 'starred', name: 'Starred', icon: '⭐', count: emails.filter(e => e.isStarred).length },
    { id: 'trash', name: 'Trash', icon: '🗑️', count: 0 }
  ];

  const selectedEmail = emails.find(email => email.id === selectedEmailId);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFolder === 'starred') {
      return matchesSearch && email.isStarred;
    }
    return matchesSearch && email.folder === selectedFolder;
  });

  const markAsRead = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    ));
  };

  const toggleStar = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const deleteEmail = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, folder: 'trash' } : email
    ));
    if (selectedEmailId === emailId) {
      const remainingEmails = filteredEmails.filter(e => e.id !== emailId);
      setSelectedEmailId(remainingEmails[0]?.id || '');
    }
  };

  const sendEmail = () => {
    const newEmail: Email = {
      id: Date.now().toString(),
      from: 'Me',
      fromEmail: 'me@example.com',
      to: composeData.to,
      subject: composeData.subject,
      preview: composeData.content.substring(0, 100),
      content: `<p>${composeData.content}</p>`,
      date: new Date(),
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      folder: 'sent'
    };
    
    setEmails(prev => [newEmail, ...prev]);
    setIsComposing(false);
    setComposeData({ to: '', subject: '', content: '' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .mail-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #f5f5f7;
        }

        .mail-toolbar {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mail-search {
          flex: 1;
          max-width: 400px;
          padding: 8px 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .mail-actions {
          display: flex;
          gap: 8px;
        }

        .mail-button {
          padding: 6px 12px;
          border: none;
          background: rgba(0, 122, 255, 0.8);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .mail-button:hover {
          background: rgba(0, 122, 255, 1);
        }

        .mail-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .mail-sidebar {
          width: 200px;
          background: rgba(255, 255, 255, 0.6);
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          padding: 12px 0;
        }

        .mail-folder {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          transition: background-color 0.2s ease;
          position: relative;
        }

        .mail-folder:hover {
          background: rgba(0, 122, 255, 0.1);
        }

        .mail-folder.active {
          background: rgba(0, 122, 255, 0.2);
          color: #007AFF;
        }

        .mail-folder-icon {
          margin-right: 8px;
          font-size: 16px;
        }

        .mail-folder-count {
          margin-left: auto;
          background: #007AFF;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .mail-list {
          width: 350px;
          background: white;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          overflow-y: auto;
        }

        .mail-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: background-color 0.2s ease;
          position: relative;
        }

        .mail-item:hover {
          background: rgba(0, 122, 255, 0.05);
        }

        .mail-item.active {
          background: rgba(0, 122, 255, 0.1);
        }

        .mail-item.unread {
          background: rgba(0, 122, 255, 0.02);
          font-weight: 600;
        }

        .mail-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .mail-item-from {
          font-size: 14px;
          color: #333;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mail-item-date {
          font-size: 12px;
          color: #666;
        }

        .mail-item-subject {
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mail-item-preview {
          font-size: 13px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mail-item-icons {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
        }

        .mail-item-icon {
          width: 16px;
          height: 16px;
          color: #666;
        }

        .mail-reader {
          flex: 1;
          background: white;
          display: flex;
          flex-direction: column;
        }

        .mail-reader-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .mail-reader-subject {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .mail-reader-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mail-reader-from {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mail-reader-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .mail-reader-info {
          display: flex;
          flex-direction: column;
        }

        .mail-reader-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .mail-reader-email {
          font-size: 12px;
          color: #666;
        }

        .mail-reader-actions {
          display: flex;
          gap: 8px;
        }

        .mail-reader-button {
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #333;
        }

        .mail-reader-button:hover {
          background: rgba(0, 122, 255, 0.1);
        }

        .mail-reader-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          font-size: 15px;
          line-height: 1.6;
          color: #333;
        }

        .mail-compose {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 500px;
          max-height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .mail-compose-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mail-compose-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .mail-compose-close {
          width: 24px;
          height: 24px;
          border: none;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mail-compose-body {
          flex: 1;
          padding: 16px 20px;
        }

        .mail-compose-field {
          width: 100%;
          padding: 8px 0;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          font-size: 14px;
          margin-bottom: 12px;
          outline: none;
        }

        .mail-compose-content {
          width: 100%;
          min-height: 200px;
          border: none;
          resize: none;
          font-size: 14px;
          line-height: 1.5;
          outline: none;
        }

        .mail-compose-toolbar {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .mail-compose-tool {
          width: 28px;
          height: 28px;
          border: none;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .mail-compose-tool:hover {
          background: rgba(0, 122, 255, 0.1);
        }

        .mail-compose-actions {
          padding: 16px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
        }

        .mail-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .mail-empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .mail-empty-text {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .mail-empty-subtext {
          font-size: 14px;
          color: #999;
        }
      `}</style>

      <div className="mail-toolbar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            type="text"
            className="mail-search"
            placeholder="Search mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        
        <div className="mail-actions">
          <button className="mail-button" onClick={() => setIsComposing(true)}>
            <Plus size={16} />
            Compose
          </button>
        </div>
      </div>

      <div className="mail-content">
        <div className="mail-sidebar">
          {folders.map(folder => (
            <div
              key={folder.id}
              className={`mail-folder ${selectedFolder === folder.id ? 'active' : ''}`}
              onClick={() => setSelectedFolder(folder.id)}
            >
              <span className="mail-folder-icon">{folder.icon}</span>
              <span>{folder.name}</span>
              {folder.count > 0 && (
                <span className="mail-folder-count">{folder.count}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mail-list">
          {filteredEmails.map(email => (
            <div
              key={email.id}
              className={`mail-item ${email.id === selectedEmailId ? 'active' : ''} ${!email.isRead ? 'unread' : ''}`}
              onClick={() => {
                setSelectedEmailId(email.id);
                markAsRead(email.id);
              }}
            >
              <div className="mail-item-header">
                <div className="mail-item-from">{email.from}</div>
                <div className="mail-item-date">{formatDate(email.date)}</div>
              </div>
              <div className="mail-item-subject">{email.subject}</div>
              <div className="mail-item-preview">
                {email.preview}
                <div className="mail-item-icons">
                  {email.isStarred && <Star className="mail-item-icon" size={14} fill="#FFD700" />}
                  {email.hasAttachment && <Paperclip className="mail-item-icon" size={14} />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mail-reader">
          {selectedEmail ? (
            <>
              <div className="mail-reader-header">
                <div className="mail-reader-subject">{selectedEmail.subject}</div>
                <div className="mail-reader-meta">
                  <div className="mail-reader-from">
                    <div className="mail-reader-avatar">
                      {selectedEmail.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="mail-reader-info">
                      <div className="mail-reader-name">{selectedEmail.from}</div>
                      <div className="mail-reader-email">{selectedEmail.fromEmail}</div>
                    </div>
                  </div>
                  <div className="mail-reader-actions">
                    <button 
                      className="mail-reader-button"
                      onClick={() => toggleStar(selectedEmail.id)}
                    >
                      <Star size={16} fill={selectedEmail.isStarred ? '#FFD700' : 'none'} />
                    </button>
                    <button className="mail-reader-button">
                      <Reply size={16} />
                    </button>
                    <button className="mail-reader-button">
                      <Forward size={16} />
                    </button>
                    <button 
                      className="mail-reader-button"
                      onClick={() => deleteEmail(selectedEmail.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div 
                className="mail-reader-content"
                dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
              />
            </>
          ) : (
            <div className="mail-empty">
              <div className="mail-empty-icon">📧</div>
              <div className="mail-empty-text">No Email Selected</div>
              <div className="mail-empty-subtext">Select an email to read</div>
            </div>
          )}
        </div>
      </div>

      {isComposing && (
        <div className="mail-compose">
          <div className="mail-compose-header">
            <div className="mail-compose-title">New Message</div>
            <button 
              className="mail-compose-close"
              onClick={() => setIsComposing(false)}
            >
              ×
            </button>
          </div>
          
          <div className="mail-compose-body">
            <input
              type="email"
              className="mail-compose-field"
              placeholder="To"
              value={composeData.to}
              onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
            />
            <input
              type="text"
              className="mail-compose-field"
              placeholder="Subject"
              value={composeData.subject}
              onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
            />
            
            <div className="mail-compose-toolbar">
              <button className="mail-compose-tool">
                <Bold size={14} />
              </button>
              <button className="mail-compose-tool">
                <Italic size={14} />
              </button>
              <button className="mail-compose-tool">
                <Underline size={14} />
              </button>
              <button className="mail-compose-tool">
                <Link size={14} />
              </button>
              <button className="mail-compose-tool">
                <ImageIcon size={14} />
              </button>
              <button className="mail-compose-tool">
                <Paperclip size={14} />
              </button>
            </div>
            
            <textarea
              className="mail-compose-content"
              placeholder="Compose email..."
              value={composeData.content}
              onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>
          
          <div className="mail-compose-actions">
            <button className="mail-button" style={{ background: 'rgba(0,0,0,0.1)', color: '#666' }}>
              Save Draft
            </button>
            <button className="mail-button" onClick={sendEmail}>
              <Send size={16} />
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
