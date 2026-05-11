'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, icon, children }) {
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      overlayRef.current?.classList.remove('open');
      panelRef.current?.classList.remove('open');
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && visible && overlayRef.current && panelRef.current) {
      // 强制浏览器先计算并绘制初始状态（translateX(100%) 和 opacity: 0）
      void overlayRef.current.offsetWidth;
      void panelRef.current.offsetWidth;
      
      overlayRef.current.classList.add('open');
      panelRef.current.classList.add('open');
    }
  }, [isOpen, visible]);

  if (!visible) return null;

  return (
    <>
      <div 
        ref={overlayRef}
        className="drawer-overlay"
        onClick={onClose}
      />
      <div ref={panelRef} className="drawer-panel">
        <div className="drawer-header">
          <h3>{icon && <span style={{ marginRight: '8px' }}>{icon}</span>}{title}</h3>
          <button className="drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </>
  );
}
