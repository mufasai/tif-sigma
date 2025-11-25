import { X, ChevronLeft, ChevronRight, Network, GitBranch, Activity, Move, RefreshCw } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';

interface TopologyTestDrawerProps {
  onClose: () => void;
}

interface TopologyData {
  tgl_upd: string;
  treg: number;
  ruas: string;
  ruas_alias: string;
  a_b: number;
  link: string;
  layer: string;
  no_name: string;
  nbr: string;
  cap: number;
  utz: number | null;
  trfmax_in: number | null;
  trfmax_ot: number | null;
  trf95_in: number | null;
  trf95_ot: number | null;
  jm_pshik: number;
  no_name_lon: number | null;
  no_name_lat: number | null;
  no_name_sto: string | null;
  no_name_sto_l: string | null;
  nbr_lon: number | null;
  nbr_lat: number | null;
  nbr_sto: string | null;
  nbr_sto_l: string | null;
}

// Layer color mapping - More distinct colors
const LAYER_COLORS: Record<string, string> = {
  'pe - teradatin': '#2563eb',      // Strong Blue
  'tera - pemobile': '#ec4899',     // Hot Pink
  'tera - pehsi': '#06b6d4',        // Cyan
  'tera - pevoice': '#a855f7',      // Purple
  'tera - metro': '#10b981',        // Emerald
  'tera - tera': '#f59e0b',         // Amber
  'tera - swc': '#ef4444',          // Red
  '': '#94a3b8',                    // Slate (for empty layer)
  'default': '#6b7280',             // Gray
};

// Get color for layer
const getLayerColor = (layer: string): string => {
  const normalizedLayer = (layer || '').toLowerCase().trim();
  return LAYER_COLORS[normalizedLayer] || LAYER_COLORS['default'];
};

