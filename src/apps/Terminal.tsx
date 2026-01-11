import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Minus, X, Plus, Terminal as TerminalIcon, Cpu, Github, Activity, Settings, ChevronRight } from 'lucide-react';
import { fileSystem, FileItem } from '../utils/FileSystem';

// --- Types & Interfaces ---

interface TerminalTheme {
  name: string;
  background: string;
  foreground: string;
  selection: string;
  cursor: string;
  prompt: string;
  error: string;
  success: string;
  info: string;
  warning: string;
}

interface TerminalCommand {
  id: string;
  command: string;
  output: React.ReactNode; // Allow rich content
  timestamp: Date;
  hidden?: boolean; // For internal commands or processing
}

interface TerminalSession {
  id: string;
  name: string;
  commands: TerminalCommand[];
  currentPath: string[];
  history: string[];
  historyIndex: number;
  isProcessing: boolean; // For long-running tasks
  processName?: string;
}

// --- Themes ---

const THEMES: Record<string, TerminalTheme> = {
  default: {
    name: 'Pro',
    background: '#1e1e1e', // VS Code-like dark
    foreground: '#d4d4d4',
    selection: 'rgba(255, 255, 255, 0.2)',
    cursor: '#528bff',
    prompt: '#3b8eea',
    error: '#f48771',
    success: '#89d185',
    info: '#569cd6',
    warning: '#cca700',
  },
  dracula: {
    name: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    selection: '#44475a',
    cursor: '#f8f8f2',
    prompt: '#bd93f9',
    error: '#ff5555',
    success: '#50fa7b',
    info: '#8be9fd',
    warning: '#ffb86c',
  },
  matrix: {
    name: 'Matrix',
    background: '#0d0208',
    foreground: '#00ff41',
    selection: '#003b00',
    cursor: '#008f11',
    prompt: '#008f11',
    error: '#ff0000',
    success: '#00ff41',
    info: '#003b00',
    warning: '#00ff41',
  },
  oceanic: {
    name: 'Oceanic',
    background: '#0f172a',
    foreground: '#e2e8f0',
    selection: '#1e293b',
    cursor: '#38bdf8',
    prompt: '#0ea5e9',
    error: '#ef4444',
    success: '#10b981',
    info: '#64748b',
    warning: '#f59e0b',
  }
};

// --- Helper Components ---

