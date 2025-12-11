import { X, ChevronLeft, ChevronRight, Network, GitBranch, Activity, Move } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';

// Types from sigma - defined locally to avoid subpath import issues
interface Coordinates {
  x: number;
  y: number;
}

interface DisplayData {
  label: string | null;
  size: number;
  color: string;
  hidden: boolean;
  forceLabel: boolean;
  zIndex: number;
  type: string;
}

interface NodeDisplayData extends Coordinates, DisplayData {
  highlighted: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PartialButFor<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>> & { [others: string]: any };

interface TopologyLink {
  source: string;
  target: string;
  source_label?: string;
  target_label?: string;
  total_capacity?: number;
  source_capacity_total?: number;
  avg_utilization?: number;
}

interface TopologyDrawerProps {
  connection: {
    from: string;
    to: string;
    nodeData?: {
      id?: string;
      label?: string;
    };
    topology?: TopologyLink[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    linkDetails?: Array<Record<string, any>>; // Add linkDetails for physical links
    clickedType?: 'node' | 'edge'; // Add clickedType to know if node was clicked
  };
  onClose: () => void;
}

export function TopologyDrawer({ connection, onClose }: TopologyDrawerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'topology' | 'links'>('topology');
  const drawerRef = useRef<HTMLDivElement>(null);
  const sigmaContainerRef = useRef<HTMLDivElement>(null);
  const sigmaInstanceRef = useRef<Sigma | null>(null);
  const sigmaLinksContainerRef = useRef<HTMLDivElement>(null);
  const sigmaLinksInstanceRef = useRef<Sigma | null>(null);

  // Custom node label renderer to position labels diagonally
  const drawLabel = (
    context: CanvasRenderingContext2D,
    data: PartialButFor<NodeDisplayData, 'x' | 'y' | 'size' | 'label' | 'color'>,
    settings: any
  ): void => {
    if (!data.label) return;

    const size = settings.labelSize;
    const weight = settings.labelWeight;

    context.fillStyle = '#1f2937';
    context.font = `${weight} ${size}px 'Outfit', sans-serif`;

    // Position label diagonally (top-right of node)
    const offsetX = data.size + 8;
    const offsetY = -data.size - 4;

    context.fillText(data.label, data.x + offsetX, data.y + offsetY);
  };

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

  // Initialize Sigma.js for Node Physical Links visualization
  useEffect(() => {
    if (!sigmaLinksContainerRef.current || isCollapsed || activeTab !== 'links') return;
    if (!connection.linkDetails || connection.linkDetails.length === 0) return;

    // Create graph for physical links
    const graph = new Graph();
    const nodeSet = new Set<string>();
    const nodeInfo = new Map<string, { label: string; peran?: string; vendor?: string }>();

    // Collect all unique nodes from linkDetails with their metadata
    connection.linkDetails.forEach((link) => {
      const sourceId = link.source_node || link.source;
      const targetId = link.target_node || link.target;

      if (sourceId) {
        nodeSet.add(sourceId);
        if (!nodeInfo.has(sourceId)) {
          nodeInfo.set(sourceId, {
            label: sourceId, // Use node ID as label, not STO label
            peran: link.source_peran,
            vendor: link.source_vendor,
          });
        }
      }

      if (targetId) {
        nodeSet.add(targetId);
        if (!nodeInfo.has(targetId)) {
          nodeInfo.set(targetId, {
            label: targetId, // Use node ID as label, not STO label
            peran: link.target_peran,
            vendor: link.target_vendor,
          });
        }
      }
    });

    const nodes = Array.from(nodeSet);

    // Determine center node - prioritize the clicked node
    let centerNodeId = connection.nodeData?.id || connection.from;

    // If centerNodeId is not in the nodeSet, use the first node
    if (!nodeSet.has(centerNodeId) && nodes.length > 0) {
      centerNodeId = nodes[0];
    }

    const centerInfo = nodeInfo.get(centerNodeId) || { label: centerNodeId };

    // Calculate positions in a circular layout
    const radius = 3;

    // Determine node color based on peran (role)
    const getNodeColor = (peran?: string): string => {
      if (!peran) return '#3b82f6';
      const peranLower = peran.toLowerCase();
      if (peranLower.includes('tera')) return '#dc2626'; // Red for TERA
      if (peranLower.includes('metro')) return '#ea580c'; // Orange for METRO
      if (peranLower.includes('aggregation') || peranLower.includes('agg')) return '#8b5cf6'; // Purple for AGG
      if (peranLower.includes('access') || peranLower.includes('acc')) return '#10b981'; // Green for ACCESS
      return '#3b82f6'; // Default blue
    };

    // Add center node (the clicked node or first node)
    graph.addNode(centerNodeId, {
      label: centerInfo.label,
      x: 0,
      y: 0,
      size: 25,
      color: '#9333ea', // Purple for center node
    });

    // Add other nodes in a circle around the center
    const otherNodes = nodes.filter(n => n !== centerNodeId);
    otherNodes.forEach((nodeId, index) => {
      const angle = (2 * Math.PI * index) / otherNodes.length;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      const info = nodeInfo.get(nodeId) || { label: nodeId };

      graph.addNode(nodeId, {
        label: info.label,
        x,
        y,
        size: 18,
        color: getNodeColor(info.peran),
      });
    });

    // Group edges by source-target-layer to handle multiple physical links per layer
    const edgeGroups = new Map<string, typeof connection.linkDetails>();

    connection.linkDetails.forEach((link) => {
      const sourceId = link.source_node || link.source;
      const targetId = link.target_node || link.target;
      const layer = link.layer || link.trunk_layer || 'unknown';

      if (!sourceId || !targetId) return;

      // Create a consistent key with layer information
      const nodeKey = sourceId < targetId
        ? `${sourceId}-${targetId}`
        : `${targetId}-${sourceId}`;
      const key = `${nodeKey}|${layer}`;

      if (!edgeGroups.has(key)) {
        edgeGroups.set(key, []);
      }
      edgeGroups.get(key)?.push(link);
    });

    // Add edges with aggregated information per layer
    edgeGroups.forEach((links, key) => {
      const firstLink = links[0];
      const sourceId = firstLink.source_node || firstLink.source;
      const targetId = firstLink.target_node || firstLink.target;
      const layer = firstLink.layer || firstLink.trunk_layer || 'unknown';

      if (!sourceId || !targetId) return;

      // Calculate total capacity for this layer
      const totalCapacity = links.reduce((sum, link) => {
        const capacity = typeof link.capacity === 'number' ? link.capacity : 0;
        return sum + capacity;
      }, 0);

      const capacityGbps = totalCapacity / 1000000000;
      const capacityLabel = capacityGbps > 0 ? `${capacityGbps.toFixed(1)}G` : '';

      // Add link count and layer to label
      const linkCountLabel = links.length > 1 ? ` (${links.length}x)` : '';
      const layerLabel = layer !== 'unknown' ? `\n${layer}` : '';
      const fullLabel = `${capacityLabel}${linkCountLabel}${layerLabel}`;

      try {
        if (graph.hasNode(sourceId) && graph.hasNode(targetId)) {
          // Calculate edge size based on total capacity
          const edgeSize = Math.max(2, Math.min(8, capacityGbps / 20));

          // Calculate edge color based on layer type only
          let edgeColor = '#8b5cf6'; // Default purple
          const layerLower = layer.toLowerCase();

          // Color by layer
          if (layerLower.includes('tera')) edgeColor = '#dc2626'; // Red for TERA
          else if (layerLower.includes('metro')) edgeColor = '#ea580c'; // Orange for METRO
          else if (layerLower.includes('agg')) edgeColor = '#8b5cf6'; // Purple for AGG
          else if (layerLower.includes('access')) edgeColor = '#10b981'; // Green for ACCESS
          else edgeColor = '#6b7280'; // Gray for unknown

          graph.addEdgeWithKey(key, sourceId, targetId, {
            size: edgeSize,
            color: edgeColor,
            label: fullLabel,
            type: 'line',
          });
        }
      } catch (_error) {
        // Edge might already exist, skip
      }
    });

    // Initialize Sigma for physical links
    try {
      sigmaLinksInstanceRef.current = new Sigma(graph, sigmaLinksContainerRef.current, {
        renderEdgeLabels: true,
        defaultNodeColor: '#999999',
        defaultEdgeColor: '#FFFFFF',
        labelSize: 12,
        labelWeight: '600',
        labelColor: { color: '#1f2937' },
        labelRenderedSizeThreshold: 0,
        labelDensity: 1,
        labelGridCellSize: 60,
        edgeLabelSize: 9,
        edgeLabelWeight: '500',
        edgeLabelColor: { color: '#6b7280' },
        enableEdgeEvents: true,
        stagePadding: 60,
        defaultDrawNodeLabel: drawLabel,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error initializing Sigma for physical links:', error);
    }

    return () => {
      if (sigmaLinksInstanceRef.current) {
        sigmaLinksInstanceRef.current.kill();
        sigmaLinksInstanceRef.current = null;
      }
    };
  }, [connection.linkDetails, connection.nodeData, connection.from, isCollapsed, activeTab]);

  // Initialize Sigma.js topology visualization
  useEffect(() => {
    if (!sigmaContainerRef.current || isCollapsed || activeTab !== 'topology') return;

    // Create graph
    const graph = new Graph();

    // Use topology data (aggregated network topology)
    if (connection.topology && connection.topology.length > 0) {
      // Use actual topology data
      const nodeSet = new Set<string>();
      const nodePositions = new Map<string, { x: number; y: number }>();

      // Collect all unique nodes from edges
      connection.topology.forEach((link) => {
        const sourceId = link.source;
        const targetId = link.target;
        nodeSet.add(sourceId);
        nodeSet.add(targetId);
      });

      // Calculate positions in a circular layout
      const nodes = Array.from(nodeSet);
      const centerNodeId = connection.nodeData?.id || connection.from;
      const radius = 3;

      // Add center node (the selected node)
      const centerLabel = connection.nodeData?.label || connection.from;
      graph.addNode(centerNodeId, {
        label: centerLabel,
        x: 0,
        y: 0,
        size: 25,
        color: '#9333ea',
      });
      nodePositions.set(centerNodeId, { x: 0, y: 0 });

      // Add other nodes in a circle around the center
      const otherNodes = nodes.filter(n => n !== centerNodeId);
      otherNodes.forEach((nodeId, index) => {
        const angle = (2 * Math.PI * index) / otherNodes.length;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        // Find node label from topology data
        const edgeWithNode = connection.topology?.find((link) =>
          link.source === nodeId || link.target === nodeId
        );
        const nodeLabel = nodeId === edgeWithNode?.source
          ? (edgeWithNode?.source_label || nodeId)
          : (edgeWithNode?.target_label || nodeId);

        graph.addNode(nodeId, {
          label: nodeLabel,
          x,
          y,
          size: 18,
          color: '#3b82f6',
        });
        nodePositions.set(nodeId, { x, y });
      });

      // Add edges from topology data
      connection.topology.forEach((link) => {
        const totalCapacity = link.total_capacity || link.source_capacity_total || 0;
        const capacityGbps = totalCapacity / 1000000000;
        const capacityLabel = capacityGbps > 0 ? `${capacityGbps.toFixed(1)}G` : '';

        try {
          if (graph.hasNode(link.source) && graph.hasNode(link.target)) {
            // Calculate edge size based on capacity
            const edgeSize = Math.max(2, Math.min(8, capacityGbps / 10));

            // Calculate edge color based on utilization or capacity
            let edgeColor = '#8b5cf6';
            if (link.avg_utilization !== undefined) {
              const util = link.avg_utilization;
              if (util > 80) edgeColor = '#ef4444'; // Red for high utilization
              else if (util > 60) edgeColor = '#f59e0b'; // Orange for medium
              else if (util > 40) edgeColor = '#eab308'; // Yellow
              else edgeColor = '#10b981'; // Green for low
            } else if (capacityGbps > 100) {
              edgeColor = '#10b981'; // Green for high capacity
            } else if (capacityGbps > 50) {
              edgeColor = '#3b82f6'; // Blue for medium
            }

            graph.addEdge(link.source, link.target, {
              size: edgeSize,
              color: edgeColor,
              label: capacityLabel,
              type: 'line',
            });
          }
        } catch (_error) {
          // Edge might already exist, skip
        }
      });

    } else {
      // Fallback to default topology structure
      const pe1Id = 'pe1';
      const pe2Id = 'pe2';
      graph.addNode(pe1Id, {
        label: `${connection.from} PE1`,
        x: -3,
        y: 3,
        size: 20,
        color: '#3b82f6',
      });
      graph.addNode(pe2Id, {
        label: `${connection.to} PE2`,
        x: 3,
        y: 3,
        size: 20,
        color: '#3b82f6',
      });

      const agg1Id = 'agg1';
      const agg2Id = 'agg2';
      graph.addNode(agg1Id, {
        label: `${connection.from} AGG1`,
        x: -3,
        y: 0,
        size: 18,
        color: '#8b5cf6',
      });
      graph.addNode(agg2Id, {
        label: `${connection.to} AGG1`,
        x: 3,
        y: 0,
        size: 18,
        color: '#8b5cf6',
      });

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
      });
      graph.addNode(access2Id, {
        label: `${connection.from} ACC2`,
        x: -2,
        y: -3,
        size: 15,
        color: '#10b981',
      });
      graph.addNode(access3Id, {
        label: `${connection.to} ACC1`,
        x: 2,
        y: -3,
        size: 15,
        color: '#10b981',
      });
      graph.addNode(access4Id, {
        label: `${connection.to} ACC2`,
        x: 4,
        y: -3,
        size: 15,
        color: '#10b981',
      });

      graph.addEdge(pe1Id, pe2Id, {
        size: 4,
        color: '#3b82f6',
        label: '100G',
        type: 'line',
      });
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
      graph.addEdge(agg1Id, agg2Id, {
        size: 3,
        color: '#10b981',
        label: '50G',
        type: 'line',
      });
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
    }

    // Initialize Sigma with improved label rendering to avoid overlap
    try {
      sigmaInstanceRef.current = new Sigma(graph, sigmaContainerRef.current, {
        renderEdgeLabels: true,
        defaultNodeColor: '#999999',
        defaultEdgeColor: '#CCCCCC',
        labelSize: 12,
        labelWeight: '600',
        labelColor: { color: '#1f2937' },
        labelRenderedSizeThreshold: 0, // Always render labels
        labelDensity: 1, // Show all labels with custom positioning
        labelGridCellSize: 60,
        edgeLabelSize: 9,
        edgeLabelWeight: '500',
        edgeLabelColor: { color: '#6b7280' },
        enableEdgeEvents: true,
        stagePadding: 60, // Add padding around the stage
        defaultDrawNodeLabel: drawLabel,
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
  }, [connection.from, connection.to, connection.topology, connection.linkDetails, connection.clickedType, isCollapsed, activeTab]);

  // Count nodes and links from graph
  const getGraphStats = () => {
    if (activeTab === 'topology' && sigmaInstanceRef.current) {
      const graph = sigmaInstanceRef.current.getGraph();
      return {
        nodes: graph.order,
        links: graph.size,
      };
    } else if (activeTab === 'links' && sigmaLinksInstanceRef.current) {
      const graph = sigmaLinksInstanceRef.current.getGraph();
      // For physical links, show both aggregated links and total physical links
      const aggregatedLinks = graph.size;
      const physicalLinks = connection.linkDetails?.length || 0;
      return {
        nodes: graph.order,
        links: aggregatedLinks,
        physicalLinks: physicalLinks,
      };
    }
    return { nodes: 8, links: 8 };
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
        top: '200px',
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

        {/* Tabs - Only show if node was clicked and has linkDetails */}
        {connection.clickedType === 'node' && connection.linkDetails && connection.linkDetails.length > 0 && (
          <div style={{
            padding: '0 16px',
            borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setActiveTab('topology')}
                style={{
                  padding: '10px 16px',
                  background: activeTab === 'topology' ? 'rgba(147, 51, 234, 0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'topology' ? '2px solid #9333ea' : '2px solid transparent',
                  color: activeTab === 'topology' ? '#9333ea' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'topology') {
                    e.currentTarget.style.background = 'rgba(243, 244, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'topology') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                Network Topology
              </button>
              <button
                onClick={() => setActiveTab('links')}
                style={{
                  padding: '10px 16px',
                  background: activeTab === 'links' ? 'rgba(147, 51, 234, 0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'links' ? '2px solid #9333ea' : '2px solid transparent',
                  color: activeTab === 'links' ? '#9333ea' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'links') {
                    e.currentTarget.style.background = 'rgba(243, 244, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'links') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                Node Physical Links
                <span style={{
                  background: activeTab === 'links' ? '#9333ea' : '#9ca3af',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {connection.linkDetails.length}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Topology Visualization - Show when topology tab is active */}
        {activeTab === 'topology' && (
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
        )}

        {/* Node Physical Links Visualization - Show when links tab is active */}
        {activeTab === 'links' && connection.linkDetails && connection.linkDetails.length > 0 && (
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
                ref={sigmaLinksContainerRef}
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
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>AGGREGATED</span>
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
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>PHYSICAL</span>
                </div>
                <div style={{ fontSize: '14px', color: '#059669' }}>{stats.physicalLinks || stats.links}</div>
              </div>
            </div>

            {/* Legend for link colors by layer */}
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(4px)',
              borderRadius: '8px',
              border: '1px solid rgba(229, 231, 235, 0.5)',
            }}>
              <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
                LAYER COLOR LEGEND
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '20px', height: '4px', background: '#dc2626', borderRadius: '2px' }} />
                  <span style={{ fontSize: '10px', color: '#374151', fontWeight: '500' }}>TERA</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '20px', height: '4px', background: '#ea580c', borderRadius: '2px' }} />
                  <span style={{ fontSize: '10px', color: '#374151', fontWeight: '500' }}>METRO</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '20px', height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
                  <span style={{ fontSize: '10px', color: '#374151', fontWeight: '500' }}>AGGREGATION</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '20px', height: '4px', background: '#10b981', borderRadius: '2px' }} />
                  <span style={{ fontSize: '10px', color: '#374151', fontWeight: '500' }}>ACCESS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '20px', height: '4px', background: '#6b7280', borderRadius: '2px' }} />
                  <span style={{ fontSize: '10px', color: '#374151', fontWeight: '500' }}>Unknown</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