// Dummy topology scenarios for testing
const DUMMY_SCENARIOS = [
  {
    id: 'scenario1',
    name: 'Simple Star Topology',
    description: 'Central hub with 5 connected nodes',
    nodes: [
      { id: 'hub', label: 'Central Hub', x: 0, y: 0, size: 30, color: '#ef4444' },
      { id: 'node1', label: 'Node 1', x: 4, y: 0, size: 20, color: '#3b82f6' },
      { id: 'node2', label: 'Node 2', x: 2, y: 3.5, size: 20, color: '#3b82f6' },
      { id: 'node3', label: 'Node 3', x: -2, y: 3.5, size: 20, color: '#3b82f6' },
      { id: 'node4', label: 'Node 4', x: -4, y: 0, size: 20, color: '#3b82f6' },
      { id: 'node5', label: 'Node 5', x: 0, y: -4, size: 20, color: '#3b82f6' },
    ],
    edges: [
      { source: 'hub', target: 'node1', size: 4, color: '#10b981', label: '100G' },
      { source: 'hub', target: 'node2', size: 4, color: '#10b981', label: '100G' },
      { source: 'hub', target: 'node3', size: 4, color: '#10b981', label: '100G' },
      { source: 'hub', target: 'node4', size: 4, color: '#10b981', label: '100G' },
      { source: 'hub', target: 'node5', size: 4, color: '#10b981', label: '100G' },
    ],
  },
  {
    id: 'scenario2',
    name: 'Ring Topology',
    description: 'Circular network with 6 nodes',
    nodes: [
      { id: 'ring1', label: 'Ring Node 1', x: 4, y: 0, size: 22, color: '#8b5cf6' },
      { id: 'ring2', label: 'Ring Node 2', x: 2, y: 3.5, size: 22, color: '#8b5cf6' },
      { id: 'ring3', label: 'Ring Node 3', x: -2, y: 3.5, size: 22, color: '#8b5cf6' },
      { id: 'ring4', label: 'Ring Node 4', x: -4, y: 0, size: 22, color: '#8b5cf6' },
      { id: 'ring5', label: 'Ring Node 5', x: -2, y: -3.5, size: 22, color: '#8b5cf6' },
      { id: 'ring6', label: 'Ring Node 6', x: 2, y: -3.5, size: 22, color: '#8b5cf6' },
    ],
    edges: [
      { source: 'ring1', target: 'ring2', size: 3, color: '#f59e0b', label: '50G' },
      { source: 'ring2', target: 'ring3', size: 3, color: '#f59e0b', label: '50G' },
      { source: 'ring3', target: 'ring4', size: 3, color: '#f59e0b', label: '50G' },
      { source: 'ring4', target: 'ring5', size: 3, color: '#f59e0b', label: '50G' },
      { source: 'ring5', target: 'ring6', size: 3, color: '#f59e0b', label: '50G' },
      { source: 'ring6', target: 'ring1', size: 3, color: '#f59e0b', label: '50G' },
    ],
  },
  {
    id: 'scenario3',
    name: 'Mesh Topology',
    description: 'Fully connected mesh network',
    nodes: [
      { id: 'mesh1', label: 'Mesh A', x: -3, y: 3, size: 24, color: '#14b8a6' },
      { id: 'mesh2', label: 'Mesh B', x: 3, y: 3, size: 24, color: '#14b8a6' },
      { id: 'mesh3', label: 'Mesh C', x: 3, y: -3, size: 24, color: '#14b8a6' },
      { id: 'mesh4', label: 'Mesh D', x: -3, y: -3, size: 24, color: '#14b8a6' },
    ],
    edges: [
      { source: 'mesh1', target: 'mesh2', size: 5, color: '#10b981', label: '200G' },
      { source: 'mesh2', target: 'mesh3', size: 5, color: '#10b981', label: '200G' },
      { source: 'mesh3', target: 'mesh4', size: 5, color: '#10b981', label: '200G' },
      { source: 'mesh4', target: 'mesh1', size: 5, color: '#10b981', label: '200G' },
      { source: 'mesh1', target: 'mesh3', size: 3, color: '#3b82f6', label: '100G' },
      { source: 'mesh2', target: 'mesh4', size: 3, color: '#3b82f6', label: '100G' },
    ],
  },
  {
    id: 'scenario4',
    name: 'Hierarchical Topology',
    description: 'Three-tier network architecture',
    nodes: [
      // Core layer
      { id: 'core1', label: 'Core 1', x: -2, y: 4, size: 28, color: '#ef4444' },
      { id: 'core2', label: 'Core 2', x: 2, y: 4, size: 28, color: '#ef4444' },
      // Distribution layer
      { id: 'dist1', label: 'Dist 1', x: -3, y: 0, size: 22, color: '#f59e0b' },
      { id: 'dist2', label: 'Dist 2', x: 0, y: 0, size: 22, color: '#f59e0b' },
      { id: 'dist3', label: 'Dist 3', x: 3, y: 0, size: 22, color: '#f59e0b' },
      // Access layer
      { id: 'acc1', label: 'Access 1', x: -4, y: -4, size: 18, color: '#10b981' },
      { id: 'acc2', label: 'Access 2', x: -2, y: -4, size: 18, color: '#10b981' },
      { id: 'acc3', label: 'Access 3', x: 0, y: -4, size: 18, color: '#10b981' },
      { id: 'acc4', label: 'Access 4', x: 2, y: -4, size: 18, color: '#10b981' },
      { id: 'acc5', label: 'Access 5', x: 4, y: -4, size: 18, color: '#10b981' },
    ],
    edges: [
      // Core interconnect
      { source: 'core1', target: 'core2', size: 6, color: '#ef4444', label: '400G' },
      // Core to Distribution
      { source: 'core1', target: 'dist1', size: 5, color: '#f59e0b', label: '200G' },
      { source: 'core1', target: 'dist2', size: 5, color: '#f59e0b', label: '200G' },
      { source: 'core2', target: 'dist2', size: 5, color: '#f59e0b', label: '200G' },
      { source: 'core2', target: 'dist3', size: 5, color: '#f59e0b', label: '200G' },
      // Distribution to Access
      { source: 'dist1', target: 'acc1', size: 3, color: '#10b981', label: '100G' },
      { source: 'dist1', target: 'acc2', size: 3, color: '#10b981', label: '100G' },
      { source: 'dist2', target: 'acc2', size: 3, color: '#10b981', label: '100G' },
      { source: 'dist2', target: 'acc3', size: 3, color: '#10b981', label: '100G' },
      { source: 'dist2', target: 'acc4', size: 3, color: '#10b981', label: '100G' },
      { source: 'dist3', target: 'acc4', size: 3, color: '#10b981', label: '100G' },
      { source: 'dist3', target: 'acc5', size: 3, color: '#10b981', label: '100G' },
    ],
  },
  {
    id: 'scenario5',
    name: 'Complex Network',
    description: 'Mixed topology with multiple connections',
    nodes: [
      { id: 'main', label: 'Main Router', x: 0, y: 0, size: 32, color: '#9333ea' },
      { id: 'pe1', label: 'PE Router 1', x: -4, y: 3, size: 24, color: '#3b82f6' },
      { id: 'pe2', label: 'PE Router 2', x: 4, y: 3, size: 24, color: '#3b82f6' },
      { id: 'agg1', label: 'Aggregation 1', x: -5, y: -1, size: 20, color: '#8b5cf6' },
      { id: 'agg2', label: 'Aggregation 2', x: 0, y: -3, size: 20, color: '#8b5cf6' },
      { id: 'agg3', label: 'Aggregation 3', x: 5, y: -1, size: 20, color: '#8b5cf6' },
      { id: 'edge1', label: 'Edge 1', x: -6, y: -4, size: 16, color: '#10b981' },
      { id: 'edge2', label: 'Edge 2', x: -3, y: -5, size: 16, color: '#10b981' },
      { id: 'edge3', label: 'Edge 3', x: 0, y: -6, size: 16, color: '#10b981' },
      { id: 'edge4', label: 'Edge 4', x: 3, y: -5, size: 16, color: '#10b981' },
      { id: 'edge5', label: 'Edge 5', x: 6, y: -4, size: 16, color: '#10b981' },
    ],
    edges: [
      { source: 'main', target: 'pe1', size: 6, color: '#ef4444', label: '400G' },
      { source: 'main', target: 'pe2', size: 6, color: '#ef4444', label: '400G' },
      { source: 'pe1', target: 'agg1', size: 4, color: '#f59e0b', label: '200G' },
      { source: 'pe1', target: 'agg2', size: 4, color: '#f59e0b', label: '200G' },
      { source: 'pe2', target: 'agg2', size: 4, color: '#f59e0b', label: '200G' },
      { source: 'pe2', target: 'agg3', size: 4, color: '#f59e0b', label: '200G' },
      { source: 'agg1', target: 'edge1', size: 2, color: '#10b981', label: '100G' },
      { source: 'agg1', target: 'edge2', size: 2, color: '#10b981', label: '100G' },
      { source: 'agg2', target: 'edge2', size: 2, color: '#10b981', label: '100G' },
      { source: 'agg2', target: 'edge3', size: 2, color: '#10b981', label: '100G' },
      { source: 'agg2', target: 'edge4', size: 2, color: '#10b981', label: '100G' },
      { source: 'agg3', target: 'edge4', size: 2, color: '#10b981', label: '100G' },
      { source: 'agg3', target: 'edge5', size: 2, color: '#10b981', label: '100G' },
      // Cross connections
      { source: 'agg1', target: 'agg2', size: 3, color: '#3b82f6', label: '100G' },
      { source: 'agg2', target: 'agg3', size: 3, color: '#3b82f6', label: '100G' },
    ],
  },
];

