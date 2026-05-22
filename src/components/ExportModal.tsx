import { useState } from 'react';

const styles = `
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal {
  background: #1A1A24; border: 1px solid #2D2D3D; border-radius: 16px;
  padding: 24px; width: 480px;
}
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal-title { font-size: 18px; font-weight: 600; color: white; }
.modal-close {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; background: #242432; border: none; color: #9CA3AF; cursor: pointer; font-size: 18px;
}
.modal-close:hover { background: #EF4444; color: white; }

.export-icon {
  width: 64px; height: 64px; margin: 0 auto 16px; display: block;
}
.progress-bar {
  width: 100%; height: 8px; background: #242432; border-radius: 4px; overflow: hidden; margin: 16px 0;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #3B82F6, #8B5CF6);
  transition: width 0.3s ease;
}
.progress-fill.done { background: #22C55E !important; }
`;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ExportModal({ visible, onClose }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setProgress(0); setStatus('正在渲染电路...'); setDone(false);
    
    // Simulate export progress
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setProgress(i);
      
      if (i < 30) setStatus('正在渲染电路...');
      else if (i < 60) setStatus('正在生成动画帧...');
      else if (i < 90) setStatus('正在编码视频...');
      else setStatus('即将完成...');
    }
    
    setStatus('动画导出完成！');
    setDone(true);
    
    setTimeout(() => {
      onClose();
      setProgress(0); setStatus(''); setDone(false);
    }, 2000);
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{styles}</style>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">导出动画</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <svg className="export-icon" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" style={{ margin: '0 auto 16px', display: 'block' }}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2" strokeDasharray={done ? '0' : undefined}/>
          {done && <polygon points="10,13 11,15 15,10" fill="#22C55E" stroke="none"/>}
        </svg>
        
        <p style={{ textAlign: 'center', color: '#9CA3AF', marginBottom: 8, fontSize: 14 }}>{status || '准备导出...'}</p>
        
        <div className="progress-bar">
          <div className={`progress-fill ${done ? 'done' : ''}`} style={{ width: `${progress}%` }}/>
        </div>
        
        {!done && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '10px 32px' }} onClick={handleExport}>
              开始导出
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Reuse the PrimaryButton style
const primaryBtn = {
  width: '100%', padding: '10px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
  border: 'none', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer' as const,
};
