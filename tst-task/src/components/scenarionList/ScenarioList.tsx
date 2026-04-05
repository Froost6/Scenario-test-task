import React, { useEffect, useState } from 'react';
import { ScenarioListItem } from '../../types';
import { api } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../button/Button';
import { LoadingSpinner } from '../loadingSpiner/LoadingSpiner';
import styles from './ScenarioList.module.css';

interface ScenarioListProps {
  onSelectScenario: (id: string) => void;
  onCreateNew: () => void;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({
  onSelectScenario,
  onCreateNew,
}) => {
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const { loading, error, execute } = useAsync<ScenarioListItem[]>();

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    const data = await execute(api.getScenarios());
    if (data) {
      setScenarios(data);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && scenarios.length === 0) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Ошибка: {error}</p>
        <Button onClick={loadScenarios}>Повторить</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Сценарии</h2>
        <Button onClick={onCreateNew}>+ Создать новый</Button>
      </div>
      <div className={styles.list}>
        {scenarios.length === 0 && (
          <div className={styles.empty}>Нет сценариев</div>
        )}
        {scenarios.map(scenario => (
          <div
            key={scenario.id}
            className={styles.item}
            onClick={() => onSelectScenario(scenario.id)}
          >
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{scenario.name}</div>
              <div className={styles.itemDate}>Обновлен: {formatDate(scenario.updatedAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};