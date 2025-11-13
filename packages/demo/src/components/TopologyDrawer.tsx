import { X, ChevronLeft, ChevronRight, Network, GitBranch, Activity, Move } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

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

  // Mock topology data
  const topologyNodes = [
    { id: 'pe1', label: `${connection.from} PE1`, type: 'PE', status: 'active', x: 100, y: 150 },
    { id: 'pe2', label: `${connection.to} PE2`, type: 'PE', status: 'active', x: 500, y: 150 },
    { id: 'agg1', label: `${connection.from} AGG1`, type: 'AGG', status: 'active', x: 150, y: 250 },
    { id: 'agg2', label: `${connection.to} AGG1`, type: 'AGG', status: 'active', x: 450, y: 250 },
    { id: 'access1', label: `${connection.from} ACC1`, type: 'ACCESS', status: 'active', x: 100, y: 350 },
    { id: 'access2', label: `${connection.from} ACC2`, type: 'ACCESS', status: 'active', x: 200, y: 350 },
    { id: 'access3', label: `${connection.to} ACC1`, type: 'ACCESS', status: 'active', x: 400, y: 350 },
    { id: 'access4', label: `${connection.to} ACC2`, type: 'ACCESS', status: 'active', x: 500, y: 350 },
  ];

  const topologyLinks = [
    { from: 'pe1', to: 'pe2', capacity: '100G', utilization: 72 },
    { from: 'pe1', to: 'agg1', capacity: '100G', utilization: 65 },
    { from: 'pe2', to: 'agg2', capacity: '100G', utilization: 68 },
    { from: 'agg1', to: 'agg2', capacity: '50G', utilization: 55 },
    { from: 'agg1', to: 'access1', capacity: '10G', utilization: 45 },
    { from: 'agg1', to: 'access2', capacity: '10G', utilization: 48 },
    { from: 'agg2', to: 'access3', capacity: '10G', utilization: 42 },
    { from: 'agg2', to: 'access4', capacity: '10G', utilization: 50 },
  ];

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'PE': return '#3b82f6'; // blue
      case 'AGG': return '#8b5cf6'; // purple
      case 'ACCESS': return '#10b981'; // green
      default: return '#6b7280';
    }
  };

  const getLinkColor = (utilization: number) => {
    if (utilization > 85) return '#f59e0b';
    if (utilization > 70) return '#3b82f6';
    return '#10b981';
  };

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
          }}>
            <svg width="100%" height="400" viewBox="0 0 600 400">
              {/* Links */}
              {topologyLinks.map((link, idx) => {
                const fromNode = topologyNodes.find(n => n.id === link.from);
                const toNode = topologyNodes.find(n => n.id === link.to);
                if (!fromNode || !toNode) return null;

                const color = getLinkColor(link.utilization);

                return (
                  <g key={idx}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={color}
                      strokeWidth="2"
                      strokeOpacity="0.6"
                    />
                    {/* Capacity label */}
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 - 5}
                      textAnchor="middle"
                      fontSize="9px"
                      fill="#6b7280"
                    >
                      {link.capacity}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {topologyNodes.map((node) => {
                const color = getNodeColor(node.type);

                return (
                  <g key={node.id}>
                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="20"
                      fill={color}
                      fillOpacity="0.2"
                      stroke={color}
                      strokeWidth="2"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="8"
                      fill={color}
                    />

                    {/* Status indicator */}
                    {node.status === 'active' && (
                      <circle
                        cx={node.x + 6}
                        cy={node.y - 6}
                        r="3"
                        fill="#10b981"
                        stroke="white"
                        strokeWidth="1"
                      />
                    )}

                    {/* Label */}
                    <text
                      x={node.x}
                      y={node.y + 35}
                      textAnchor="middle"
                      fontSize="10px"
                      fill="#111827"
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 47}
                      textAnchor="middle"
                      fontSize="9px"
                      fill="#6b7280"
                    >
                      {node.type}
                    </text>
                  </g>
                );
              })}
            </svg>
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
              <div style={{ fontSize: '14px', color: '#111827' }}>{topologyNodes.length}</div>
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
              <div style={{ fontSize: '14px', color: '#111827' }}>{topologyLinks.length}</div>
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
