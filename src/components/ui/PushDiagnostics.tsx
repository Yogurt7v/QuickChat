import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { VAPID_PUBLIC_KEY } from '../../constants';
import { useAuthStore } from '../../store/authStore';

interface DiagnosticInfo {
  pushSupported: boolean;
  permission: string;
  swRegistered: boolean;
  subscription: boolean;
  vapidKey: string;
  userId: string | null;
  isSafariPWA: boolean;
}

const isSafariPWA = (): boolean => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isStandalone && (isSafari || isIOS);
};

const PushDiagnostics: FC = () => {
  const { user } = useAuthStore();
  const [info, setInfo] = useState<DiagnosticInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkStatus = async () => {
    const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    const permission = 'Notification' in window ? Notification.permission : 'not supported';
    
    let swRegistered = false;
    let subscription = false;
    
    if (pushSupported) {
      const reg = await navigator.serviceWorker.getRegistration();
      swRegistered = !!reg;
      
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        subscription = !!sub;
      }
    }

    setInfo({
      pushSupported,
      permission,
      swRegistered,
      subscription,
      vapidKey: VAPID_PUBLIC_KEY ? 'установлен' : 'отсутствует',
      userId: user?.uid || null,
      isSafariPWA: isSafariPWA(),
    });
  };

  useEffect(() => {
    if (isVisible) {
      checkStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isVisible]);

  const getInstructions = () => {
    const ua = navigator.userAgent;
    if (/Chrome/i.test(ua)) {
      return 'Chrome: Нажмите 🔒 слева от адреса → Разрешения → Уведомления → Разрешить';
    } else if (/Safari/i.test(ua) && /Mac/i.test(ua)) {
      return 'Safari: Настройки Safari → Уведомления → Разрешить для сайта';
    } else if (/Firefox/i.test(ua)) {
      return 'Firefox: Нажмите 🔒 слева от адреса → Разрешения → Разрешить';
    }
    return 'Откройте настройки браузера и разрешите уведомления для этого сайта';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '5px 10px',
          fontSize: '12px',
          background: '#666',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        🔧 Диагностика
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50px',
        right: '10px',
        width: '320px',
        background: '#1a1a1a',
        color: '#fff',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 9999,
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>🔧 Диагностика Push</strong>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ✕
        </button>
      </div>

      {info ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: '#aaa' }}>Push API:</td>
              <td style={{ padding: '4px 0', color: info.pushSupported ? '#4CAF50' : '#f44336' }}>
                {info.pushSupported ? '✓ Поддерживается' : '✕ Не поддерживается'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: '#aaa' }}>Разрешение:</td>
              <td style={{ 
                padding: '4px 0', 
                color: info.permission === 'granted' ? '#4CAF50' : 
                       info.permission === 'denied' ? '#f44336' : '#FF9800' 
              }}>
                {info.permission}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: '#aaa' }}>Service Worker:</td>
              <td style={{ padding: '4px 0', color: info.swRegistered ? '#4CAF50' : '#f44336' }}>
                {info.swRegistered ? '✓ Зарегистрирован' : '✕ Не зарегистрирован'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: '#aaa' }}>Подписка:</td>
              <td style={{ padding: '4px 0', color: info.subscription ? '#4CAF50' : '#f44336' }}>
                {info.subscription ? '✓ Активна' : '✕ Нет подписки'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: '#aaa' }}>VAPID ключ:</td>
              <td style={{ padding: '4px 0', color: info.vapidKey === 'установлен' ? '#4CAF50' : '#f44336' }}>
                {info.vapidKey}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: '#aaa' }}>Платформа:</td>
              <td style={{ padding: '4px 0', color: info.isSafariPWA ? '#FF9800' : '#4CAF50' }}>
                {info.isSafariPWA ? '⚠️ Safari PWA' : '✓ Другие'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: '#aaa' }}>User ID:</td>
              <td style={{ padding: '4px 0', wordBreak: 'break-all' }}>
                {info.userId ? info.userId.slice(0, 8) + '...' : 'не вошёл'}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div>Загрузка...</div>
      )}

      {info?.isSafariPWA && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#FF9800', borderRadius: '4px', fontSize: '12px', color: '#000' }}>
          <strong>⚠️ iOS PWA:</strong>
          <p style={{ margin: '5px 0' }}>Push-уведомления недоступны в Safari PWA. Используйте приложение из App Store.</p>
        </div>
      )}

      {(info?.permission === 'default' || info?.permission === 'denied') && !info?.isSafariPWA && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#333', borderRadius: '4px', fontSize: '12px' }}>
          <strong>📋 Инструкция:</strong>
          <p style={{ margin: '5px 0', color: '#ccc' }}>{getInstructions()}</p>
        </div>
      )}

      <button
        onClick={() => checkStatus()}
        style={{
          marginTop: '15px',
          width: '100%',
          padding: '8px',
          background: '#2196F3',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        🔄 Обновить статус
      </button>

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '8px',
          width: '100%',
          padding: '8px',
          background: '#666',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        🔄 Перезагрузить страницу
      </button>
    </div>
  );
};

export default PushDiagnostics;
