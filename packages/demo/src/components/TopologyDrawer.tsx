import { X, ChevronLeft, ChevronRight, Network, GitBranch, Activity, Move } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';

interface TopologyDrawerProps {
  connection: {
    from: string;
    to: string;
  };
  onClose: () => void;
}

export function TopologyDrawer({ connection, onClose }: TopologyDrawerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const drawerRef = useRef<HTMLDivElement>(null);
  const sigmaContainerRef = useRef<HTMLDivElement>(null);
  const sigmaInstanceRef = useRef<Sigma | null>(null);

  // Initialize position to center bottom on mount
  useEffect(() => {
    if (drawerRef.current && position.x === 0 && position.y === 0) {
      const rect = drawerRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: window.innerHeight - rect.height - 16
      });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (drawerRef.current) {
      setIsDragging(true);
      const rect = drawerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && drawerRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Constrain to viewport
        const rect = drawerRef.current.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Initialize Sigma.js topology visualization
  useEffect(() => {
    if (!sigmaContainerRef.current || isCollapsed) return;

    // Create graph
    const graph = new Graph();

    // Define topology structure with hierarchical layout
    // Layer 1: PE nodes (top)
    const pe1Id = 'pe1';
    const pe2Id = 'pe2';
    graph.addNode(pe1Id, {
      label: `${connection.from} PE1`,
      x: -3,
      y: 3,
      size: 20,
      color: '#3b82f6',
      type: 'PE',
    });
    graph.addNode(pe2Id, {
      label: `${connection.to} PE2`,
      x: 3,
      y: 3,
      size: 20,
      color: '#3b82f6',
      type: 'PE',
    });

    // Layer 2: AGG nodes (middle)
    const agg1Id = 'agg1';
    const agg2Id = 'agg2';
    graph.addNode(agg1Id, {
      label: `${connection.from} AGG1`,
      x: -3,
      y: 0,
      size: 18,
      color: '#8b5cf6',
      type: 'AGG',
    });
    graph.addNode(agg2Id, {
      label: `${connection.to} AGG1`,
      x: 3,
      y: 0,
      size: 18,
      color: '#8b5cf6',
      type: 'AGG',
    });

    // Layer 3: ACCESS nodes (bottom)
    const access1Id = 'access1';
    const access2Id = 'access2';
    const access3Id = 'access3';
    const access4Id = 'access4';
    graph.addNode(access1Id, {
      label: `${connection.from} ACC1`,
      x: -4,
      y: -3,
      size: 15,
      color: '#10b981',
      type: 'ACCESS',
    });
    graph.addNode(access2Id, {
      label: `${connection.from} ACC2`,
      x: -2,
      y: -3,
      size: 15,
      color: '#10b981',
      type: 'ACCESS',
    });
    graph.addNode(access3Id, {
      label: `${connection.to} ACC1`,
      x: 2,
      y: -3,
      size: 15,
      color: '#10b981',
      type: 'ACCESS',
    });
    graph.addNode(access4Id, {
      label: `${connection.to} ACC2`,
      x: 4,
      y: -3,
      size: 15,
      color: '#10b981',
      type: 'ACCESS',
    });

    // Add edges with capacity labels
    // PE to PE (backbone)
    graph.addEdge(pe1Id, pe2Id, {
      size: 4,
      color: '#3b82f6',
      label: '100G',
      type: 'line',
    });

    // PE to AGG
    graph.addEdge(pe1Id, agg1Id, {
      size: 3,
      color: '#10b981',
      label: '100G',
      type: 'line',
    });
    graph.addEdge(pe2Id, agg2Id, {
      size: 3,
      color: '#10b981',
      label: '100G',
      type: 'line',
    });

    // AGG to AGG
    graph.addEdge(agg1Id, agg2Id, {
      size: 3,
      color: '#10b981',
      label: '50G',
      type: 'line',
    });

    // AGG to ACCESS
    graph.addEdge(agg1Id, access1Id, {
      size: 2,
      color: '#10b981',
      label: '10G',
      type: 'line',
    });
    graph.addEdge(agg1Id, access2Id, {
      size: 2,
      color: '#10b981',
      label: '10G',
      type: 'line',
    });
    graph.addEdge(agg2Id, access3Id, {
      size: 2,
      color: '#10b981',
      label: '10G',
      type: 'line',
    });
    graph.addEdge(agg2Id, access4Id, {
      size: 2,
      color: '#10b981',
      label: '10G',
      type: 'line',
    });

    // Initialize Sigma
    try {
      sigmaInstanceRef.current = new Sigma(graph, sigmaContainerRef.current, {
        renderEdgeLabels: true,
        defaultNodeColor: '#999999',
        defaultEdgeColor: '#CCCCCC',
        labelSize: 11,
        labelWeight: '600',
        labelColor: { color: '#374151' },
        edgeLabelSize: 10,
        edgeLabelWeight: '500',
        edgeLabelColor: { color: '#6b7280' },
        enableEdgeEvents: true,
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
  }, [connection.from, connection.to, isCollapsed]);

  // Count nodes and links from graph
  const getGraphStats = () => {
    if (!sigmaInstanceRef.current) {
      return { nodes: 8, links: 8 };
    }
    const graph = sigmaInstanceRef.current.getGraph();
    return {
      nodes: graph.order,
      links: graph.size,
    };
  };

  const stats = getGraphStats();

  if (isCollapsed) {
    return (
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          zIndex: 9999,
          cursor: 'move',
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          <Network style={{ width: '16px', height: '16px', color: '#9333ea' }} />
          <span style={{ fontSize: '12px', color: '#111827' }}>Topology View</span>
          <ChevronRight style={{ width: '12px', height: '12px' }} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={drawerRef}
      style={{
        position: 'fixed',
        zIndex: 9999,
        width: '700px',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(229, 231, 235, 0.5)',
      }}>
        {/* Header - Draggable */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'move',
            userSelect: 'none',
          }}
          onMouseDown={handleMouseDown}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
            <Move style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
            <GitBranch style={{ width: '16px', height: '16px', color: '#9333ea' }} />
            <div>
              <h3 style={{ fontSize: '14px', color: '#111827', margin: 0 }}>Network Topology</h3>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{connection.from} → {connection.to}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'auto' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(true);
              }}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Topology Visualization */}
        <div style={{ padding: '16px' }}>
          <div style={{
            background: 'linear-gradient(to bottom right, rgba(239, 246, 255, 0.5), rgba(250, 245, 255, 0.5))',
            borderRadius: '12px',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            padding: '16px',
            height: '400px',
            position: 'relative',
          }}>
            <div 
              ref={sigmaContainerRef} 
              style={{ 
                width: '100%', 
                height: '100%',
                borderRadius: '8px',
              }}
            />
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(4px)',
              borderRadius: '8px',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              padding: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Network style={{ width: '12px', height: '12px', color: '#2563eb' }} />
                <span style={{ fontSize: '10px', color: '#6b7280' }}>NODES</span>
              </div>
              <div style={{ fontSize: '14px', color: '#111827' }}>{stats.nodes}</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(4px)',
              borderRadius: '8px',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              padding: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <GitBranch style={{ width: '12px', height: '12px', color: '#9333ea' }} />
                <span style={{ fontSize: '10px', color: '#6b7280' }}>LINKS</span>
              </div>
              <div style={{ fontSize: '14px', color: '#111827' }}>{stats.links}</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(4px)',
              borderRadius: '8px',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              padding: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Activity style={{ width: '12px', height: '12px', color: '#059669' }} />
                <span style={{ fontSize: '10px', color: '#6b7280' }}>STATUS</span>
              </div>
              <div style={{ fontSize: '14px', color: '#059669' }}>All Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
