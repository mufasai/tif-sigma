import Papa from 'papaparse';

export interface NodeData {
  node: string;
  sto_a: string;
  types: string;
  platform: string;
  sto: string;
  sto_l: string;
  witel: string;
  reg: string;
  cluster: string;
  longitude: number;
  latitude: number;
}

export interface EdgeData {
  source: string;
  target: string;
  bandwidth?: number;
}

export interface ParsedMapData {
  nodes: NodeData[];
  edges: EdgeData[];
  bandwidthAggregation: Map<string, number>;
}

/**
 * Parse CSV file containing node data with latitude and longitude
 */
export const parseNodeCSV = (csvText: string): Promise<NodeData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<NodeData>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const validNodes = results.data.filter(
          (node) =>
            node.latitude &&
            node.longitude &&
            !isNaN(node.latitude) &&
            !isNaN(node.longitude)
        );
        resolve(validNodes);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * Parse CSV file containing edge data (connections between nodes)
 */
export const parseEdgeCSV = (csvText: string): Promise<EdgeData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<EdgeData>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const validEdges = results.data.filter(
          (edge) => edge.source && edge.target
        );
        resolve(validEdges);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * Aggregate bandwidth data by connection (source -> target)
 */
export const aggregateBandwidth = (edges: EdgeData[]): Map<string, number> => {
  const bandwidthMap = new Map<string, number>();

  edges.forEach((edge) => {
    const key = `${edge.source}->${edge.target}`;
    const currentBandwidth = bandwidthMap.get(key) || 0;
    const edgeBandwidth = edge.bandwidth || 0;
    bandwidthMap.set(key, currentBandwidth + edgeBandwidth);
  });

  return bandwidthMap;
};

/**
 * Parse CSV file containing node data
 */
export const parseMapData = async (
  nodeCSV: string
): Promise<ParsedMapData> => {
  const nodes = await parseNodeCSV(nodeCSV);
  const edges: EdgeData[] = []; // No edges from CSV, will be generated
  const bandwidthAggregation = new Map<string, number>();

  return {
    nodes,
    edges,
    bandwidthAggregation,
  };
};

/**
 * Generate edges from nodes based on proximity or other criteria
 * This is a fallback when no edge data is provided
 */
export const generateEdgesFromNodes = (
  nodes: NodeData[],
  maxDistance: number = 2 // degrees (approximate distance)
): EdgeData[] => {
  const edges: EdgeData[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];

      // Calculate simple Euclidean distance
      const distance = Math.sqrt(
        Math.pow(node1.latitude - node2.latitude, 2) +
          Math.pow(node1.longitude - node2.longitude, 2)
      );

      if (distance <= maxDistance) {
        edges.push({
          source: node1.node,
          target: node2.node,
          bandwidth: Math.random() * 100, // Random bandwidth for demo
        });
      }
    }
  }

  return edges;
};