const ProgressBar: React.FC<{ percent: number; color?: string }> = ({ percent, color = '#3b8eea' }) => (
  <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', marginTop: '4px', marginBottom: '4px' }}>
    <div style={{ width: `${Math.min(100, Math.max(0, percent))}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.1s linear' }} />
  </div>
);

const MatrixEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = 400;

    const chars = '0123456789ABCDEF';
    const drops: number[] = [];
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    for (let i = 0; i < columns; i++) drops[i] = 1;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Fade effect

      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '400px', display: 'block' }} />;
};

const TopProcessTable: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const generateData = () => {
      const processes = [
        { name: 'kernel_task', user: 'root', cpu: 0, mem: 0 },
        { name: 'WindowServer', user: '_windowserver', cpu: 0, mem: 0 },
        { name: 'Google Chrome', user: 'user', cpu: 0, mem: 0 },
        { name: 'Terminal', user: 'user', cpu: 0, mem: 0 },
        { name: 'Code Helper', user: 'user', cpu: 0, mem: 0 },
        { name: 'node', user: 'user', cpu: 0, mem: 0 },
        { name: 'Activity Monitor', user: 'user', cpu: 0, mem: 0 },
      ];

      return processes.map(p => ({
        ...p,
        pid: Math.floor(Math.random() * 90000) + 1000,
        cpu: (Math.random() * 15).toFixed(1),
        mem: (Math.random() * 500 + 50).toFixed(1),
        state: Math.random() > 0.9 ? 'S' : 'R',
        time: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}.${Math.floor(Math.random() * 99)}`
      })).sort((a, b) => parseFloat(b.cpu) - parseFloat(a.cpu));
    };

    setData(generateData());
    const interval = setInterval(() => setData(generateData()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
      <div style={{ borderBottom: '1px solid #444', marginBottom: '4px', paddingBottom: '4px' }}>
        <span style={{ display: 'inline-block', width: '60px' }}>PID</span>
        <span style={{ display: 'inline-block', width: '150px' }}>COMMAND</span>
        <span style={{ display: 'inline-block', width: '60px' }}>%CPU</span>
        <span style={{ display: 'inline-block', width: '80px' }}>TIME</span>
        <span style={{ display: 'inline-block', width: '60px' }}>#TH</span>
        <span style={{ display: 'inline-block', width: '60px' }}>#WQ</span>
        <span style={{ display: 'inline-block', width: '60px' }}>#PORT</span>
        <span style={{ display: 'inline-block', width: '80px' }}>MEM</span>
        <span style={{ display: 'inline-block', width: '60px' }}>PURG</span>
        <span style={{ display: 'inline-block', width: '60px' }}>CMPRS</span>
        <span style={{ display: 'inline-block', width: '60px' }}>PGRP</span>
        <span style={{ display: 'inline-block', width: '60px' }}>PPID</span>
        <span style={{ display: 'inline-block', width: '60px' }}>STATE</span>
        <span style={{ display: 'inline-block', width: '60px' }}>BOOSTS</span>
        <span style={{ display: 'inline-block', width: '80px' }}>%CPU_ME</span>
      </div>
      {data.map(p => (
        <div key={p.pid}>
          <span style={{ display: 'inline-block', width: '60px', color: '#569cd6' }}>{p.pid}</span>
          <span style={{ display: 'inline-block', width: '150px', fontWeight: 'bold' }}>{p.name}</span>
          <span style={{ display: 'inline-block', width: '60px' }}>{p.cpu}</span>
          <span style={{ display: 'inline-block', width: '80px' }}>{p.time}</span>
          <span style={{ display: 'inline-block', width: '60px' }}>{Math.floor(Math.random() * 20) + 1}</span>
          <span style={{ display: 'inline-block', width: '60px' }}>{Math.floor(Math.random() * 5)}</span>
          <span style={{ display: 'inline-block', width: '60px' }}>{Math.floor(Math.random() * 200)}</span>
          <span style={{ display: 'inline-block', width: '80px' }}>{p.mem}M</span>
          <span style={{ display: 'inline-block', width: '60px' }}>0B</span>
          <span style={{ display: 'inline-block', width: '60px' }}>0B</span>
          <span style={{ display: 'inline-block', width: '60px' }}>{p.pid}</span>
          <span style={{ display: 'inline-block', width: '60px' }}>1</span>
          <span style={{ display: 'inline-block', width: '60px' }}>{p.state}</span>
          <span style={{ display: 'inline-block', width: '60px' }}>0</span>
          <span style={{ display: 'inline-block', width: '80px' }}>0.0</span>
        </div>
      ))}
      <div style={{ marginTop: '8px', color: '#888' }}>Pres Ctrl+C to exit</div>
    </div>
  );
};


// --- Main Component ---

