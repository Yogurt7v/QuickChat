import styles from '../styles/Layout.module.css';
import type { LayoutProps } from '../types';
import ChatArea from './ChatArea';
import Sidebar from './Sidebar';

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <ChatArea />
      {children}
    </div>
  );
}
