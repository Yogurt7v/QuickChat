import { useIsMobile } from '../hooks/useIsMobile';
import { useChatStore } from '../store/chatStore';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import styles from '../styles/Layout.module.css';
import type { LayoutProps } from '../types';

export default function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  const selectedChat = useChatStore(state => state.selectedChat);
  const showChatList = isMobile ? !selectedChat : true;

  return (
    <div className={styles.layout}>
      {showChatList && <Sidebar />}
      {(!isMobile || selectedChat) && <ChatArea />}
      {children}
    </div>
  );
}
