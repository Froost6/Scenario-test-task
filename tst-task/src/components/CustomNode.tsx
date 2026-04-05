import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FlowNode } from '../types';
import styles from './CustomNode.module.css';

interface CustomNodeProps extends NodeProps<FlowNode['data']> {
    data: {
        label:string;
        description?:string;
        type: 'action' | 'condition'
    };
}

export const CustomNode: React.FC<CustomNodeProps> = memo(({ data, selected, id, type }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [label, setLabel] = useState(data.label)

    const handleDoubleClick = useCallback(() => {
        setIsEditing(true)
    },[])

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        if (label.trim() && label !== data.label) {
            if (typeof (window as any).updateNodeLabel === "function") {
                (window as any).updateNodeLabel(id, label.trim())
            }
        } else if (!label.trim()) {
            setLabel(data.label)
        }
    }, [label,data.label,id])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditing(false)
            if (label.trim() && label !== data.label) {
                if(typeof (window as any).updateNodeLabel === 'function') {
                    (window as any).updateNodeLabel(id, label.trim())
                }
            }
        } else if (e.key === 'Escape') {
            setLabel(data.label)
            setIsEditing(false)
        }
    }, [label, data.label, id])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value)
    }, [])


    return (
    <div className={`${styles.node} ${styles[type]} ${selected ? styles.selected : ''}`}
    onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <div className={styles.content}>
        <div className={styles.icon}>{type === 'action' ? '⚡' : '❓'}</div>
        {isEditing ? (
            <input type="text"
            value={label}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={styles.input}
            autoFocus />
        ) : (
            <div className={styles.label}>{data.label}</div>
        )}
        {data.description && !isEditing && (
            <div className={styles.description}>{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';