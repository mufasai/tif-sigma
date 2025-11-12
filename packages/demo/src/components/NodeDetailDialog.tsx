import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import Graph from 'graphology';
import Sigma from 'sigma';
import '../styles/node-detail-dialog.css';

interface NodeDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    hostname?: string;
    witel?: string;
    type_area?: string;
    vendor?: string;
    manufacture?: string;
    version?: string;
    sto?: string;
    reg?: string;
    platform?: string;
    [key: string]: string | undefined;
  } | null;
}

export const NodeDetailDialog: React.FC<NodeDetailDialogProps> = ({
  isOpen,
  onClose,
  nodeData,
}) => {
  const sigmaContainerRef = useRef<HTMLDivElement>(null);
  const sigmaInstanceRef = useRef<Sigma | null>(null);

  useEffect(() => {
    if (!isOpen || !sigmaContainerRef.current || !nodeData) return;

    // Create a simple graph for demonstration
    const graph = new Graph();

    // Add central node (the clicked node)
    graph.addNode('center', {
      label: nodeData.hostname || 'Node',
      x: 0,
      y: 0,
      size: 20,
      color: nodeData.vendor === 'Cisco' ? '#1BA1E2' : 
             nodeData.vendor === 'Huawei' ? '#E74C3C' : 
             nodeData.vendor === 'Nokia' ? '#27AE60' : '#999999',
    });

    // Add connected nodes (example connections)
    const connections = [
      { id: 'node1', label: 'Connected Node 1', x: -2, y: 1, color: '#27AE60' },
      { id: 'node2', label: 'Connected Node 2', x: 2, y: 1, color: '#1BA1E2' },
      { id: 'node3', label: 'Connected Node 3', x: 0, y: -2, color: '#E74C3C' },
      { id: 'node4', label: 'Connected Node 4', x: -1.5, y: -1.5, color: '#F39C12' },
    ];

    connections.forEach((conn) => {
      graph.addNode(conn.id, {
        label: conn.label,
        x: conn.x,
        y: conn.y,
        size: 12,
        color: conn.color,
      });
      graph.addEdge('center', conn.id, {
        size: 2,
        color: '#CCCCCC',
      });
    });

    // Initialize Sigma
    try {
      sigmaInstanceRef.current = new Sigma(graph, sigmaContainerRef.current, {
        renderEdgeLabels: false,
        defaultNodeColor: '#999999',
        defaultEdgeColor: '#CCCCCC',
        labelSize: 12,
        labelWeight: 'bold',
        labelColor: { color: '#333333' },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error initializing Sigma:', error);
    }

    return () => {
      if (sigmaInstanceRef.current) {
        sigmaInstanceRef.current.kill();
        sigmaInstanceRef.current = null;
      }
    };
  }, [isOpen, nodeData]);

  if (!isOpen || !nodeData) return null;

  const vendorColor = nodeData.vendor === 'Cisco' ? '#1BA1E2' : 
                     nodeData.vendor === 'Huawei' ? '#E74C3C' : 
                     nodeData.vendor === 'Nokia' ? '#27AE60' : '#999999';

  return (
    <div className="node-detail-overlay" onClick={onClose}>
      <div className="node-detail-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 style={{ color: vendorColor }}>
            📍 {nodeData.hostname || 'Node Details'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="dialog-content">
          <div className="info-section">
            <h3>Node Information</h3>
            <div className="info-grid">
              {nodeData.hostname && (
                <div className="info-item">
                  <span className="info-label">Hostname:</span>
                  <span className="info-value">{nodeData.hostname}</span>
                </div>
              )}
              {nodeData.vendor && (
                <div className="info-item">
                  <span className="info-label">Vendor:</span>
                  <span className="info-value" style={{ color: vendorColor, fontWeight: 600 }}>
                    {nodeData.vendor}
                  </span>
                </div>
              )}
              {nodeData.witel && (
                <div className="info-item">
                  <span className="info-label">Witel:</span>
                  <span className="info-value">{nodeData.witel}</span>
                </div>
              )}
              {nodeData.type_area && (
                <div className="info-item">
                  <span className="info-label">Type Area:</span>
                  <span className="info-value">{nodeData.type_area}</span>
                </div>
              )}
              {nodeData.manufacture && (
                <div className="info-item">
                  <span className="info-label">Manufacture:</span>
                  <span className="info-value">{nodeData.manufacture}</span>
                </div>
              )}
              {nodeData.version && (
                <div className="info-item">
                  <span className="info-label">Version:</span>
                  <span className="info-value">{nodeData.version}</span>
                </div>
              )}
              {nodeData.sto && (
                <div className="info-item">
                  <span className="info-label">STO:</span>
                  <span className="info-value">{nodeData.sto}</span>
                </div>
              )}
              {nodeData.reg && (
                <div className="info-item">
                  <span className="info-label">Region:</span>
                  <span className="info-value">{nodeData.reg}</span>
                </div>
              )}
              {nodeData.platform && (
                <div className="info-item">
                  <span className="info-label">Platform:</span>
                  <span className="info-value">{nodeData.platform}</span>
                </div>
              )}
            </div>
          </div>

          <div className="graph-section">
            <h3>Network Topology</h3>
            <div className="sigma-graph-container" ref={sigmaContainerRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
