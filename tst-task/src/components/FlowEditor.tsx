import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FlowNode, FlowEdge as FlowEdgeType, Scenario } from '../types';
import { CustomNode } from './CustomNode';
import { Button } from './button/Button';
import { LoadingSpinner } from './loadingSpiner/LoadingSpiner';
import styles from './FlowEditor.module.css';

interface FlowEditorProps {
  scenario: Scenario | null;
  loading: boolean;
  onSave: (nodes: FlowNode[], edges: FlowEdgeType[]) => Promise<void>;
  onBack: () => void;
}

const nodeTypes: NodeTypes = {
  customNode: CustomNode,
};

const convertToReactFlowNodes = (nodes: FlowNode[]): Node[] => {
  return nodes.map(node => ({
    id: node.id,
    type: 'customNode',
    position: node.position,
    data: node.data,
  }));
};

const convertToReactFlowEdges = (edges: FlowEdgeType[]): Edge[] => {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  }));
};

const convertFromReactFlowNodes = (nodes: Node[]): FlowNode[] => {
  return nodes.map(node => ({
    id: node.id,
    type: node.data.type || 'action',
    position: node.position,
    data: node.data,
  }));
};

const convertFromReactFlowEdges = (edges: Edge[]): FlowEdgeType[] => {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));
};

export const FlowEditor: React.FC<FlowEditorProps> = ({
  scenario,
  loading,
  onSave,
  onBack,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  useEffect(() => {
    if (scenario) {
      setNodes(convertToReactFlowNodes(scenario.nodes));
      setEdges(convertToReactFlowEdges(scenario.edges));
      setScenarioName(scenario.name);
    }
  }, [scenario, setNodes, setEdges]);

  const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            label: newLabel,
          },
        };
      }
      return node;
    }));
  }, [setNodes]);

  useEffect(() => {
    (window as any).updateNodeLabel = updateNodeLabel;
    
    return () => {
      delete (window as any).updateNodeLabel;
    };
  }, [updateNodeLabel]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edgeId = `edge-${Date.now()}-${Math.random()}`;
      setEdges(edges => addEdge({ ...params, id: edgeId }, edges));
    },
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'customNode',
      position: { x: 250, y: 150 },
      data: {
        type: 'action',
        label: 'Новое действие',
      },
    };
    setNodes(nds => [...nds, newNode]);
  }, [setNodes]);

  const addConditionNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'customNode',
      position: { x: 250, y: 150 },
      data: {
        type: 'condition',
        label: 'Новое условие',
        description: 'Проверка условия',
      },
    };
    setNodes(nds => [...nds, newNode]);
  }, [setNodes]);

  const deleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      alert('Выделите элемент для удаления (кликните на него)');
      return;
    }

    if (window.confirm(`Удалить ${selectedNodes.length} узлов и ${selectedEdges.length} связей?`)) {
      setNodes(nds => nds.filter(node => !node.selected));
      setEdges(eds => eds.filter(edge => !edge.selected));
    }
  }, [nodes, edges, setNodes, setEdges]);

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' ||
                           target.tagName === 'TEXTAREA' ||
                           target.isContentEditable;

    if (isInputFocused) {
        return
    }

    if (event.key === 'Delete' || event.key === 'backspace') {
        deleteSelected()
    }
  }, [deleteSelected])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
        window.removeEventListener('keydown',onKeyDown)
    }
  }, [onKeyDown])

  const handleSave = useCallback(async () => {
    if (!scenario) return;
    setSaving(true);
    try {
      const convertedNodes = convertFromReactFlowNodes(nodes);
      const convertedEdges = convertFromReactFlowEdges(edges);
      await onSave(convertedNodes, convertedEdges);
    } finally {
      setSaving(false);
    }
  }, [nodes, edges, scenario, onSave]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className={styles.error}>
        <p>Сценарий не найден</p>
        <Button onClick={onBack}>Назад</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button variant="secondary" onClick={onBack}>
            ← Назад
          </Button>
          <div className={styles.scenarioName}>{scenarioName}</div>
        </div>
        <div className={styles.toolbarCenter}>
          <Button onClick={addNode}>+ Блок "Действие"</Button>
          <Button variant="secondary" onClick={addConditionNode}>
            + Блок "Условие"
          </Button>
          <Button variant="danger" onClick={deleteSelected}>
            🗑 Удалить выделенное
          </Button>
        </div>
        <div className={styles.toolbarRight}>
          <Button onClick={handleSave} loading={saving}>
            💾 Сохранить
          </Button>
        </div>
      </div>
      <div className={styles.flowContainer}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          deleteKeyCode={['Delete', 'Backspace']}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};