export function TopologyTestDrawer({ onClose }: TopologyTestDrawerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentScenario, setCurrentScenario] = useState(0);
  const [topologyData, setTopologyData] = useState<TopologyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useRealData, setUseRealData] = useState(false);
  const [selectedEdgeData, setSelectedEdgeData] = useState<TopologyData | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const sigmaContainerRef = useRef<HTMLDivElement>(null);
  const sigmaInstanceRef = useRef<Sigma | null>(null);

  const scenario = DUMMY_SCENARIOS[currentScenario];

  // Load topology data from JSON
  useEffect(() => {
    const loadTopologyData = async () => {
      try {
        const response = await fetch('/data/topology-test.json');
        if (!response.ok) {
          throw new Error('Failed to load topology data');
        }
        const data = await response.json();
        setTopologyData(data);
        setIsLoading(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading topology data:', error);
        setIsLoading(false);
      }
    };

    loadTopologyData();
  }, []);

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

    const graph = new Graph();

    if (useRealData && topologyData.length > 0) {
      // Use real data from JSON
      const nodeSet = new Set<string>();
      const nodeLayerMap = new Map<string, string>();

      // Collect all unique nodes and their layers
      topologyData.forEach((item) => {
        nodeSet.add(item.no_name);
        nodeSet.add(item.nbr);
        
        // Track layer for each node (use first occurrence)
        if (!nodeLayerMap.has(item.no_name)) {
          nodeLayerMap.set(item.no_name, item.layer);
        }
        if (!nodeLayerMap.has(item.nbr)) {
          nodeLayerMap.set(item.nbr, item.layer);
        }
      });

      // Calculate positions using force-directed layout simulation
      const nodes = Array.from(nodeSet);
      const nodePositions = new Map<string, { x: number; y: number }>();
      
      // Initialize with circular layout as starting point
      const radius = 6;
      nodes.forEach((nodeId, index) => {
        const angle = (2 * Math.PI * index) / nodes.length;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        nodePositions.set(nodeId, { x, y });
      });

      // Simple force-directed layout iterations
      const iterations = 100;
      const repulsionStrength = 2;
      const attractionStrength = 0.01;
      const damping = 0.8;

      for (let iter = 0; iter < iterations; iter++) {
        const forces = new Map<string, { fx: number; fy: number }>();
        
        // Initialize forces
        nodes.forEach(nodeId => {
          forces.set(nodeId, { fx: 0, fy: 0 });
        });

        // Repulsion between all nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];
            const pos1 = nodePositions.get(node1)!;
            const pos2 = nodePositions.get(node2)!;
            
            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
            
            const force = repulsionStrength / (distance * distance);
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            const f1 = forces.get(node1)!;
            const f2 = forces.get(node2)!;
            f1.fx -= fx;
            f1.fy -= fy;
            f2.fx += fx;
            f2.fy += fy;
          }
        }

        // Attraction along edges
        topologyData.forEach(item => {
          if (nodePositions.has(item.no_name) && nodePositions.has(item.nbr)) {
            const pos1 = nodePositions.get(item.no_name)!;
            const pos2 = nodePositions.get(item.nbr)!;
            
            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
            
            const force = distance * attractionStrength;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            const f1 = forces.get(item.no_name)!;
            const f2 = forces.get(item.nbr)!;
            f1.fx += fx;
            f1.fy += fy;
            f2.fx -= fx;
            f2.fy -= fy;
          }
        });

        // Apply forces with damping
        nodes.forEach(nodeId => {
          const pos = nodePositions.get(nodeId)!;
          const force = forces.get(nodeId)!;
          pos.x += force.fx * damping;
          pos.y += force.fy * damping;
        });
      }

      // Add nodes to graph with colors based on layer
      nodes.forEach((nodeId) => {
        const pos = nodePositions.get(nodeId)!;
        const layer = nodeLayerMap.get(nodeId) || '';
        const nodeColor = getLayerColor(layer);

        graph.addNode(nodeId, {
          label: nodeId,
          x: pos.x,
          y: pos.y,
          size: 22,
          color: nodeColor,
        });
      });

      // Add edges from topology data with metadata
      topologyData.forEach((item, index) => {
        const capacityGbps = item.cap / 1000000000;
        const capacityLabel = capacityGbps > 0 ? `${capacityGbps.toFixed(0)}G` : '';
        const layerColor = getLayerColor(item.layer);

        // Calculate edge size based on capacity
        const edgeSize = Math.max(3, Math.min(10, capacityGbps / 50));

        try {
          if (graph.hasNode(item.no_name) && graph.hasNode(item.nbr)) {
            graph.addEdge(item.no_name, item.nbr, {
              size: edgeSize,
              color: layerColor,
              label: capacityLabel,
              type: 'line',
              // Store edge data for click handler
              edgeData: item,
              edgeIndex: index,
            });
          }
        } catch (_error) {
          // Edge might already exist, skip
        }
      });
    } else {
      // Use dummy scenario data
      // Add nodes from current scenario
      scenario.nodes.forEach((node) => {
        graph.addNode(node.id, {
          label: node.label,
          x: node.x,
          y: node.y,
          size: node.size,
          color: node.color,
        });
      });

      // Add edges from current scenario
      scenario.edges.forEach((edge) => {
        try {
          graph.addEdge(edge.source, edge.target, {
            size: edge.size,
            color: edge.color,
            label: edge.label,
            type: 'line',
          });
        } catch (_error) {
          // Edge might already exist, skip
        }
      });
    }

    // Initialize Sigma
    try {
      sigmaInstanceRef.current = new Sigma(graph, sigmaContainerRef.current, {
        renderEdgeLabels: true,
        defaultNodeColor: '#999999',
        defaultEdgeColor: '#CCCCCC',
        labelSize: 12,
        labelWeight: '600',
        labelColor: { color: '#111827' },
        edgeLabelSize: 11,
        edgeLabelWeight: '600',
        edgeLabelColor: { color: '#374151' },
        enableEdgeEvents: true,
      });

      // Add edge click handler for real data
      if (useRealData && topologyData.length > 0) {
        sigmaInstanceRef.current.on('clickEdge', ({ edge }) => {
          const edgeAttrs = graph.getEdgeAttributes(edge);
          if (edgeAttrs.edgeData) {
            setSelectedEdgeData(edgeAttrs.edgeData as TopologyData);
          }
        });
      }
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
  }, [currentScenario, isCollapsed, useRealData, topologyData]);

  const getGraphStats = () => {
    if (!sigmaInstanceRef.current) {
      if (useRealData && topologyData.length > 0) {
        const nodeSet = new Set<string>();
        topologyData.forEach((item) => {
          nodeSet.add(item.no_name);
          nodeSet.add(item.nbr);
        });
        return { nodes: nodeSet.size, links: topologyData.length };
      }
      return { nodes: scenario.nodes.length, links: scenario.edges.length };
    }
    const graph = sigmaInstanceRef.current.getGraph();
    return {
      nodes: graph.order,
      links: graph.size,
    };
  };

  const stats = getGraphStats();

  // Get unique layers from topology data
  const getUniqueLayers = () => {
    if (!useRealData || topologyData.length === 0) return [];
    const layers = new Set<string>();
    topologyData.forEach((item) => {
      if (item.layer && item.layer.trim()) {
        layers.add(item.layer);
      }
    });
    return Array.from(layers).sort();
  };

  const uniqueLayers = getUniqueLayers();

  const handleNextScenario = () => {
    setCurrentScenario((prev) => (prev + 1) % DUMMY_SCENARIOS.length);
  };

  const handlePrevScenario = () => {
    setCurrentScenario((prev) => (prev - 1 + DUMMY_SCENARIOS.length) % DUMMY_SCENARIOS.length);
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
          <RefreshCw style={{ width: '16px', height: '16px', color: '#9333ea' }} />
          <span style={{ fontSize: '12px', color: '#111827' }}>Topology Test</span>
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
        width: '900px',
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
            <RefreshCw style={{ width: '16px', height: '16px', color: '#9333ea' }} />
            <div>
              <h3 style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                Topology Test - {useRealData ? 'Real Data' : scenario.name}
              </h3>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {useRealData ? 'Data from topology-test.json' : scenario.description}
              </p>
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
            height: '500px',
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
            
            {/* Edge Details Popup */}
            {selectedEdgeData && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(229, 231, 235, 0.8)',
                padding: '16px',
                maxWidth: '320px',
                zIndex: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                      Link Details
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
                      {selectedEdgeData.ruas}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEdgeData(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <X style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Source:</span>
                    <span style={{ color: '#111827', fontWeight: '600' }}>{selectedEdgeData.no_name}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Target:</span>
                    <span style={{ color: '#111827', fontWeight: '600' }}>{selectedEdgeData.nbr}</span>
                  </div>
                  <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Layer:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '16px',
                        height: '3px',
                        background: getLayerColor(selectedEdgeData.layer),
                        borderRadius: '2px',
                      }} />
                      <span style={{ color: '#111827' }}>{selectedEdgeData.layer || 'No Layer'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Capacity:</span>
                    <span style={{ color: '#2563eb', fontWeight: '600' }}>
                      {(selectedEdgeData.cap / 1000000000).toFixed(0)} Gbps
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Physical Links:</span>
                    <span style={{ color: '#111827' }}>{selectedEdgeData.jm_pshik}</span>
                  </div>
                  <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Traffic In (95%):</span>
                    <span style={{ color: '#10b981' }}>
                      {selectedEdgeData.trf95_in ? (selectedEdgeData.trf95_in / 1000000000).toFixed(2) + ' Gbps' : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Traffic Out (95%):</span>
                    <span style={{ color: '#f59e0b' }}>
                      {selectedEdgeData.trf95_ot ? (selectedEdgeData.trf95_ot / 1000000000).toFixed(2) + ' Gbps' : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Max Traffic In:</span>
                    <span style={{ color: '#6b7280' }}>
                      {selectedEdgeData.trfmax_in ? (selectedEdgeData.trfmax_in / 1000000000).toFixed(2) + ' Gbps' : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Max Traffic Out:</span>
                    <span style={{ color: '#6b7280' }}>
                      {selectedEdgeData.trfmax_ot ? (selectedEdgeData.trfmax_ot / 1000000000).toFixed(2) + ' Gbps' : 'N/A'}
                    </span>
                  </div>
                  {selectedEdgeData.utz !== null && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#6b7280', fontWeight: '500' }}>Utilization:</span>
                      <span style={{ color: '#ef4444', fontWeight: '600' }}>
                        {(selectedEdgeData.utz * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Data Source Toggle */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => setUseRealData(false)}
              style={{
                padding: '8px 16px',
                background: !useRealData ? 'rgba(147, 51, 234, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                border: !useRealData ? '1px solid rgba(147, 51, 234, 0.5)' : '1px solid rgba(229, 231, 235, 0.5)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: !useRealData ? '#9333ea' : '#374151',
                fontWeight: !useRealData ? '600' : '400',
              }}
            >
              Dummy Data
            </button>
            <button
              onClick={() => setUseRealData(true)}
              disabled={isLoading || topologyData.length === 0}
              style={{
                padding: '8px 16px',
                background: useRealData ? 'rgba(147, 51, 234, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                border: useRealData ? '1px solid rgba(147, 51, 234, 0.5)' : '1px solid rgba(229, 231, 235, 0.5)',
                borderRadius: '8px',
                cursor: isLoading || topologyData.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                color: useRealData ? '#9333ea' : '#374151',
                fontWeight: useRealData ? '600' : '400',
                opacity: isLoading || topologyData.length === 0 ? 0.5 : 1,
              }}
            >
              Real Data {isLoading ? '(Loading...)' : topologyData.length === 0 ? '(No Data)' : ''}
            </button>
          </div>

          {/* Scenario Navigation - Only show for dummy data */}
          {!useRealData && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
              <button
                onClick={handlePrevScenario}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(229, 231, 235, 0.5)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#374151',
                }}
              >
                <ChevronLeft style={{ width: '14px', height: '14px' }} />
                Previous
              </button>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(147, 51, 234, 0.1)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#9333ea',
                fontWeight: '600',
              }}>
                {currentScenario + 1} / {DUMMY_SCENARIOS.length}
              </div>
              <button
                onClick={handleNextScenario}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(229, 231, 235, 0.5)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#374151',
                }}
              >
                Next
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          )}

          {/* Layer Legend - Only show for real data */}
          {useRealData && uniqueLayers.length > 0 && (
            <div style={{
              marginTop: '12px',
              padding: '14px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.9))',
              backdropFilter: 'blur(8px)',
              borderRadius: '10px',
              border: '1px solid rgba(229, 231, 235, 0.6)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '700', 
                color: '#374151', 
                marginBottom: '10px',
                letterSpacing: '0.5px',
              }}>
                🎨 LAYER LEGEND
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {uniqueLayers.map((layer) => (
                  <div key={layer} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '6px 8px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '6px',
                    border: '1px solid rgba(229, 231, 235, 0.4)',
                  }}>
                    <div style={{
                      width: '24px',
                      height: '4px',
                      background: getLayerColor(layer),
                      borderRadius: '2px',
                      boxShadow: `0 0 8px ${getLayerColor(layer)}40`,
                    }} />
                    <span style={{ 
                      fontSize: '10px', 
                      color: '#1f2937',
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      {layer || 'No Layer'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: '10px',
                padding: '8px',
                background: 'rgba(59, 130, 246, 0.08)',
                borderRadius: '6px',
                fontSize: '10px',
                color: '#6b7280',
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                💡 Click on any edge to view detailed information
              </div>
            </div>
          )}

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
                <span style={{ fontSize: '10px', color: '#6b7280' }}>TYPE</span>
              </div>
              <div style={{ fontSize: '14px', color: '#059669' }}>{useRealData ? 'Real Data' : 'Test Data'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
