'use client';

import { useState, useEffect } from 'react';
import { Check, X, HelpCircle, Save, Trash2, AlertCircle } from 'lucide-react';

export default function CookieManager({ highQuality, onHighQualityChange }) {
  const [cookie, setCookie] = useState('');
  const [saved, setSaved] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [hasCookie, setHasCookie] = useState(false);

  useEffect(() => {
    const savedCookie = localStorage.getItem('qqmusic_cookie');
    if (savedCookie) {
      setCookie(savedCookie);
      setHasCookie(true);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('qqmusic_cookie', cookie.trim());
    setSaved(true);
    setHasCookie(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('qqmusic_cookie');
    setCookie('');
    setSaved(true);
    setHasCookie(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="cookie-section">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '12px 16px',
        border: `3px solid ${hasCookie ? 'var(--accent-2)' : 'var(--accent)'}`,
        background: hasCookie ? 'rgba(5, 217, 232, 0.05)' : 'rgba(255, 42, 109, 0.05)'
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cookie 状态</span>
        <span style={{ 
          color: hasCookie ? 'var(--accent-2)' : 'var(--accent)',
          fontWeight: 900,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {hasCookie ? '● 已配置' : '● 未配置'}
        </span>
      </div>
      
      <p style={{ color: 'var(--fg-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
        设置 QQ音乐 Cookie 以获取会员/高品质资源
      </p>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '20px',
        padding: '12px 16px',
        border: `3px solid ${highQuality ? 'var(--accent-2)' : 'var(--border)'}`,
        background: highQuality ? 'rgba(5, 217, 232, 0.05)' : 'transparent'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'none', flex: 1 }}>
          <input
            type="checkbox"
            className="checkbox-brutal"
            checked={highQuality}
            onChange={(e) => onHighQualityChange?.(e.target.checked)}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>高品质 (320kbps)</div>
            <div style={{ color: 'var(--fg-muted)', fontSize: '0.75rem' }}>需会员Cookie</div>
          </div>
          {highQuality && <span className="badge-brutal hq">HQ</span>}
        </label>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <button 
          className="btn-brutal" 
          style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          onClick={() => setShowHelp(!showHelp)}
        >
          <HelpCircle size={14} style={{ marginRight: '6px' }} />
          {showHelp ? '隐藏帮助' : '查看帮助'}
        </button>
      </div>
      
      {showHelp && (
        <div className="help-brutal">
          <p><strong>QQ登录常用字段</strong> uin、psrf_qqopenid、psrf_qqunionid、psrf_qqrefresh_token、qqmusic_key/qm_keyst</p>
          <p style={{ marginTop: '8px' }}><strong>微信登录常用字段</strong> wxuin、wxopenid、wxunionid、wxrefresh_token、qqmusic_key/qm_keyst</p>
          <p style={{ marginTop: '8px', color: 'var(--fg-muted)' }}>在浏览器中登录 y.qq.com，按 F12 打开开发者工具，在 Application {'>'} Cookies 中复制 Cookie 字符串</p>
        </div>
      )}
      
      <textarea
        value={cookie}
        onChange={(e) => setCookie(e.target.value)}
        placeholder="粘贴 QQ音乐 Cookie 字符串..."
        className="cookie-input"
      />
      
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button className="btn-brutal" onClick={handleSave}>
          <Save size={14} style={{ marginRight: '6px' }} />
          保存
        </button>
        <button className="btn-brutal accent-2" onClick={handleClear}>
          <Trash2 size={14} style={{ marginRight: '6px' }} />
          清除
        </button>
      </div>
      
      {saved && (
        <div className="status-brutal success">
          <Check size={16} style={{ marginRight: '8px' }} />
          操作成功
        </div>
      )}
    </div>
  );
}
