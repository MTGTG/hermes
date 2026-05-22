import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import type { ComponentType } from '../types';
import { COMPONENT_LIBRARY } from '../types';

// ============ Styles ============
const styles = `
.canvas-area {
  position: relative; background: #0F0F14; overflow: hidden;
  cursor: default;
}
.canvas-area.mode-wire { cursor: crosshair; }
.canvas-area.is-panning { cursor: grabbing !important; }
.grid-background {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(45, 45, 61, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(45, 45, 61, 0.3) 1px, transparent 1px);
  background-size: 20px 20px;
}
.wiring-hint {
  position: fixed; bottom: 72px; left: 50%; transform: translateX(-50%);
  background: rgba(245, 158, 11, 0.95); color: #000; padding: 8px 20px;
  border-radius: 8px; font-size: 14px; font-weight: 500; z-index: 1000;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.wiring-hint .cancel-btn {
  padding: 4px 12px; border: none; background: #000; color: #fff;
  border-radius: 4px; cursor: pointer; font-size: 12px;
}
.connection-point {
  cursor: crosshair; transition: r 0.2s, fill 0.2s;
}
.connection-point:hover { r: 10; fill: #F59E0B; stroke: #F59E0B; filter: drop-shadow(0 0 6px #F59E0B); }
.connection-point.selected { fill: #F59E0B; stroke: #F59E0B; stroke-width: 3; }
.circuit-component.selected-comp rect,
.circuit-component.selected-comp circle,
.circuit-component.selected-comp path,
.circuit-component.selected-comp ellipse { filter: drop-shadow(0 0 4px #3B82F6); }
.wire-path.selected { stroke: #EF4444 !important; stroke-width: 3; }
.temp-wire-line { stroke: #3B82F6; stroke-width: 2; stroke-dasharray: 5,5; pointer-events: none; }
.current-flow { animation: currentFlow 0.8s linear infinite; }
@keyframes currentFlow { to { stroke-dashoffset: -15; } }
.component-animating { animation: componentBounce 0.3s ease; }
@keyframes componentBounce { 50% { transform: scale(1.05); } }
.bulb-glow { transition: opacity 0.3s; }
.led-glow { transition: opacity 0.3s; }
.motor-rotor { transition: transform 0.1s; }
`;

// ============ SVG Filters ============
function SVGFilters() {
  return (
    <defs>
      <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="wireGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="glow"/>
        <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="shadowFilter">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.4"/>
      </filter>
    </defs>
  );
}

// ============ Helpers ============
function getComponentDef(typeId: string): ComponentType | undefined {
  for (const components of Object.values(COMPONENT_LIBRARY)) {
    const def = components.find(c => c.id === typeId);
    if (def) return def;
  }
  return undefined;
}

function calculateTerminalPositions(terminals: string[]) {
  const count = terminals.length;
  const radius = 40;
  if (count === 1) return [{ x: 0, y: -radius }];
  if (count === 2) return [{ x: 0, y: -radius }, { x: 0, y: radius }];
  if (count === 3) return [
    { x: 0, y: -radius },
    { x: Math.cos(Math.PI / 6 + Math.PI) * radius, y: Math.sin(Math.PI / 6 + Math.PI) * radius },
    { x: Math.cos(-Math.PI / 6 + Math.PI) * radius, y: Math.sin(-Math.PI / 6 + Math.PI) * radius },
  ];
  const halfCount = Math.ceil(count / 2);
  const positions = [];
  for (let i = 0; i < count; i++) {
    if (i < halfCount) {
      const x = (i - (halfCount - 1) / 2) * 30;
      positions.push({ x, y: -radius });
    } else {
      const x = (i - halfCount - (count - halfCount - 1) / 2) * 30;
      positions.push({ x, y: radius });
    }
  }
  return positions;
}

