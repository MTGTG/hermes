import { useCircuitStore } from '../store/circuitStore';

const styles = `
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 56px;
  background: linear-gradient(180deg, #1F1F2E 0%, #18181F 100%);
  border-bottom: 1px solid #2D2D3D;
}
.toolbar-logo { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 600; color: white; }
.toolbar-logo span { color: #3B82F6; }

.tool-btn-group { display: flex; gap: 4px; }
.tool-btn {
  width: 40px; height: 32px; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 6px; background: transparent; color: #9CA3AF;
  cursor: pointer; transition: all 0.2s;
}
.tool-btn:hover { color: white; background: #2D2D3D; }
.tool-btn.active { background: #3B82F6; color: white; }

.view-toggle { display: flex; gap: 4px; background: #242432; border-radius: 8px; padding: 4px; margin-left: 12px; }
.view-btn {
  padding: 6px 12px; border: none; border-radius: 6px; background: transparent;
  color: #9CA3AF; font-size: 12px; cursor: pointer; transition: all 0.2s;
}
.view-btn:hover { color: white; }
.view-btn.active { background: #3B82F6; color: white; }

.btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  border: none; border-radius: 8px; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
.btn-secondary {
  background: #242432; color: white; border: 1px solid #2D2D3D;
}
.btn-secondary:hover { background: #2D2D3D; }
`;

export function Toolbar({ onSimulate, isSimulating, onExport, onAddCustom }: {
  onSimulate: () => void;
  isSimulating: boolean;
  onExport: () => void;
  onAddCustom?: () => void;
}) {
  const currentTool = useCircuitStore(s => s.currentTool);
  const viewMode = useCircuitStore(s => s.viewMode);
  const setCurrentTool = useCircuitStore(s => s.setCurrentTool);
  const setViewMode = useCircuitStore(s => s.setViewMode);

  return (
    <>
      <style>{styles}</style>
      <div className="toolbar">
        <div className="toolbar-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#3B82F6" strokeWidth="2"/>
            <path d="M10 16h12M16 10v12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="4" fill="#3B82F6"/>
          </svg>
          ElecSim <span>Studio</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="tool-btn-group">
            <button
              className={`tool-btn ${currentTool === 'select' ? 'active' : ''}`}
              onClick={() => setCurrentTool('select')}
              title="选择/移动 (V)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
              </svg>
            </button>
            <button
              className={`tool-btn ${currentTool === 'wire' ? 'active' : ''}`}
              onClick={() => setCurrentTool('wire')}
              title="连线 (W)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
            <button
              className={`tool-btn ${currentTool === 'delete' ? 'active' : ''}`}
              onClick={() => setCurrentTool('delete')}
              title="删除 (Del)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
          
          <div style={{ width: 1, height: 24, background: '#2D2D3D', margin: '0 12px' }}/>
          
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'normal' ? 'active' : ''}`}
              onClick={() => setViewMode('normal')}
            >
              标准视图
            </button>
            <button
              className={`view-btn ${viewMode === 'xray' ? 'active' : ''}`}
              onClick={() => setViewMode('xray')}
            >
              X光视图
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary" onClick={onSimulate}>
            {isSimulating ? '⏹ 停止仿真' : '▶ 运行仿真'}
          </button>
          <button className="btn btn-primary" onClick={onExport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            导出动画
          </button>
        </div>
      </div>
    </>
  );
}
