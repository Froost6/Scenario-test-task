export type NodeType = 'action' | 'condition';

export interface Position {
  x: number;
  y: number;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: {
    label: string;
    description?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Scenario {
  id: string;
  name: string;
  updatedAt: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface ScenarioListItem {
  id: string;
  name: string;
  updatedAt: string;
}