// ============ Component Renderers ============
function renderSwitchSVG(compId: string, switched: boolean, showInternal: boolean, viewMode: string) {
  const internalOpacity = viewMode === 'xray' ? 1 : showInternal ? 0.6 : 0;
  const mechanismCY = switched ? 72 : 28;
  const rockerY = switched ? 50 : 20;
  const rockerH = switched ? 30 : 30;
  const mechColor = switched ? '#22C55E' : '#8B5CF6';
  
  return (
    <g>
      <rect className="switch-housing-bg" x={-40} y={-50} width={80} height={100} rx={8} fill="#3A3A4A" stroke="#5A5A6A" strokeWidth={2} filter="url(#shadowFilter)"/>
      <g className={`switch-internal ${showInternal || viewMode === 'xray' ? '' : ''}`} style={{ opacity: internalOpacity }}>
        <line x1={0} y1={50} x2={0} y2={mechanismCY} stroke="#A78BFA" strokeWidth={3}/>
        <circle cx={0} cy={mechanismCY} r={4} fill={mechColor}/>
        <rect x={-10} y={20} width={20} height={rockerH} rx={2} fill="#60A5FA"/>
      </g>
      {/* Switch rocker body */}
      {!showInternal && viewMode !== 'xray' && null}
      <rect x={-15} y={rockerY} width={30} height={30} rx={4} fill="#5A5A6A" stroke="#7A7A8A" strokeWidth={1}/>
    </g>
  );
}

function renderLEDSVG(compId: string, powered: boolean) {
  return (
    <g>
      <circle cx={0} cy={0} r={25} fill="#3A3A4A" stroke="#5A5A6A" strokeWidth={2}/>
      <circle className="led-glow" cx={0} cy={0} r={20} fill={powered ? '#EF4444' : '#3A3A4A'} stroke={powered ? '#FF6B6B' : '#EF4444'} strokeWidth={powered ? 3 : 2} opacity={powered ? 1 : 0}/>
      <line x1={-35} y1={0} x2={-25} y2={0} stroke="#F59E0B" strokeWidth={3}/>
      <line x1={25} y1={0} x2={35} y2={0} stroke="#F59E0B" strokeWidth={3}/>
    </g>
  );
}

function renderBulbSVG(compId: string, powered: boolean) {
  return (
    <g>
      <circle cx={0} cy={0} r={30} fill="#2A2A3A" stroke="#4A4A5A" strokeWidth={2} filter="url(#shadowFilter)"/>
      {/* Filament */}
      <path d="M-10 5 Q-5 -10 0 5 Q5 -10 10 5" stroke={powered ? '#FFD700' : '#6B7280'} strokeWidth={powered ? 2.5 : 2} fill="none"/>
      <circle className="bulb-glow" cx={0} cy={0} r={35} fill="#FBBF24" opacity={powered ? 0.3 : 0}/>
      <rect x={-15} y={25} width={30} height={15} rx={3} fill="#4A4A5A"/>
    </g>
  );
}

function renderMotorSVG(compId: string, powered: boolean) {
  return (
    <g>
      <rect x={-30} y={-30} width={60} height={60} rx={8} fill="#1E3A5F" stroke="#3B82F6" strokeWidth={2}/>
      <circle cx={0} cy={0} r={20} fill="#0F172A" stroke="#3B82F6" strokeWidth={2}/>
      {powered && (
        <g className="motor-rotating">
          <line x1={0} y1={-15} x2={0} y2={15} stroke="#60A5FA" strokeWidth={3}/>
          <line x1={-15} y1={0} x2={15} y2={0} stroke="#60A5FA" strokeWidth={3}/>
        </g>
      )}
      {!powered && (
        <line x1={0} y1={-15} x2={0} y2={15} stroke="#4B5563" strokeWidth={3}/>
      )}
    </g>
  );
}

function renderResistorSVG() {
  return (
    <g transform="rotate(90)">
      <line x1={-30} y1={0} x2={-15} y2={0} stroke="#A855F7" strokeWidth={3}/>
      {[[-15,-8],[-10,8],[-5,-8],[0,8],[5,-8],[10,8]].map(([x1,y1]) => (
        <line key={x1} x1={Number(x1)} y1={Number(y1)} x2={Number(x1)+5} y2={Number(y1)>0?-8:8} stroke="#A855F7" strokeWidth={2}/>
      ))}
      <line x1={15} y1={0} x2={30} y2={0} stroke="#A855F7" strokeWidth={3}/>
    </g>
  );
}

function renderCapacitorSVG() {
  return (
    <g>
      <line x1={-30} y1={0} x2={-5} y2={0} stroke="#14B8A6" strokeWidth={3}/>
      <line x1={-5} y1={-15} x2={-5} y2={15} stroke="#14B8A6" strokeWidth={3}/>
      <line x1={5} y1={-15} x2={5} y2={15} stroke="#14B8A6" strokeWidth={3}/>
      <line x1={5} y1={0} x2={30} y2={0} stroke="#14B8A6" strokeWidth={3}/>
    </g>
  );
}

