import { useState, useEffect, useCallback, useRef } from 'react';
import { useCircuitStore } from './store/circuitStore';
import { ComponentLibrary } from './components/ComponentLibrary';
import { CircuitCanvas } from './components/CircuitCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Toolbar } from './components/Toolbar';
import { StatusBar } from './components/StatusBar';
import { CustomComponentModal } from './components/CustomComponentModal';
import { ExportModal } from './components/ExportModal';
import './App.css';

function App() {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const simulating = useCircuitStore(s => s.simulating);
  const setSimulating = useCircuitStore(s => s.setSimulating);
  const setSimulationTime = useCircuitStore(s => s.setSimulationTime);
  const setCurrent = useCircuitStore(s => s.setCurrent);
  const setPower = useCircuitStore(s => s.setPower);
  const lastTickRef = useRef<number>(0);

  const runSimulation = useCallback(() => {
    if (!simulating) return;
    const now = performance.now();
    const dt = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;
    const newTime = (Date.now() / 1000);
    setSimulationTime(newTime);
    setCurrent(0.45);
    setPower(100);
    requestAnimationFrame(runSimulation);
  }, [simulating, setSimulationTime, setCurrent, setPower]);

  useEffect(() => {
    if (simulating) {
      lastTickRef.current = performance.now();
      const id = requestAnimationFrame(runSimulation);
      return () => cancelAnimationFrame(id);
    }
  }, [simulating, runSimulation]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'v' || e.key === 'V') {
        useCircuitStore.getState().setCurrentTool('select');
      } else if (e.key === 'w' || e.key === 'W') {
        useCircuitStore.getState().setCurrentTool('wire');
      } else if (e.key === ' ') {
        e.preventDefault();
        setSimulating(!simulating);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
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
  }, [simulating, setSimulating]);

  return (
    <div className="app-container">
      <Toolbar
        onSimulate={() => setSimulating(!simulating)}
        isSimulating={simulating}
        onExport={() => setShowExportModal(true)}
        onAddCustom={() => setShowCustomModal(true)}
      />
      <ComponentLibrary />
      <CircuitCanvas />
      <PropertiesPanel onAddCustom={() => setShowCustomModal(true)} />
      <StatusBar />
      <CustomComponentModal visible={showCustomModal} onClose={() => setShowCustomModal(false)} />
      <ExportModal visible={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  );
}

export default App;
