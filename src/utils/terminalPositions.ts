import type { TerminalDef } from '../types';

export function calculateTerminalPositions(terminals: string[]): TerminalDef[] {
  const count = terminals.length;
  const radius = 40;
  
  if (count === 1) {
    return [{ name: terminals[0], x: 0, y: -radius }];
  }
  
  if (count === 2) {
    return [
      { name: terminals[0], x: 0, y: -radius },
      { name: terminals[1], x: 0, y: radius },
    ];
  }
  
  if (count === 3) {
    return [
      { name: terminals[0], x: 0, y: -radius },
      { name: terminals[1], x: -Math.cos(Math.PI / 6) * radius, y: Math.sin(Math.PI / 6) * radius },
      { name: terminals[2], x: Math.cos(Math.PI / 6) * radius, y: Math.sin(Math.PI / 6) * radius },
    ];
  }
  
  // Multiple terminals distributed top/bottom
  const halfCount = Math.ceil(count / 2);
  const positions: TerminalDef[] = [];
  for (let i = 0; i < count; i++) {
    if (i < halfCount) {
      const x = (i - (halfCount - 1) / 2) * 30;
      positions.push({ name: terminals[i], x, y: -radius });
    } else {
      const x = (i - halfCount - (count - halfCount - 1) / 2) * 30;
      positions.push({ name: terminals[i], x, y: radius });
    }
  }
  return positions;
}