function renderACPowerSVG() {
  return (
    <g transform="rotate(90)">
      <rect x={-40} y={-30} width={80} height={60} rx={8} fill="#1A1A24" stroke="#3B82F6" strokeWidth={2} filter="url(#shadowFilter)"/>
      <text x={0} y={-5} textAnchor="middle" fontSize={12} fill="#3B82F6" fontWeight={600}>AC</text>
      <text x={0} y={15} textAnchor="middle" fontSize={14} fill="white" fontWeight={700}>220V</text>
      <text x={0} y={28} textAnchor="middle" fontSize={9} fill="#9CA3AF">50Hz</text>
    </g>
  );
}

function renderDCPowerSVG() {
  return (
    <g transform="rotate(90)">
      <rect x={-40} y={-30} width={80} height={60} rx={8} fill="#1A1A24" stroke="#22C55E" strokeWidth={2} filter="url(#shadowFilter)"/>
      <text x={0} y={-5} textAnchor="middle" fontSize={12} fill="#22C55E" fontWeight={600}>DC</text>
      <text x={0} y={15} textAnchor="middle" fontSize={14} fill="white" fontWeight={700}>12V</text>
    </g>
  );
}

function renderGenericSVG(def: ComponentType, compId: string) {
  const terminalPositions = def.terminalPositions || calculateTerminalPositions(def.terminals);
  const width = def.componentSize?.width || 80;
  const height = def.componentSize?.height || 80;
  const halfW = width / 2;
  const halfH = height / 2;
  
  const terminalsHTML = def.terminals.map((term, i) => {
    const pos = terminalPositions[i] || { x: 0, y: 0 };
    return (
      <g key={term} className="terminal-group" data-terminal={term} data-component-id={compId}
        transform={`translate(${pos.x}, ${pos.y})`}>
        <circle className="connection-point" cx={0} cy={0} r={8} fill="rgba(107,114,128,0.3)" stroke="#6B7280" strokeWidth={2}/>
        <text x={0} y={18} textAnchor="middle" fontSize={8} fill="#9CA3AF">{term}</text>
      </g>
    );
  });

  if (def.svg) {
    return (
      <>
        <image href={`${import.meta.env.BASE_URL}assets/${def.svg}`} x={-halfW} y={-halfH} width={width} height={height} preserveAspectRatio="xMidYMid meet"/>
        {terminalsHTML}
        <text x={0} y={halfH + 20} textAnchor="middle" fontSize={10} fill="#9CA3AF">{def.name}</text>
      </>
    );
  }

  return (
    <>
      <rect x={-30} y={-30} width={60} height={60} rx={8} fill="#3A3A4A" stroke="#5A5A6A" strokeWidth={2}/>
      <text x={0} y={5} textAnchor="middle" fontSize={14} fill="#9CA3AF">{def.icon}</text>
      {terminalsHTML}
      <text x={0} y={70} textAnchor="middle" fontSize={10} fill="#9CA3AF">{def.name}</text>
    </>
  );
}

