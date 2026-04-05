import { useState, useCallback } from 'react';
import { Scenario, FlowNode, FlowEdge } from './types';
import { api } from './services/api';
import { useAsync } from './hooks/useAsync';
import { ScenarioList } from './components/scenarionList/ScenarioList';
import { FlowEditor } from './components/FlowEditor';
import styles from './App.module.css';

type View = 'list' | 'editor';

function App() {
  const [view, setView] = useState<View>('list');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const { loading, execute } = useAsync<Scenario | null>();

  const handleSelectScenario = useCallback(async (id: string) => {
    setView('editor')
    const scenario = await execute(api.getScenario(id));
    if (scenario) {
      setCurrentScenario(scenario);
      setView('editor');
    } else {
      setView('list')
    }
  }, [execute]);

  const handleCreateNew = useCallback(async () => {
    const name = prompt('Введите название сценария:', 'Новый сценарий');
    if (name) {
      const newScenario = await execute(api.createScenario(name));
      if (newScenario) {
        setCurrentScenario(newScenario);
        setView('editor');
      }
    }
  }, [execute]);

  const handleSaveScenario = useCallback(async (nodes: FlowNode[], edges: FlowEdge[]) => {
    if (currentScenario) {
      const updatedScenario = {
        ...currentScenario,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      };
      await api.saveScenario(updatedScenario);
      setCurrentScenario(updatedScenario);
      alert('Сценарий успешно сохранен!');
    }
  }, [currentScenario]);

  const handleBack = useCallback(() => {
    setView('list');
    setCurrentScenario(null);
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Конструктор сценариев</h1>
      </header>
      <main className={styles.main}>
        {view === 'list' && (
          <ScenarioList
            onSelectScenario={handleSelectScenario}
            onCreateNew={handleCreateNew}
          />
        )}
        {view === 'editor' && (
          <FlowEditor
            scenario={currentScenario}
            loading={loading}
            onSave={handleSaveScenario}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
}

export default App;