import { useCircuitStore } from '../store/circuitStore';

const styles = `
.status-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 48px;
  background: #1A1A24; border-top: 1px solid #2D2D3D;
  font-size: 12px; color: #9CA3AF;
}
.status-left, .status-right { display: flex; align-items: center; gap: 24px; }
.status-item { display: flex; align-items: center; gap: 6px; }
.zoom-controls { display: flex; align-items: center; gap: 8px; }
.zoom-btn {
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 4px; background: #242432; color: white;
  cursor: pointer; font-size: 14px; transition: background 0.2s;
}
.zoom-btn:hover { background: #2D2D3D; }
`;

export function StatusBar() {
  const componentsCount = useCircuitStore(s => s.components.size);
  const wiresCount = useCircuitStore(s => s.wires.size);
  const scale = useCircuitStore(s => s.scale);
  const setScale = useCircuitStore(s => s.setScale);
  const simulating = useCircuitStore(s => s.simulating);

  return (
    <>
      <style>{styles}</style>
      <div className="status-bar">
        <div className="status-left">
          <div className="status-item">
            <span style={{ color: simulating ? '#22C55E' : '#9CA3AF' }}>●</span>
            <span>{simulating ? '仿真中' : '就绪'}</span>
          </div>
          <div className="status-item">元件: {componentsCount}</div>
          <div className="status-item">连线: {wiresCount}</div>
        </div>
        <div className="status-right">
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={() => setScale(Math.max(0.1, scale / 1.2))}>−</button>
            <span>{Math.round(scale * 100)}%</span>
            <button className="zoom-btn" onClick={() => setScale(Math.min(5, scale * 1.2))}>+</button>
            <button className="zoom-btn" onClick={() => { setScale(1); useCircuitStore.getState().setPan(0, 0); }} title="重置视图">⟲</button>
          </div>
          <span>|</span>
          <span>网格: 20px</span>
          <span style={{ color: '#3B82F6' }}>ElecSim Studio Pro v2026.05.06</span>
        </div>
      </div>
    </>
  );
}
