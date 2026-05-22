export interface TerminalDef {
  name: string;
  x: number;
  y: number;
}

export interface ComponentType {
  id: string;
  name: string;
  icon: string;
  desc: string;
  terminals: string[];
  terminalPositions?: TerminalDef[];
  svg?: string;
  schematic?: boolean;
  componentSize?: { width: number; height: number };
}

export interface ComponentInstance {
  id: string;
  typeId: string;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, unknown>;
  state: Record<string, unknown>;
}

export interface Wire {
  id: string;
  from: { component: string; terminal: string };
  to: { component: string; terminal: string };
  active: boolean;
}

export interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  components: ComponentType[];
}

export interface CircuitState {
  components: Map<string, ComponentInstance>;
  wires: Map<string, Wire>;
  selectedComponentId: string | null;
  selectedWireId: string | null;
  simulating: boolean;
  simulationTime: number;
  viewMode: 'normal' | 'xray';
  showInternal: boolean;
  showCurrent: boolean;
  currentTool: 'select' | 'wire' | 'delete';
  scale: number;
  panX: number;
  panY: number;
  wiringFrom: { componentId: string; terminalId: string } | null;
  mousePos: { x: number; y: number };
  customComponents: Record<string, ComponentType>;
  voltage: number;
  current: number;
  power: number;
}

export const COMPONENT_LIBRARY: Record<string, ComponentType[]> = {
  power: [
    { id: 'dc-power', name: '直流电源', icon: 'DC', desc: 'DC 1.5-48V 可调', terminals: ['+', '-'], terminalPositions: [{ x: -50, y: 0, name: '+' }, { x: 50, y: 0, name: '-' }] },
    { id: 'ac-power', name: '交流电源', icon: 'AC', desc: 'AC 220V/50Hz', terminals: ['L', 'N'], terminalPositions: [{ x: -50, y: 0, name: 'L' }, { x: 50, y: 0, name: 'N' }] },
    { id: 'battery', name: '电池', icon: '🔋', desc: '3.7V 锂电池', terminals: ['+', '-'], terminalPositions: [{ x: -30, y: 0, name: '+' }, { x: 30, y: 0, name: '-' }] },
  ],
  switches: [
    { id: 'spst-switch', name: '单刀单掷开关', icon: 'SW', desc: '简单开关', terminals: ['L', 'L1'], terminalPositions: [{ x: -35, y: 0, name: 'L' }, { x: 35, y: 0, name: 'L1' }], componentSize: { width: 70, height: 40 } },
    { id: 'spdt-switch', name: '双控开关', icon: 'SPD', desc: '单刀双掷', terminals: ['COM', 'NO', 'NC'], terminalPositions: [{ x: 40, y: 0, name: 'COM' }, { x: 40, y: 100, name: 'NO' }, { x: 10, y: 100, name: 'NC' }] },
    { id: 'push-button', name: '按钮开关', icon: '🔘', desc: '常开触点', terminals: ['A', 'B'] },
    { id: 'relay', name: '继电器', icon: '⚡', desc: '电磁开关', terminals: ['+', '-', 'COM', 'NO', 'NC'] },
  ],
  qiachip: [
    { id: 'kr2201-relay', name: 'KR2201 继电器', icon: '📦', desc: '无线遥控 433MHz', terminals: ['L', 'N', 'NO', 'COM', 'NC'], terminalPositions: [{ x: 108, y: -15, name: 'L' }, { x: 102.5, y: -56, name: 'N' }, { x: -62.5, y: -3, name: 'NO' }, { x: -62.5, y: -41, name: 'COM' }, { x: -62.5, y: -80, name: 'NC' }], componentSize: { width: 255, height: 158 } },
  ],
  load: [
    { id: 'led', name: 'LED 灯', icon: '💡', desc: '发光二极管', terminals: ['A', 'K'], terminalPositions: [{ x: 0, y: -30, name: 'A' }, { x: 0, y: 30, name: 'K' }] },
    { id: 'bulb', name: '灯泡', icon: '💡', desc: '白炽灯', terminals: ['A', 'B'], terminalPositions: [{ x: -30, y: 0, name: 'A' }, { x: 30, y: 0, name: 'B' }] },
    { id: 'dc-motor', name: '直流电机', icon: '⚙️', desc: 'DC 电动机', terminals: ['+', '-'], terminalPositions: [{ x: -30, y: 40, name: '+' }, { x: 30, y: 40, name: '-' }] },
    { id: 'buzzer', name: '蜂鸣器', icon: '🔊', desc: '有源蜂鸣器', terminals: ['+', '-'] },
    { id: 'resistor', name: '电阻', icon: 'R', desc: '1kΩ', terminals: ['A', 'B'], terminalPositions: [{ x: 0, y: -35, name: 'A' }, { x: 0, y: 35, name: 'B' }] },
    { id: 'capacitor', name: '电容', icon: 'C', desc: '100µF', terminals: ['A', 'B'], terminalPositions: [{ x: 0, y: -30, name: 'A' }, { x: 0, y: 30, name: 'B' }] },
  ],
};

export const CATEGORY_NAMES: Record<string, string> = {
  power: '⚡ 电源',
  switches: '🔌 开关',
  qiachip: '📦 QIACHIP产品',
  load: '💡 负载',
  sensors: '📡 传感器',
  actuators: '🔧 执行器',
  modules: '🧩 模块',
  custom: '✨ 自定义',
};
