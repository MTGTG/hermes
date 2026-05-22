import { useCircuitStore } from '../store/circuitStore';

const styles = `
.properties-panel {
  background: #1A1A24; border-left: 1px solid #2D2D3D;
  overflow-y: auto; padding: 16px; width: 320px;
  display: flex; flex-direction: column; gap: 20px;
}
.prop-title { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #9CA3AF; letter-spacing: 0.5px; margin-bottom: 12px; }
.status-indicator {
  display: flex; align-items: center; gap: 8px; padding: 12px;
  background: #242432; border-radius: 8px;
}
.status-dot {
  width: 10px; height: 10px; border-radius: 50%; background: #6B7280;
}
.status-dot.active {
  background: #22C55E; animation: pulse 2s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.prop-group { display: flex; flex-direction: column; gap: 12px; }
.prop-group-title {
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
  color: #9CA3AF; display: flex; align-items: center; gap: 8px;
}
.prop-group-title::after { content: ''; flex: 1; height: 1px; background: #2D2D3D; }

.prop-item { display: flex; flex-direction: column; gap: 6px; }
.prop-label { font-size: 12px; color: #9CA3AF; }
.prop-input {
  width: 100%; padding: 10px 12px; background: #242432;
  border: 1px solid #2D2D3D; border-radius: 6px;
  color: white; font-size: 14px;
}
.prop-input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
.prop-input[readonly] { opacity: 0.7; cursor: default; }

.prop-row { display: flex; align-items: center; gap: 8px; }
.prop-checkbox {
  appearance: none; width: 18px; height: 18px; border: 2px solid #4B5563;
  border-radius: 4px; cursor: pointer; position: relative; background: #242432;
}
.prop-checkbox:checked { background: #3B82F6; border-color: #3B82F6; }
.prop-checkbox:checked::after {
  content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  color: white; font-size: 12px; font-weight: bold;
}
.prop-select {
  width: 100%; padding: 10px 12px; background: #242432;
  border: 1px solid #2D2D3D; border-radius: 6px;
  color: white; font-size: 14px;
}
.prop-select:focus { outline: none; border-color: #3B82F6; }

.analysis-box {
  background: #242432; border-radius: 8px; padding: 12px;
  font-size: 12px; color: #9CA3AF; line-height: 1.6;
}
.analysis-box strong { color: white; }
`;

export function PropertiesPanel({ onAddCustom }: { onAddCustom?: () => void }) {
  const simulating = useCircuitStore(s => s.simulating);
  const simulationTime = useCircuitStore(s => s.simulationTime);
  const viewMode = useCircuitStore(s => s.viewMode);
  const showInternal = useCircuitStore(s => s.showInternal);
  const showCurrent = useCircuitStore(s => s.showCurrent);
  const voltage = useCircuitStore(s => s.voltage);
  const current = useCircuitStore(s => s.current);
  const power = useCircuitStore(s => s.power);
  
  const setShowInternal = useCircuitStore(s => s.setShowInternal);
  const setShowCurrent = useCircuitStore(s => s.setShowCurrent);
  const setViewMode = useCircuitStore(s => s.setViewMode);
  const setVoltage = useCircuitStore(s => s.setVoltage);
  const componentsCount = useCircuitStore(s => s.components.size);
  const wiresCount = useCircuitStore(s => s.wires.size);

  // Check for power sources in circuit
  const hasPowerSource = Array.from(useCircuitStore.getState().components.values())
    .some(c => c.typeId === 'ac-power' || c.typeId === 'dc-power');

  return (
    <>
      <style>{styles}</style>
      <div className="properties-panel">
        <div className="prop-title">属性面板</div>
        
        {/* Status */}
        <div className="status-indicator">
          <div className={`status-dot ${simulating ? 'active' : ''}`}/>
          <span style={{ fontSize: 13, color: 'white' }}>
            {simulating ? '仿真运行中' : '仿真已停止'}
          </span>
        </div>
        
        {/* Simulation Parameters */}
        <div className="prop-group">
          <div className="prop-group-title">仿真参数</div>
          <div className="prop-item">
            <span className="prop-label">仿真时间</span>
            <input className="prop-input" readOnly value={`${simulationTime.toFixed(2)} s`}/>
          </div>
          <div className="prop-item">
            <span className="prop-label">电流</span>
            <input className="prop-input" readOnly value={`${current.toFixed(2)} A`}/>
          </div>
          <div className="prop-item">
            <span className="prop-label">电压</span>
            <div className="prop-row">
              <input className="prop-input" type="number" value={voltage} onChange={e => setVoltage(Number(e.target.value))} style={{ flex: 1 }}/>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>V</span>
            </div>
          </div>
          <div className="prop-item">
            <span className="prop-label">功率</span>
            <input className="prop-input" readOnly value={`${power.toFixed(0)} W`}/>
          </div>
        </div>
        
        {/* View Options */}
        <div className="prop-group">
          <div className="prop-group-title">视图选项</div>
          <label className="prop-row" style={{ cursor: 'pointer' }}>
            <input className="prop-checkbox" type="checkbox" checked={showInternal} onChange={e => setShowInternal(e.target.checked)}/>
            <span style={{ fontSize: 13, color: 'white' }}>显示内部结构</span>
          </label>
          <label className="prop-row" style={{ cursor: 'pointer' }}>
            <input className="prop-checkbox" type="checkbox" checked={showCurrent} onChange={e => setShowCurrent(e.target.checked)}/>
            <span style={{ fontSize: 13, color: 'white' }}>显示电流方向</span>
          </label>
          <label className="prop-row" style={{ cursor: 'pointer' }}>
            <input className="prop-checkbox" type="checkbox" checked={viewMode === 'xray'} onChange={e => setViewMode(e.target.checked ? 'xray' : 'normal')}/>
            <span style={{ fontSize: 13, color: 'white' }}>X光视图</span>
          </label>
        </div>
        
        {/* Export Settings */}
        <div className="prop-group">
          <div className="prop-group-title">动画导出</div>
          <div className="prop-item">
            <span className="prop-label">分辨率</span>
            <select className="prop-select">
              <option value="720p">720p (1280×720)</option>
              <option value="1080p" selected>1080p (1920×1080)</option>
              <option value="4k">4K (3840×2160)</option>
            </select>
          </div>
          <div className="prop-item">
            <span className="prop-label">时长</span>
            <select className="prop-select">
              <option value="5">5秒</option>
              <option value="10" selected>10秒</option>
              <option value="15">15秒</option>
              <option value="30">30秒</option>
            </select>
          </div>
        </div>
        
        {/* Circuit Analysis */}
        <div className="prop-group">
          <div className="prop-group-title">电路分析</div>
          <div className="analysis-box">
            <p><strong>状态:</strong> {hasPowerSource ? '检测到电源' : '等待电源'}</p>
            <p><strong>元件数:</strong> {componentsCount}</p>
            <p><strong>连线数:</strong> {wiresCount}</p>
            <p style={{ marginTop: 8, color: '#9CA3AF' }}>
              💡 从左侧拖拽元件到画布，双击开关可切换状态<br/>
              点击端子开始连线，连接电源和负载后运行仿真
            </p>
          </div>
        </div>
        
        {/* Custom component button */}
        {onAddCustom && (
          <button onClick={onAddCustom} className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>
            + 添加自定义元件
          </button>
        )}
      </div>
    </>
  );
}
