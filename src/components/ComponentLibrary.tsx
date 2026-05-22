import React, { useState } from 'react';
import { COMPONENT_LIBRARY, CATEGORY_NAMES } from '../types';
import { useCircuitStore } from '../store/circuitStore';

const style = `
.component-panel {
  background: #1A1A24;
  border-right: 1px solid #2D2D3D;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
}

.search-box { position: relative; margin-bottom: 16px; }
.search-input {
  width: 100%; padding: 10px 12px 10px 36px;
  background: #242432; border: 1px solid #2D2D3D;
  border-radius: 8px; color: white; font-size: 14px;
}
.search-input:focus { outline: none; border-color: #3B82F6; }
.search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: #9CA3AF; pointer-events: none;
}

.category-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; background: #242432; border-radius: 8px;
  cursor: pointer; transition: all 0.2s; user-select: none;
}
.category-header:hover { background: #2D2D3D; }
.category-arrow { transition: transform 0.2s; font-size: 12px; color: #9CA3AF; }
.category-arrow.open { transform: rotate(0deg); }
.category-arrow.closed { transform: rotate(-90deg); }

.component-list { padding: 4px 0 0 8px; }
.component-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: #242432; border-radius: 8px;
  cursor: grab; transition: all 0.2s; border: 1px solid transparent;
  user-select: none;
}
.component-card:hover {
  background: #2D2D3D; border-color: #3B82F6; transform: translateX(4px);
}
.component-symbol {
  width: 36px; height: 36px; display: flex; align-items: center;
  justify-content: center; background: rgba(59, 130, 246, 0.1);
  border-radius: 6px; font-size: 12px; font-weight: 700; color: #3B82F6;
}
.component-info { flex: 1; min-width: 0; }
.component-name { font-size: 13px; font-weight: 500; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.component-desc { font-size: 11px; color: #9CA3AF; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.add-custom-btn {
  width: 100%; padding: 12px; margin-top: 12px;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  border: none; border-radius: 8px; color: white; font-size: 14px;
  font-weight: 500; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 8px; transition: all 0.2s;
}
.add-custom-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4); }
`;

export function ComponentLibrary() {
  const [searchText, setSearchText] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(Object.keys(COMPONENT_LIBRARY));

  const addComponent = useCircuitStore(s => s.addComponent);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleDragStart = (e: React.DragEvent, typeId: string) => {
    e.dataTransfer.setData('componentTypeId', typeId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const typeId = e.dataTransfer.getData('componentTypeId');
    if (!typeId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    // Convert screen coordinates to canvas coordinates accounting for pan/zoom
    const state = useCircuitStore.getState();
    const x = (e.clientX - rect.left - state.panX) / state.scale;
    const y = (e.clientY - rect.top - state.panY) / state.scale;
    addComponent(typeId, x, y);
  };

  const filteredLib = Object.entries(COMPONENT_LIBRARY).map(([catId, components]) => {
    const filtered = searchText
      ? components.filter(c => 
          c.name.toLowerCase().includes(searchText.toLowerCase()) ||
          c.desc.toLowerCase().includes(searchText.toLowerCase()) ||
          c.id.toLowerCase().includes(searchText.toLowerCase())
        )
      : components;
    return { catId, components: filtered };
  }).filter(item => item.components.length > 0);

  return (
    <>
      <style>{style}</style>
      <div className="component-panel">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="搜索元件..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        
        <div id="component-library">
          {filteredLib.map(({ catId, components }) => (
            <div key={catId} className="component-category">
              <div className="category-header" onClick={() => toggleCategory(catId)}>
                <span className="category-arrow open">{CATEGORY_NAMES[catId]?.charAt(0)}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>
                  {CATEGORY_NAMES[catId] || catId}
                </span>
                <span className={`category-arrow ${expandedCategories.includes(catId) ? 'open' : 'closed'}`}>
                  {expandedCategories.includes(catId) ? '▼' : '▶'}
                </span>
              </div>
              {expandedCategories.includes(catId) && (
                <div className="component-list">
                  {components.map(comp => (
                    <div
                      key={comp.id}
                      className="component-card"
                      draggable
                      onDragStart={e => handleDragStart(e, comp.id)}
                    >
                      <div className="component-symbol">{comp.icon}</div>
                      <div className="component-info">
                        <div className="component-name">{comp.name}</div>
                        <div className="component-desc">{comp.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <button className="add-custom-btn" onClick={() => window.dispatchEvent(new CustomEvent('show-custom-modal'))}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
          </svg>
          添加自定义元件
        </button>
      </div>
      
      {/* Drop zone is handled by CircuitCanvas */}
    </>
  );
}
