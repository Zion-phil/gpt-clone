import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Search,
  Image as ImageIcon,
  LayoutGrid,
  Microscope,
  Code2,
  FolderKanban,
  PanelLeftClose,
} from 'lucide-react';
import axios from 'axios';
import styles from './Sidebar.module.css';

// const API_BASE_URL = 'http://localhost:3877/api'; => changed this line to the code below for production case
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3877/api';

export default function Sidebar({
  activeSessionId,
  onSelectSession,
  onNewChat,
  refreshKey,
}) {
  const [sessions, setSessions] = useState([]);

  // Fetch the sessions list on mount, and again whenever refreshKey changes
  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE_URL}/chat/sessions`)
      .then((res) => {
        if (!cancelled && res.data.success) {
          setSessions(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching sessions:', err));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.iconBtn}>
            <PanelLeftClose size={20} />
          </div>
        </div>
        <button className={styles.iconBtn} onClick={onNewChat}>
          <MessageSquare size={20} />
        </button>
      </div>

      <nav className={styles.nav}>
        <a
          href='#'
          className={styles.item}
          onClick={(e) => {
            e.preventDefault();
            onNewChat();
          }}
        >
          <MessageSquare size={18} />
          <span>New chat</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <Search size={18} />
          <span>Search chats</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <ImageIcon size={18} />
          <span>Images</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <LayoutGrid size={18} />
          <span>Apps</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <Microscope size={18} />
          <span>Deep research</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <Code2 size={18} />
          <span>Codex</span>
        </a>
        <a href='#' className={styles.item} onClick={(e) => e.preventDefault()}>
          <FolderKanban size={18} />
          <span>Projects</span>
        </a>
      </nav>

      {/* sessions list */}
      <div className={styles.sessionsSection}>
        <p className={styles.sectionLabel}>Recent</p>
        <ul className={styles.sessionList}>
          {sessions.length === 0 ? (
            <li className={styles.emptyHint}>No chats yet</li>
          ) : (
            sessions.map((s) => (
              <li
                key={s.id}
                className={`${styles.sessionItem} ${
                  s.id === activeSessionId ? styles.active : ''
                }`}
                onClick={() => onSelectSession(s.id)}
                title={s.title}
              >
                <MessageSquare size={14} />
                <span className={styles.sessionTitle}>{s.title}</span>
                <span className={styles.sessionMeta}>{s.messageCount}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}