import { useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import type { ComponentType } from '../types';

const styles = `
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal {
  background: #1A1A24; border: 1px solid #2D2D3D; border-radius: 16px;
  padding: 24px; width: 520px;
}
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal-title { font-size: 18px; font-weight: 600; color: white; }
.modal-close {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; background: #242432; border: none; color: #9CA3AF; cursor: pointer; font-size: 18px;
}
.modal-close:hover { background: #EF4444; color: white; }

.custom-form { background: #242432; border-radius: 12px; padding: 16px; }
.form-group { margin-bottom: 12px; }
.form-group:last-child { margin-bottom: 16px; }
.form-label { display: block; font-size: 12px; color: #9CA3AF; margin-bottom: 4px; }
.form-input, .form-select, .form-textarea {
  width: 100%; padding: 8px 12px; background: #1A1A24;
  border: 1px solid #2D2D3D; border-radius: 6px; color: white; font-size: 14px;
}
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #3B82F6; }
.form-textarea { min-height: 80px; resize: vertical; font-family: monospace; }
.btn-primary {
  width: 100%; padding: 10px; background: linear-gradient(135deg, #3B82F6, #2563EB);
  border: none; border-radius: 8px; color: white; font-size: 14px; font-weight: 500; cursor: pointer;
}
`;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CustomComponentModal({ visible, onClose }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✨');
  const [desc, setDesc] = useState('');
  const [terminals, setTerminals] = useState('');
  const [category, setCategory] = useState('custom');
  
  const addCustomComponent = useCircuitStore(s => s.addCustomComponent);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const id = 'custom_' + Date.now();
    const termList = terminals.split(',').map(t => t.trim()).filter(Boolean);
    
    addCustomComponent(id, {
      id, name: name.trim(), icon: icon.trim() || '✨',
      desc: desc.trim(), terminals: termList.length > 0 ? termList : ['A', 'B'],
    });
    
    onClose();
    // Reset form
    setName(''); setIcon('✨'); setDesc(''); setTerminals('');
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{styles}</style>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">添加自定义元件</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="custom-form">
          <div className="form-group">
            <label className="form-label">元件名称 *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="例如：温湿度传感器"/>
          </div>
          <div className="form-group">
            <label className="form-label">图标</label>
            <input className="form-input" value={icon} onChange={e => setIcon(e.target.value)} placeholder="emoji或文字"/>
          </div>
          <div className="form-group">
            <label className="form-label">描述</label>
            <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="元件功能描述"/>
          </div>
          <div className="form-group">
            <label className="form-label">端子 (逗号分隔)</label>
            <input className="form-input" value={terminals} onChange={e => setTerminals(e.target.value)} placeholder="VCC,GND,OUT"/>
          </div>
          <div className="form-group">
            <label className="form-label">分类</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="sensors">传感器</option>
              <option value="actuators">执行器</option>
              <option value="modules">模块</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleSubmit}>添加到元件库</button>
        </div>
      </div>
    </div>
  );
}
