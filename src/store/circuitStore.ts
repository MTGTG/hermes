import { create } from 'zustand';
import type { CircuitState, ComponentInstance, Wire, ComponentType } from '../types';
import { COMPONENT_LIBRARY } from '../types';

interface CircuitStore extends CircuitState {
  // Actions
  addComponent: (typeId: string, x: number, y: number) => void;
  removeComponent: (id: string) => void;
  updateComponentPosition: (id: string, x: number, y: number) => void;
  updateComponentRotation: (id: string, rotation: number) => void;
  updateComponentProperties: (id: string, properties: Record<string, unknown>) => void;
  selectComponent: (id: string | null) => void;
  selectWire: (id: string | null) => void;
  addWire: (fromComp: string, fromTerm: string, toComp: string, toTerm: string) => void;
  removeWire: (id: string) => void;
  setSimulating: (simulating: boolean) => void;
  setSimulationTime: (time: number) => void;
  setViewMode: (mode: 'normal' | 'xray') => void;
  setShowInternal: (show: boolean) => void;
  setShowCurrent: (show: boolean) => void;
  setCurrentTool: (tool: 'select' | 'wire' | 'delete') => void;
  setScale: (scale: number) => void;
  setPan: (panX: number, panY: number) => void;
  setWiringFrom: (from: { componentId: string; terminalId: string } | null) => void;
  setMousePos: (x: number, y: number) => void;
  toggleSwitch: (compId: string) => void;
  addCustomComponent: (id: string, def: ComponentType) => void;
  setVoltage: (v: number) => void;
  setCurrent: (c: number) => void;
  setPower: (p: number) => void;
  getTerminalPosition: (compId: string, terminalName: string) => { x: number; y: number };
  getComponentDef: (typeId: string) => ComponentType | undefined;
}

function getComponentDef(typeId: string, customComponents: Record<string, ComponentType>): ComponentType | undefined {
  for (const components of Object.values(COMPONENT_LIBRARY)) {
    const def = components.find(c => c.id === typeId);
    if (def) return def;
  }
  return customComponents[typeId];
}

function getTerminalPositions(def: ComponentType): { x: number; y: number }[] {
  if (def.terminalPositions) return def.terminalPositions;
  const count = def.terminals.length;
  const positions: { x: number; y: number }[] = [];
  const radius = 40;
  if (count === 1) {
    positions.push({ x: 0, y: -radius });
  } else if (count === 2) {
    positions.push({ x: 0, y: -radius });
    positions.push({ x: 0, y: radius });
  } else if (count === 3) {
    positions.push({ x: 0, y: -radius });
    positions.push({ x: -radius * 0.866, y: radius * 0.5 });
    positions.push({ x: radius * 0.866, y: radius * 0.5 });
  } else {
    const half = Math.ceil(count / 2);
    for (let i = 0; i < count; i++) {
      if (i < half) {
        const x = (i - (half - 1) / 2) * 30;
        positions.push({ x, y: -radius });
      } else {
        const x = (i - half - (count - half - 1) / 2) * 30;
        positions.push({ x, y: radius });
      }
    }
  }
  return positions;
}

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  components: new Map(),
  wires: new Map(),
  selectedComponentId: null,
  selectedWireId: null,
  simulating: false,
  simulationTime: 0,
  viewMode: 'normal',
  showInternal: true,
  showCurrent: true,
  currentTool: 'select',
  scale: 1,
  panX: 0,
  panY: 0,
  wiringFrom: null,
  mousePos: { x: 0, y: 0 },
  customComponents: {},
  voltage: 220,
  current: 0,
  power: 0,

  addComponent: (typeId, x, y) => {
    const id = 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const comp: ComponentInstance = { id, typeId, x, y, rotation: 0, properties: {}, state: {} };
    set(state => ({
      components: new Map(state.components).set(id, comp),
    }));
  },

  removeComponent: (id) => {
    set(state => {
      const newComponents = new Map(state.components);
      newComponents.delete(id);
      const newWires = new Map(state.wires);
      newWires.forEach((wire, wireId) => {
        if (wire.from.component === id || wire.to.component === id) {
          newWires.delete(wireId);
        }
      });
      return { components: newComponents, wires: newWires, selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId };
    });
  },

  updateComponentPosition: (id, x, y) => {
    set(state => {
      const comp = state.components.get(id);
      if (!comp) return {};
      const newComp = { ...comp, x, y };
      return { components: new Map(state.components).set(id, newComp) };
    });
  },

  updateComponentRotation: (id, rotation) => {
    set(state => {
      const comp = state.components.get(id);
      if (!comp) return {};
      return { components: new Map(state.components).set(id, { ...comp, rotation }) };
    });
  },

  updateComponentProperties: (id, properties) => {
    set(state => {
      const comp = state.components.get(id);
      if (!comp) return {};
      return { components: new Map(state.components).set(id, { ...comp, properties: { ...comp.properties, ...properties } }) };
    });
  },

  selectComponent: (id) => set({ selectedComponentId: id, selectedWireId: null }),

  selectWire: (id) => set({ selectedWireId: id, selectedComponentId: null }),

  addWire: (fromComp, fromTerm, toComp, toTerm) => {
    const id = 'wire_' + Date.now();
    const wire: Wire = { id, from: { component: fromComp, terminal: fromTerm }, to: { component: toComp, terminal: toTerm }, active: false };
    set(state => ({ wires: new Map(state.wires).set(id, wire) }));
  },

  removeWire: (id) => {
    set(state => {
      const newWires = new Map(state.wires);
      newWires.delete(id);
      return { wires: newWires, selectedWireId: state.selectedWireId === id ? null : state.selectedWireId };
    });
  },

  setSimulating: (simulating) => set({ simulating }),
  setSimulationTime: (time) => set({ simulationTime: time }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setShowInternal: (show) => set({ showInternal: show }),
  setShowCurrent: (show) => set({ showCurrent: show }),
  setCurrentTool: (tool) => set({ currentTool: tool }),

  setScale: (scale) => set({ scale: Math.max(0.1, Math.min(5, scale)) }),
  setPan: (panX, panY) => set({ panX, panY }),

  setWiringFrom: (from) => set({ wiringFrom: from }),
  setMousePos: (x, y) => set({ mousePos: { x, y } }),

  toggleSwitch: (compId) => {
    set(state => {
      const comp = state.components.get(compId);
      if (!comp) return {};
      const newState = { ...comp.state, switched: !comp.state.switched };
      return { components: new Map(state.components).set(compId, { ...comp, state: newState }) };
    });
  },

  addCustomComponent: (id, def) => {
    set(state => ({ customComponents: { ...state.customComponents, [id]: def } }));
  },

  setVoltage: (v) => set({ voltage: v }),
  setCurrent: (c) => set({ current: c }),
  setPower: (p) => set({ power: p }),

  getTerminalPosition: (compId, terminalName) => {
    const state = get();
    const comp = state.components.get(compId);
    if (!comp) return { x: 0, y: 0 };
    const def = getComponentDef(comp.typeId, state.customComponents);
    if (!def) return { x: comp.x, y: comp.y };
    const positions = getTerminalPositions(def);
    const idx = def.terminals.indexOf(terminalName);
    if (idx === -1) return { x: comp.x, y: comp.y };
    const pos = positions[idx] || { x: 0, y: 0 };
    return { x: comp.x + pos.x, y: comp.y + pos.y };
  },

  getComponentDef: (typeId) => {
    const state = get();
    return getComponentDef(typeId, state.customComponents);
  },
}));