// ============ Main Component ============
export function CircuitCanvas() {
  // Store subscriptions
  const components = useCircuitStore(s => s.components);
  const wires = useCircuitStore(s => s.wires);
  const selectedComponentId = useCircuitStore(s => s.selectedComponentId);
  const selectedWireId = useCircuitStore(s => s.selectedWireId);
  const simulating = useCircuitStore(s => s.simulating);
  const viewMode = useCircuitStore(s => s.viewMode);
  const showInternal = useCircuitStore(s => s.showInternal);
  const currentTool = useCircuitStore(s => s.currentTool);
  const scale = useCircuitStore(s => s.scale);
  const panX = useCircuitStore(s => s.panX);
  const panY = useCircuitStore(s => s.panY);
  const wiringFrom = useCircuitStore(s => s.wiringFrom);
  const mousePos = useCircuitStore(s => s.mousePos);
  
  const setPan = useCircuitStore(s => s.setPan);
  const setScale = useCircuitStore(s => s.setScale);
  const addComponent = useCircuitStore(s => s.addComponent);
  const selectComponent = useCircuitStore(s => s.selectComponent);
  const selectWire = useCircuitStore(s => s.selectWire);
  const removeWire = useCircuitStore(s => s.removeWire);
  const removeComponent = useCircuitStore(s => s.removeComponent);
  const updateComponentPosition = useCircuitStore(s => s.updateComponentPosition);
  const setMousePos = useCircuitStore(s => s.setMousePos);
  const setWiringFrom = useCircuitStore(s => s.setWiringFrom);
  const toggleSwitch = useCircuitStore(s => s.toggleSwitch);
  const setCurrent = useCircuitStore(s => s.setCurrent);
  const setPower = useCircuitStore(s => s.setPower);

  // Local refs for drag state
  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  // Emit events for modal
  useEffect(() => {
    const handler = () => window.dispatchEvent(new CustomEvent('show-custom-modal'));
    window.addEventListener('add-custom-component', handler);
    return () => window.removeEventListener('add-custom-component', handler);
  }, []);

  // Drag from sidebar
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const typeId = e.dataTransfer.getData('componentTypeId');
    if (!typeId || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / scale;
    const y = (e.clientY - rect.top - panY) / scale;
    addComponent(typeId, x, y);
  }, [panX, panY, scale, addComponent]);

  // Mouse handlers for pan, drag, wire
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle button = pan
    if (e.button === 1) {
      e.preventDefault();
      isPanningRef.current = true;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      stageRef.current?.classList.add('is-panning');
      return;
    }

    if (e.button !== 0) return;

    const target = e.target as SVGElement;
    const terminalGroup = target.closest('.terminal-group');
    const component = target.closest('.circuit-component') as SVGGElement;

    if (terminalGroup) {
      // Start wiring
      e.stopPropagation();
      const compId = terminalGroup.getAttribute('data-component-id') || '';
      const termName = terminalGroup.getAttribute('data-terminal') || '';
      
      // Check if we already have a start point -> complete connection
      if (wiringFrom) {
        if (wiringFrom.componentId !== compId || wiringFrom.terminalId !== termName) {
          // Find store's addWire
          const state = useCircuitStore.getState();
          state.addWire(wiringFrom.componentId, wiringFrom.terminalId, compId, termName);
        }
        setWiringFrom(null);
      } else {
        setWiringFrom({ componentId: compId, terminalId: termName });
      }
      return;
    }

    if (component) {
      e.stopPropagation();
      const compId = component.id;
      
      // If wiring mode, check terminals only; otherwise allow drag
      if (currentTool === 'delete') {
        removeComponent(compId);
        return;
      }

      // Drag component
      isDraggingRef.current = true;
      dragTargetRef.current = compId;
      const rect = stageRef.current?.getBoundingClientRect();
      if (rect) {
        const mx = (e.clientX - rect.left - panX) / scale;
        const my = (e.clientY - rect.top - panY) / scale;
        const comp = components.get(compId);
        if (comp) {
          dragOffsetRef.current = { x: mx - comp.x, y: my - comp.y };
        }
      }
      
      selectComponent(compId);
    } else {
      // Clicked empty space
      selectComponent(null);
      selectWire(null);
      if (wiringFrom) setWiringFrom(null);
    }
  }, [panX, panY, scale, wiringFrom, currentTool, components, selectComponent, selectWire, setWiringFrom, removeComponent]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos(e.clientX - rect.left, e.clientY - rect.top);
    }

    if (isPanningRef.current) {
      setPan(
        panX + e.clientX - lastPanRef.current.x,
        panY + e.clientY - lastPanRef.current.y
      );
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (isDraggingRef.current && dragTargetRef.current) {
      if (rect) {
        const mx = (e.clientX - rect.left - panX) / scale;
        const my = (e.clientY - rect.top - panY) / scale;
        updateComponentPosition(dragTargetRef.current!, mx - dragOffsetRef.current.x, my - dragOffsetRef.current.y);
      }
    }
  }, [panX, panY, scale, setPan, setMousePos, updateComponentPosition]);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    isDraggingRef.current = false;
    dragTargetRef.current = null;
    stageRef.current?.classList.remove('is-panning');
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, scale * delta));
    
    setPan(
      mouseX - (mouseX - panX) * (newScale / scale),
      mouseY - (mouseY - panY) * (newScale / scale)
    );
    setScale(newScale);
  }, [scale, panX, panY, setScale, setPan]);

  // Double-click to toggle switch
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    const component = target.closest('.circuit-component') as SVGGElement;
    if (component) {
      const compId = component.id;
      const comp = components.get(compId);
      if (comp && comp.typeId === 'spdt-switch') {
        toggleSwitch(compId);
        component.classList.add('component-animating');
        setTimeout(() => component.classList.remove('component-animating'), 300);
      }
    }
  }, [components, toggleSwitch]);

  // Simulation updates
  useEffect(() => {
    if (!simulating) return;
    
    let running = true;
    let frameNum = 0;
    
    function tick() {
      if (!running) return;
      frameNum++;
      
      // Check if there's power
      let hasPower = false;
      components.forEach(comp => {
        if (comp.typeId === 'ac-power' || comp.typeId === 'dc-power') hasPower = true;
      });
      
      setCurrent(hasPower ? 0.45 : 0);
      setPower(hasPower ? 100 : 0);
      
      // Rotate motor rotor if powered
      if (hasPower && frameNum % 2 === 0) {
        document.querySelectorAll('.motor-rotating').forEach(el => {
          (el as SVGElement).setAttribute('transform', `rotate(${frameNum * 15})`);
        });
      }
      
      requestAnimationFrame(tick);
    }
    
    tick();
    return () => { running = false; };
  }, [simulating, components, setCurrent, setPower]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const state = useCircuitStore.getState();
        if (state.selectedWireId) {
          state.removeWire(state.selectedWireId);
        } else if (state.selectedComponentId) {
          state.removeComponent(state.selectedComponentId);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Compute wire segments for rendering
  const wireSegments = useMemo(() => {
    const segs: { id: string; fromX: number; fromY: number; toX: number; toY: number; fromCompType: string; toCompType: string; active: boolean }[] = [];
    wires.forEach(wire => {
      const state = useCircuitStore.getState();
      const fp = state.getTerminalPosition(wire.from.component, wire.from.terminal);
      const tp = state.getTerminalPosition(wire.to.component, wire.to.terminal);
      const fromComp = components.get(wire.from.component);
      const toComp = components.get(wire.to.component);
      segs.push({
        id: wire.id,
        fromX: fp.x, fromY: fp.y,
        toX: tp.x, toY: tp.y,
        fromCompType: fromComp?.typeId || '',
        toCompType: toComp?.typeId || '',
        active: wire.active,
      });
    });
    return segs;
  }, [wires, components]);

  // Check if a wire should be active (connected between power source and load)
  const isWireActive = useCallback((seg: typeof wireSegments[number]) => {
    if (!simulating) return false;
    const hasPowerSource = seg.fromCompType === 'ac-power' || seg.fromCompType === 'dc-power' ||
                            seg.toCompType === 'ac-power' || seg.toCompType === 'dc-power';
    const hasLoad = ['bulb', 'led', 'dc-motor', 'buzzer', 'resistor', 'capacitor'].includes(seg.fromCompType) ||
                    ['bulb', 'led', 'dc-motor', 'buzzer', 'resistor', 'capacitor'].includes(seg.toCompType);
    return hasPowerSource && hasLoad;
  }, [simulating]);

  // Check if a component is powered
  const isComponentPowered = useCallback((comp: any) => {
    if (!comp || !simulating) return false;
    return ['bulb', 'led', 'dc-motor', 'buzzer'].includes(comp.typeId);
  }, [simulating]);

  return (
    <>
      <style>{styles}</style>
      <div
        ref={stageRef}
        className={`canvas-area ${currentTool === 'wire' ? 'mode-wire' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <div className="grid-background"/>
        
        <svg
          width="100%" height="100%"
          style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
        >
          <SVGFilters/>
          
          <g transform={`translate(${panX}, ${panY}) scale(${scale})`}>
            {/* Wires layer */}
            <g id="drawing-wire">
              {wireSegments.map(seg => {
                const active = isWireActive(seg);
                const isSelected = selectedWireId === seg.id;
                return (
                  <g key={seg.id}
                    onClick={(e) => { e.stopPropagation(); selectWire(isSelected ? null : seg.id); }}
                    className="wire-group"
                    style={{ cursor: 'pointer' }}
                  >
                    <path
                      d={`M${seg.fromX} ${seg.fromY} L${seg.toX} ${seg.toY}`}
                      stroke={active ? '#22C55E' : '#6B7280'}
                      strokeWidth={isSelected ? 3 : (active ? 3 : 2)}
                      fill="none"
                      strokeLinecap="round"
                      className={`${active ? 'wire-active current-flow' : ''} ${isSelected ? 'selected' : ''}`}
                      filter={active ? 'url(#wireGlow)' : undefined}
                    />
                  </g>
                );
              })}
              
              {/* Temp wire when wiring */}
              {wiringFrom && (() => {
                const state = useCircuitStore.getState();
                const fp = state.getTerminalPosition(wiringFrom.componentId, wiringFrom.terminalId);
                const { mousePos: mp } = useCircuitStore.getState();
                const canvasRect = stageRef.current?.getBoundingClientRect();
                if (!canvasRect) return null;
                const mx = (mp.x - panX) / scale;
                const my = (mp.y - panY) / scale;
                return (
                  <line
                    x1={fp.x} y1={fp.y} x2={mx} y2={my}
                    className="temp-wire-line"
                  />
                );
              })()}
            </g>
            
            {/* Components layer */}
            <g id="circuit-content">
              {Array.from(components.entries()).map(([compId, comp]) => {
                const def = getComponentDef(comp.typeId);
                if (!def) return null;
                
                const powered = isComponentPowered(comp);
                const switched = comp.state.switched;
                const terminalPositions = def.terminalPositions || calculateTerminalPositions(def.terminals);
                const isSelected = selectedComponentId === compId;
                
                return (
                  <g
                    key={compId}
                    id={compId}
                    transform={`translate(${comp.x}, ${comp.y})`}
                    className={`circuit-component ${isSelected ? 'selected-comp' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectComponent(isSelected ? null : compId);
                    }}
                  >
                    {/* Component body based on type */}
                    {comp.typeId === 'spdt-switch' && renderSwitchSVG(compId, !!switched, showInternal, viewMode)}
                    {comp.typeId === 'bulb' && renderBulbSVG(compId, powered)}
                    {comp.typeId === 'led' && renderLEDSVG(compId, powered)}
                    {comp.typeId === 'dc-motor' && renderMotorSVG(compId, powered)}
                    {comp.typeId === 'resistor' && renderResistorSVG()}
                    {comp.typeId === 'capacitor' && renderCapacitorSVG()}
                    {comp.typeId === 'ac-power' && renderACPowerSVG()}
                    {comp.typeId === 'dc-power' && renderDCPowerSVG()}
                    {![
                      'spdt-switch','bulb','led','dc-motor','resistor','capacitor',
                      'ac-power','dc-power',
                    ].includes(comp.typeId) && renderGenericSVG(def, compId)}
                    
                    {/* Terminals overlay */}
                    {terminalPositions.map((pos, i) => (
                      <g key={def.terminals[i]} className="terminal-group"
                        data-terminal={def.terminals[i]} data-component-id={compId}
                        transform={`translate(${pos.x}, ${pos.y})`}>
                        <circle
                          className={`connection-point ${wiringFrom?.componentId === compId && wiringFrom?.terminalId === def.terminals[i] ? 'selected' : ''}`}
                          cx={0} cy={0} r={8}
                          fill="rgba(107,114,128,0.3)"
                          stroke="#6B7280"
                          strokeWidth={2}
                        />
                        <circle cx={0} cy={0} r={3.5} fill="#6B7280"/>
                        <text x={0} y={18} textAnchor="middle" fontSize={8} fill="#9CA3AF">
                          {def.terminals[i]}
                        </text>
                      </g>
                    ))}
                    
                    {/* Label */}
                    <text x={0} y={(def.componentSize?.height || 80) / 2 + 18} textAnchor="middle" fontSize={11} fill="#9CA3AF">
                      {def.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
        
        {/* Wiring hint */}
        {wiringFrom && (
          <div className="wiring-hint">
            <span>{useCircuitStore.getState().wiringFrom ? '点击另一个端子完成连线' : '点击一个端子开始连线'}</span>
            <button className="cancel-btn" onClick={() => setWiringFrom(null)}>取消</button>
          </div>
        )}
      </div>
    </>
  );
}
