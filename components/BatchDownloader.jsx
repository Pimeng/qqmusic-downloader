'use client';

import { useState } from 'react';
import { Download, Loader2, Check, X, AlertTriangle } from 'lucide-react';
import { api, downloadSong } from '../lib/api';

export default function BatchDownloader({ songs, selectedSongs, onDownload }) {
  const [highQuality, setHighQuality] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectedSongList = songs.filter(s => selectedSongs.includes(s.mid));

  const handleBatchDownload = async () => {
    if (selectedSongList.length === 0) {
      alert('请先选择要下载的歌曲（在歌曲列表中勾选）');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const res = await api.getBatchUrls(selectedSongList, highQuality);
      const urls = res.data;
      
      let successCount = 0;

      for (let i = 0; i < urls.length; i++) {
        const item = urls[i];
        setProgress(Math.round(((i + 1) / urls.length) * 100));

        if (item.url) {
          try {
            downloadSong(item, `${item.name} - ${item.artist}.mp3`);
            successCount++;
            onDownload?.();
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.error('下载失败:', err);
          }
        }
      }

      if (successCount > 0) {
        alert(`成功下载 ${successCount}/${selectedSongList.length} 首歌曲`);
      } else {
        alert('下载失败，请检查 Cookie 设置或选择其他歌曲');
      }
    } catch (err) {
      alert('批量下载失败: ' + err.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="batch-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'none' }}>
            <input
              type="checkbox"
              className="checkbox-brutal"
              checked={highQuality}
              onChange={(e) => setHighQuality(e.target.checked)}
              disabled={loading}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>高品质 (320kbps)</div>
              <div style={{ color: 'var(--fg-muted)', fontSize: '0.75rem' }}>需会员Cookie</div>
            </div>
            {highQuality && <span className="badge-brutal hq">HQ</span>}
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: 'var(--fg-muted)', fontSize: '0.85rem' }}>
            已选择 <strong style={{ color: 'var(--accent)' }}>{selectedSongList.length}</strong> 首
          </div>
          
          <button 
            className="btn-brutal"
            onClick={handleBatchDownload}
            disabled={loading || selectedSongList.length === 0}
          >
            {loading ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
            {loading ? ` 下载中 ${progress}%` : ' 批量下载'}
          </button>
        </div>
      </div>

      {loading && (
        <>
          <div className="batch-progress">
            <div className="batch-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', gap: '4px' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="loading-bar" style={{ height: '16px', animationDuration: `${0.4 + Math.random() * 0.4}s` }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