export const Terminal: React.FC = () => {
  const [sessions, setSessions] = useState<TerminalSession[]>([
    {
      id: '1',
      name: 'zsh',
      commands: [{
        id: 'init',
        command: 'welcome',
        output: <div className="welcome-message">
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>macOS 26 Terminal</div>
          <div style={{ opacity: 0.8 }}>Type 'help' to see available commands. Try 'brew', 'matrix', or 'top'.</div>
        </div>,
        timestamp: new Date()
      }],
      currentPath: fileSystem.getCurrentPath(),
      history: [],
      historyIndex: -1,
      isProcessing: false
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [inputValue, setInputValue] = useState('');

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const theme = THEMES[currentTheme];

  // --- Auto-scroll ---
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activeSession.commands, activeSession.isProcessing]);

  // --- Focus Input on Click/Mount ---
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSessionId]);

  // --- Subcomponents ---

  const createNewTab = () => {
    const newId = Date.now().toString();
    setSessions(prev => [...prev, {
      id: newId,
      name: 'zsh',
      commands: [],
      currentPath: fileSystem.getCurrentPath(),
      history: [],
      historyIndex: -1,
      isProcessing: false
    }]);
    setActiveSessionId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (sessions.length === 1) return; // Don't close last tab

    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) {
      setActiveSessionId(newSessions[newSessions.length - 1].id);
    }
  };

  const updateSession = (id: string, updates: Partial<TerminalSession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addCommandToSession = (sessionId: string, cmd: string, output: React.ReactNode) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          commands: [...s.commands, {
            id: Date.now().toString(),
            command: cmd,
            output,
            timestamp: new Date()
          }],
          history: cmd.trim() ? [...s.history, cmd] : s.history,
          historyIndex: -1
        };
      }
      return s;
    }));
  };

  // --- Command Execution Logic ---

  const executeCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) {
      addCommandToSession(activeSessionId, '', null);
      return;
    }

    // --- Explanation Layer ---
    if (cmd.toLowerCase().startsWith('what is ') && cmd.endsWith('?')) {
      const query = cmd.substring(8, cmd.length - 1).trim().toLowerCase();

      const EXPLANATIONS: Record<string, { desc: string, example: string }> = {
        ls: { desc: "Lists all files and directories in the current location.", example: "ls" },
        dir: { desc: "Lists all files and directories (Windows alias for ls).", example: "dir" },
        cd: { desc: "Changes the current directory.", example: "cd Documents" },
        mkdir: { desc: "Creates a new directory (folder).", example: "mkdir NewFolder" },
        md: { desc: "Creates a new directory (Windows alias for mkdir).", example: "md NewFolder" },
        touch: { desc: "Creates a new empty file or updates the timestamp of an existing file.", example: "touch myfile.txt" },
        rm: { desc: "Removes (deletes) files or directories.", example: "rm myfile.txt" },
        del: { desc: "Removes files (Windows alias for rm).", example: "del myfile.txt" },
        cat: { desc: "Displays the contents of a file.", example: "cat README.txt" },
        type: { desc: "Displays the contents of a file (Windows alias for cat).", example: "type README.txt" },
        cp: { desc: "Copies files or directories (Mock).", example: "cp source.txt dest.txt" },
        copy: { desc: "Copies files (Windows alias for cp).", example: "copy source.txt dest.txt" },
        mv: { desc: "Moves or renames files or directories (Mock).", example: "mv oldname.txt newname.txt" },
        move: { desc: "Moves files (Windows alias for mv).", example: "move oldname.txt newname.txt" },
        whoami: { desc: "Displays the current username.", example: "whoami" },
        date: { desc: "Displays the current system date and time.", example: "date" },
        hostname: { desc: "Displays the network name of the computer.", example: "hostname" },
        neofetch: { desc: "Displays system information with an aesthetic ASCII logo.", example: "neofetch" },
        chkdisk: { desc: "Displays system info (Alias for neofetch in this sim).", example: "chkdisk" },
        ping: { desc: "Checks connectivity to a network host.", example: "ping google.com" },
        ifconfig: { desc: "Displays network interface configuration.", example: "ifconfig" },
        ipconfig: { desc: "Displays network interface configuration (Windows alias).", example: "ipconfig" },
        top: { desc: "Displays active processes and system resource usage.", example: "top" },
        brew: { desc: "The missing package manager for macOS (Simulated).", example: "brew install node" },
        git: { desc: "Version control system (Simulated).", example: "git status" },
        python: { desc: "Starts a Python interactive shell.", example: "python" },
        matrix: { desc: "Displays a digital rain effect.", example: "matrix" },
        theme: { desc: "Changes the current terminal color theme.", example: "theme dracula" },
        clear: { desc: "Clears the terminal screen.", example: "clear" },
        cls: { desc: "Clears the terminal screen (Windows alias).", example: "cls" },
        exit: { desc: "Closes the current terminal session tab.", example: "exit" },
        help: { desc: "Shows a list of available commands.", example: "help" },
        pwd: { desc: "Prints the current working directory path.", example: "pwd" },
        echo: { desc: "Display a line of text or string to the terminal.", example: "echo Hello World" },
        python3: { desc: "Starts a Python 3 interactive shell.", example: "python3" },
        rd: { desc: "Removes a directory (Windows alias for rm).", example: "rd MyFolder" },
        ren: { desc: "Renames a file or directory (Windows alias for mv).", example: "ren old.txt new.txt" },
        open: { desc: "Opens a file or URL in the default application (Mock).", example: "open https://google.com" }
      };

      const explanation = EXPLANATIONS[query];

      let outputNode;
      if (explanation) {
        outputNode = (
          <div style={{ marginLeft: '12px', paddingLeft: '12px', borderLeft: `2px solid ${theme.info}` }}>
            <div style={{ fontWeight: 'bold', color: theme.info, marginBottom: '4px' }}>{explanation.desc}</div>
            <div style={{ opacity: 0.8 }}>
              <span style={{ marginRight: '8px', opacity: 0.5 }}>Example:</span>
              <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{explanation.example}</span>
            </div>
          </div>
        );
      } else {
        outputNode = <span style={{ color: theme.warning }}>I don't have an explanation for '{query}'. Try 'help' to see available commands.</span>;
      }

      addCommandToSession(activeSessionId, rawCmd, outputNode);
      setInputValue('');
      return;
    }


    // Handle alias mapping
    const ALIASES: Record<string, string> = {
      'md': 'mkdir',
      'rd': 'rm',
      'del': 'rm',
      'dir': 'ls',
      'cls': 'clear',
      'type': 'cat',
      'copy': 'cp',
      'move': 'mv',
      'ren': 'mv',
      'chkdisk': 'neofetch',
      'ipconfig': 'ifconfig'
    };

    const args = cmd.split(' ');
    const mainCommand = ALIASES[args[0].toLowerCase()] || args[0].toLowerCase();
    const sessionId = activeSessionId;

    // Handle immediate processing commands
    switch (mainCommand) {
      case 'clear':
        updateSession(sessionId, { commands: [] });
        return;

      case 'exit':
        if (sessions.length > 1) {
          const fakeEvent = { stopPropagation: () => { } } as React.MouseEvent;
          closeTab(fakeEvent, sessionId);
        } else {
          window.location.reload(); // Simple reload for "exit" on last tab
        }
        return;
    }

    // Set processing state (simulates async work)
    updateSession(sessionId, { isProcessing: true });

    let output: React.ReactNode = null;

    try {
      switch (mainCommand) {
        case 'help':
          output = (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', maxWidth: '600px' }}>
              <div style={{ gridColumn: '1 / -1', marginBottom: '8px', opacity: 0.8 }}>
                Verified commands for macOS, Linux, and Windows:
              </div>
              <strong style={{ color: theme.info }}>File Ops</strong> <span>ls (dir), cd, mkdir (md), touch, rm (del), cat (type), cp, mv</span>
              <strong style={{ color: theme.info }}>System</strong> <span>whoami, date, hostname, neofetch (chkdisk)</span>
              <strong style={{ color: theme.info }}>Network</strong> <span>ping, ifconfig (ipconfig)</span>
              <strong style={{ color: theme.info }}>Advanced</strong> <span>top, brew, git, python, matrix</span>
              <strong style={{ color: theme.info }}>Visual</strong> <span>theme &lt;name&gt;, open</span>
            </div>
          );
          break;

        case 'theme':
          const themeName = args[1]?.toLowerCase();
          if (THEMES[themeName]) {
            setCurrentTheme(themeName);
            output = <span style={{ color: theme.success }}>Theme changed to {THEMES[themeName].name}</span>;
          } else {
            output = (
              <div>
                <div>Available themes:</div>
                {Object.keys(THEMES).map(t => <div key={t}>- {t}</div>)}
              </div>
            );
          }
          break;

        case 'open':
          if (args[1]) {
            if (args[1].startsWith('http')) {
              window.open(args[1], '_blank');
              output = <span style={{ color: theme.success }}>Opened {args[1]} in new tab.</span>;
            } else {
              output = <span style={{ color: theme.warning }}>File opening mocked: {args[1]}</span>;
            }
          } else {
            output = <span style={{ color: theme.error }}>open: missing argument</span>;
          }
          break;

        case 'ls':
          // Support 'dir' style list or 'ls'
          const files = fileSystem.getCurrentDirectory();
          if (files.length === 0) {
            output = <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Empty directory</span>;
          } else {
            output = (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {files.map(f => (
                  <div key={f.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
                    <span style={{
                      color: f.type === 'folder' ? theme.info : theme.foreground,
                      fontWeight: f.type === 'folder' ? 'bold' : 'normal',
                      fontSize: '32px'
                    }}>
                      {f.type === 'folder' ? '📁' : '📄'}
                    </span>
                    <span style={{
                      color: f.type === 'folder' ? theme.info : theme.foreground,
                      fontWeight: f.type === 'folder' ? 'bold' : 'normal',
                      marginTop: '4px',
                      wordBreak: 'break-word',
                      fontSize: '12px'
                    }}>
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            );
          }
          break;

        case 'pwd':
          output = `/${activeSession.currentPath.map(id => fileSystem.getFileInfo(id)?.name || id).join('/')}`;
          break;

        case 'cd':
          const targetPath = args[1];
          if (!targetPath || targetPath === '~') {
            while (fileSystem.navigateUp()) { };
          } else if (targetPath === '..') {
            fileSystem.navigateUp();
          } else {
            // Find item in current directory
            const currentDir = fileSystem.getCurrentDirectory();
            const item = currentDir.find(f => f.name.toLowerCase() === targetPath.toLowerCase());

            if (item && item.type === 'folder') {
              fileSystem.navigateToFolder(item.id);
            } else {
              output = <span style={{ color: theme.error }}>cd: no such directory: {targetPath}</span>;
            }
          }
          // Update session path
          updateSession(sessionId, { currentPath: fileSystem.getCurrentPath() });
          break;

        case 'mkdir':
          if (!args[1]) {
            output = <span style={{ color: theme.error }}>mkdir: missing operand</span>;
          } else {
            const success = fileSystem.createFolder(args[1]);
            if (success) {
              output = <span style={{ color: theme.success }}>Directory '{args[1]}' created.</span>;
            } else {
              output = <span style={{ color: theme.error }}>mkdir: cannot create directory '{args[1]}': File exists</span>;
            }
          }
          break;

        case 'touch':
          if (!args[1]) {
            output = <span style={{ color: theme.error }}>touch: missing operand</span>;
          } else {
            // Basic touch: create empty file if not exists
            const currentDir = fileSystem.getCurrentDirectory();
            const existing = currentDir.find(f => f.name === args[1]);
            if (existing) {
              // Update modified time (mocked by just re-saving or ignoring in this simplified version)
              output = null;
            } else {
              const success = fileSystem.createFile(args[1], '');
              if (!success) output = <span style={{ color: theme.error }}>touch: failed to create file</span>;
            }
          }
          break;

        case 'echo':
          const echoText = args.slice(1).join(' ');
          output = echoText;
          break;

        case 'rm':
          if (!args[1]) {
            output = <span style={{ color: theme.error }}>rm: missing operand</span>;
          } else {
            const currentDir = fileSystem.getCurrentDirectory();
            const item = currentDir.find(f => f.name === args[1]);
            if (item) {
              fileSystem.deleteItem(item.id);
              output = <span style={{ color: theme.success }}>Removed '{args[1]}'</span>;
            } else {
              output = <span style={{ color: theme.error }}>rm: cannot remove '{args[1]}': No such file or directory</span>;
            }
          }
          break;

        case 'cat':
          if (!args[1]) {
            output = <span style={{ color: theme.error }}>cat: missing operand</span>;
          } else {
            const currentDir = fileSystem.getCurrentDirectory();
            const item = currentDir.find(f => f.name === args[1]);
            if (item) {
              if (item.type === 'folder') {
                output = <span style={{ color: theme.error }}>cat: {args[1]}: Is a directory</span>;
              } else {
                output = <div style={{ whiteSpace: 'pre-wrap' }}>{item.content || ''}</div>;
              }
            } else {
              output = <span style={{ color: theme.error }}>cat: {args[1]}: No such file or directory</span>;
            }
          }
          break;

        case 'date':
          output = new Date().toString();
          break;

        case 'whoami':
          output = 'user';
          break;

        case 'hostname':
          output = 'macOS-26';
          break;

        case 'top':
          updateSession(sessionId, { isProcessing: true, processName: 'top' });
          output = <TopProcessTable />;
          break;

        case 'ifconfig':
          output = (
            <div style={{ fontFamily: 'monospace' }}>
              <div>lo0: flags=8049&lt;UP,LOOPBACK,RUNNING,MULTICAST&gt; mtu 16384</div>
              <div style={{ marginLeft: 20 }}>inet 127.0.0.1 netmask 0xff000000 </div>
              <div>en0: flags=8863&lt;UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST&gt; mtu 1500</div>
              <div style={{ marginLeft: 20 }}>ether f0:18:98:eb:8c:12 </div>
              <div style={{ marginLeft: 20 }}>inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255</div>
              <div style={{ marginLeft: 20 }}>status: active</div>
            </div>
          );
          break;

        case 'ping':
          if (!args[1]) {
            output = <span style={{ color: theme.error }}>usage: ping host</span>;
          } else {
            output = (
              <div>
                <div>PING {args[1]} (93.184.216.34): 56 data bytes</div>
                <div>64 bytes from {args[1]}: icmp_seq=0 ttl=56 time=14.123 ms</div>
                <div>64 bytes from {args[1]}: icmp_seq=1 ttl=56 time=15.456 ms</div>
                <div>64 bytes from {args[1]}: icmp_seq=2 ttl=56 time=13.789 ms</div>
                <div>64 bytes from {args[1]}: icmp_seq=3 ttl=56 time=14.001 ms</div>
                <div>--- {args[1]} ping statistics ---</div>
                <div>4 packets transmitted, 4 packets received, 0.0% packet loss</div>
              </div>
            );
          }
          break;

        case 'matrix':
          output = <MatrixEffect />;
          break;

        case 'brew':
          if (args[1] === 'install') {
            const pkg = args[2];
            if (!pkg) {
              output = <span style={{ color: theme.error }}>brew: missing package name</span>;
            } else {
              // Simulate install
              output = (
                <div className="brew-install">
                  <div><span style={{ color: theme.success }}>{'==>'}</span> Downloading https://ghcr.io/v2/homebrew/core/{pkg}/manifests/latest...</div>
                  <ProgressBar percent={45} />
                  <div><span style={{ color: theme.success }}>{'==>'}</span> Pouring {pkg}-1.0.0.arm64_sonoma.bottle.tar.gz</div>
                  <ProgressBar percent={78} />
                  <div>🍺  /opt/homebrew/Cellar/{pkg}/1.0.0: 12 files, 4.2MB</div>
                </div>
              );
            }
          } else {
            output = `Example usage: brew install <package>`;
          }
          break;

        case 'git':
          if (args[1] === 'status') {
            output = (
              <div>
                <div>On branch main</div>
                <div>Your branch is up to date with 'origin/main'.</div>
                <br />
                <div>nothing to commit, working tree clean</div>
              </div>
            );
          } else {
            output = "git: git command not fully implemented in simulation.";
          }
          break;

        case 'python':
        case 'python3':
          output = (
            <div>
              <div>Python 3.12.1 (main, Jan 12 2026, 09:12:33) [Clang 15.0.0 (clang-1500.1.0.2.5)] on darwin</div>
              <div>Type "help", "copyright", "credits" or "license" for more information.</div>
              <div style={{ marginTop: '4px', color: '#888' }}>(REPL simulation not active in this demo)</div>
            </div>
          );
          break;

        case 'neofetch':
          output = (
            <div style={{ display: 'flex', gap: '20px', fontFamily: 'monospace' }}>
              <div style={{ color: theme.error }}>
                {`       _____
      /     \\
     /  O O  \\
    |    >    |
      \\__+__/
`}
              </div>
              <div>
                <div style={{ color: theme.prompt }}>user@macOS-26</div>
                <div>-------------</div>
                <div><strong style={{ color: theme.info }}>OS</strong>: macOS 26.0.0 (Web)</div>
                <div><strong style={{ color: theme.info }}>Host</strong>: Browser V8 Engine</div>
                <div><strong style={{ color: theme.info }}>Uptime</strong>: 2 hours, 15 mins</div>
                <div><strong style={{ color: theme.info }}>Shell</strong>: zsh 5.9</div>
                <div><strong style={{ color: theme.info }}>Theme</strong>: {theme.name}</div>
                <div><strong style={{ color: theme.info }}>CPU</strong>: Apple M3 Max (Simulated)</div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ background: 'red', display: 'inline-block', width: '20px', height: '10px' }}></span>
                  <span style={{ background: 'green', display: 'inline-block', width: '20px', height: '10px' }}></span>
                  <span style={{ background: 'blue', display: 'inline-block', width: '20px', height: '10px' }}></span>
                  <span style={{ background: 'yellow', display: 'inline-block', width: '20px', height: '10px' }}></span>
                  <span style={{ background: 'magenta', display: 'inline-block', width: '20px', height: '10px' }}></span>
                  <span style={{ background: 'cyan', display: 'inline-block', width: '20px', height: '10px' }}></span>
                </div>
              </div>
            </div>
          );
          break;

        default:
          output = <span style={{ color: theme.error }}>zsh: command not found: {mainCommand}</span>;
      }
    } catch (err: any) {
      output = <span style={{ color: theme.error }}>Error: {err.message}</span>;
    }

    addCommandToSession(sessionId, rawCmd, output);
    updateSession(sessionId, { isProcessing: false });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(inputValue);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // History logic...
      if (activeSession.historyIndex < activeSession.history.length - 1) {
        const newIdx = activeSession.historyIndex + 1;
        updateSession(activeSessionId, { historyIndex: newIdx });
        setInputValue(activeSession.history[activeSession.history.length - 1 - newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // History logic...
      if (activeSession.historyIndex > 0) {
        const newIdx = activeSession.historyIndex - 1;
        updateSession(activeSessionId, { historyIndex: newIdx });
        setInputValue(activeSession.history[activeSession.history.length - 1 - newIdx]);
      } else {
        updateSession(activeSessionId, { historyIndex: -1 });
        setInputValue('');
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      // Cancel process
      updateSession(activeSessionId, { isProcessing: false });
      addCommandToSession(activeSessionId, '^C', null);
    }
  };


  return (
    <div className="advanced-terminal" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: theme.background,
      color: theme.foreground,
      fontFamily: 'SF Mono, Menlo, monospace',
      transition: 'background 0.3s ease'
    }}>
      <style>{`
        .tab-bar {
          display: flex;
          background: rgba(0,0,0,0.2);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tab {
          padding: 8px 16px;
          color: #888;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          border-right: 1px solid rgba(255,255,255,0.05);
          min-width: 120px;
          max-width: 200px;
          position: relative;
        }
        .tab.active {
          background: ${theme.background};
          color: ${theme.foreground};
          border-top: 2px solid ${theme.prompt};
        }
        .tab:hover {
          background: rgba(255,255,255,0.05);
        }
        .tab-close {
          opacity: 0;
          transition: opacity 0.2s;
          padding: 2px;
          border-radius: 4px;
        }
        .tab:hover .tab-close {
          opacity: 1;
        }
        .tab-close:hover {
          background: rgba(255,255,255,0.2);
        }
        .terminal-content {
          padding: 16px;
          flex: 1;
          overflow-y: auto;
        }
        .terminal-input {
          background: transparent;
          border: none;
          color: inherit;
          font-family: inherit;
          font-size: inherit;
          outline: none;
          width: 100%;
          caret-color: ${theme.cursor};
        }
        .glow-text {
          text-shadow: 0 0 10px ${theme.success};
        }
      `}</style>

      {/* Header / Tabs */}
      <div className="terminal-header">
        <div className="tab-bar">
          {sessions.map(s => (
            <div
              key={s.id}
              className={`tab ${activeSessionId === s.id ? 'active' : ''}`}
              onClick={() => setActiveSessionId(s.id)}
            >
              <TerminalIcon size={12} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              <div className="tab-close" onClick={(e) => closeTab(e, s.id)}>
                <X size={10} />
              </div>
            </div>
          ))}
          <div className="tab" style={{ minWidth: '40px', justifyContent: 'center' }} onClick={createNewTab}>
            <Plus size={14} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="terminal-content" ref={terminalRef} onClick={() => inputRef.current?.focus()}>
        {activeSession.commands.map(cmd => (
          <div key={cmd.id} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: theme.success }}>➜</span>
              <span style={{ color: theme.info }}>~</span>
              <span style={{ opacity: 0.8 }}>{cmd.command}</span>
            </div>
            {cmd.output && (
              <div style={{ marginLeft: '20px', lineHeight: '1.5' }}>
                {cmd.output}
              </div>
            )}
          </div>
        ))}

        {/* Input Line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: theme.success }}>➜</span>
          <span style={{ color: theme.info }}>
            {activeSession.currentPath.length ? activeSession.currentPath[activeSession.currentPath.length - 1] : '~'}
          </span>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              ref={inputRef}
              className="terminal-input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar" style={{
        padding: '4px 12px',
        fontSize: '11px',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><TerminalIcon size={10} /> zsh</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Github size={10} /> main*</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Cpu size={10} /> 4%</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Activity size={10} /> {theme.name}</span>
        </div>
      </div>
    </div>
  );
};
