import { GraphInputData, NodeData, EdgeData, RawDataItem } from "../types";

/**
 * Detects if an object is likely a node based on its properties
 */
function isLikelyNode(obj: RawDataItem): boolean {
  const nodeIndicators = ['hostname', 'no_name', 'id', 'name', 'latitude', 'longitude', 'lat', 'lon', 'lng'];
  return nodeIndicators.some(field => obj[field] !== undefined && obj[field] !== null && obj[field] !== '\\N');
}

/**
 * Detects if an object is likely an edge based on its properties
 */
function isLikelyEdge(obj: RawDataItem): boolean {
  const edgeIndicators = ['source', 'target', 'ruas', 'nbr', 'layer', 'traffic_in', 'traffic_out'];
  const hasEdgeFields = edgeIndicators.some(field => obj[field] !== undefined && obj[field] !== null && obj[field] !== '\\N');
  
  // Must have connection info (ruas or source/target or nbr)
  const hasConnection = !!(obj.ruas || (obj.source && obj.target) || obj.nbr);
  
  return hasEdgeFields && hasConnection;
}

/**
 * Normalizes a raw data item into a NodeData object
 */
function normalizeToNode(obj: RawDataItem, index: number): NodeData | null {
  // Extract hostname/id
  const hostname = obj.hostname || obj.no_name || obj.id || obj.name || obj.label || `Node-${index}`;
  
  if (!hostname || hostname === '\\N') return null;

  // Extract manufacture (with fallbacks)
  const manufacture = obj.manufacture || obj.manufacturer || 'Unknown';
  
  // Extract model
  const model = obj.model || 'Unknown';
  
  // Extract region
  const region = obj.region || obj.layer || 'Unknown';
  
  // Extract coordinates
  const latitude = obj.latitude || obj.lat || undefined;
  const longitude = obj.longitude || obj.lon || obj.lng || undefined;
  
  // Extract port info
  const slot = obj.slot || undefined;
  const port_used = obj.port_used || undefined;
  const port_idle = obj.port_idle || undefined;
  const percentage_used = obj.percentage_used || (port_used && slot ? (port_used / slot) * 100 : undefined);
  
  const nodeData: NodeData = {
    hostname: String(hostname),
    manufacture: String(manufacture),
    model: String(model),
    region: String(region),
  };

  // Add optional fields if they exist
  if (slot !== undefined) nodeData.slot = Number(slot);
  if (port_used !== undefined) nodeData.port_used = Number(port_used);
  if (port_idle !== undefined) nodeData.port_idle = Number(port_idle);
  if (percentage_used !== undefined) nodeData.percentage_used = Number(percentage_used);
  if (latitude !== undefined && String(latitude) !== '\\N') nodeData.latitude = Number(latitude);
  if (longitude !== undefined && String(longitude) !== '\\N') nodeData.longitude = Number(longitude);
  
  // Copy other fields
  Object.keys(obj).forEach(key => {
    if (!['hostname', 'no_name', 'id', 'name', 'manufacture', 'manufacturer', 'model', 'region', 
          'latitude', 'lat', 'longitude', 'lon', 'lng', 'slot', 'port_used', 'port_idle', 
          'percentage_used'].includes(key)) {
      nodeData[key] = obj[key];
    }
  });
  
  return nodeData;
}

/**
 * Normalizes a raw data item into an EdgeData object
 */
function normalizeToEdge(obj: RawDataItem, nodeMap: Set<string>): EdgeData | null {
  let source: string | undefined;
  let target: string | undefined;
  
  // Try to extract source and target from different formats
  if (obj.source && obj.target) {
    source = String(obj.source);
    target = String(obj.target);
  } else if (obj.ruas && obj.nbr) {
    // Parse ruas format like "A_to_B" or use no_name
    source = obj.no_name ? String(obj.no_name) : String(obj.ruas).split('_to_')[0];
    target = String(obj.nbr);
  } else if (obj.no_name && obj.nbr) {
    source = String(obj.no_name);
    target = String(obj.nbr);
  }
  
  // Validate source and target
  if (!source || !target || source === '\\N' || target === '\\N') {
    return null;
  }
  
  // Only create edge if at least one endpoint exists in nodes
  // (The other might be created later or from another dataset)
  const hasValidEndpoint = nodeMap.has(source) || nodeMap.has(target);
  if (!hasValidEndpoint && nodeMap.size > 0) {
    // If we have nodes but neither endpoint matches, skip this edge
    return null;
  }
  
  const edgeData: EdgeData = {
    source,
    target,
  };
  
  // Add optional fields
  if (obj.layer) edgeData.layer = String(obj.layer);
  if (obj.label) edgeData.label = String(obj.label);
  if (obj.size !== undefined) edgeData.size = Number(obj.size);
  if (obj.color) edgeData.color = String(obj.color);
  if (obj.traffic_in !== undefined && String(obj.traffic_in) !== '\\N') {
    edgeData.traffic_in = Number(obj.traffic_in);
  }
  if (obj.traffic_out !== undefined && String(obj.traffic_out) !== '\\N') {
    edgeData.traffic_out = Number(obj.traffic_out);
  }
  
  // Copy other relevant fields
  Object.keys(obj).forEach(key => {
    if (!['source', 'target', 'ruas', 'nbr', 'no_name', 'layer', 'label', 'size', 'color', 
          'traffic_in', 'traffic_out'].includes(key)) {
      edgeData[key] = obj[key];
    }
  });
  
  return edgeData;
}

/**
 * Main function to normalize any JSON data into GraphInputData format
 */
export function normalizeJsonData(data: any): GraphInputData {
  // If data is already in the correct format
  if (data && typeof data === 'object' && Array.isArray(data.nodes)) {
    return {
      nodes: data.nodes,
      edges: data.edges || [],
    };
  }
  
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];
  
  // Convert data to array if it's not already
  let items: any[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === 'object' && data !== null) {
    // If it's a single object, wrap it in an array
    items = [data];
  } else {
    throw new Error('Invalid data format: expected object or array');
  }
  
  // First pass: extract all nodes
  items.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) return;
    
    if (isLikelyNode(item)) {
      const node = normalizeToNode(item, index);
      if (node) {
        nodes.push(node);
      }
    }
  });
  
  // Create a set of node hostnames for edge validation
  const nodeHostnames = new Set(nodes.map(n => n.hostname));
  
  // Second pass: extract all edges
  items.forEach((item) => {
    if (typeof item !== 'object' || item === null) return;
    
    if (isLikelyEdge(item)) {
      const edge = normalizeToEdge(item, nodeHostnames);
      if (edge) {
        edges.push(edge);
      }
    }
  });
  
  // If no nodes were found but we have data, try to create nodes from objects with any data
  if (nodes.length === 0 && items.length > 0) {
    items.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        // Try to create a basic node from any object
        const hostname = item.id || item.name || item.label || item.hostname || `Node-${index}`;
        if (hostname && hostname !== '\\N') {
          nodes.push({
            hostname: String(hostname),
            manufacture: item.manufacture || item.manufacturer || 'Unknown',
            model: item.model || 'Unknown',
            region: item.region || item.layer || item.location || 'Unknown',
            ...item,
          });
        }
      }
    });
  }
  
  return {
    nodes,
    edges,
  };
}

/**
 * Validates the normalized data
 */
export function validateNormalizedData(data: GraphInputData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.nodes || data.nodes.length === 0) {
    errors.push('No valid nodes found in the data');
  }
  
  if (data.nodes) {
    data.nodes.forEach((node, index) => {
      if (!node.hostname) {
        errors.push(`Node at index ${index} is missing hostname`);
      }
      if (!node.manufacture) {
        errors.push(`Node "${node.hostname || index}" is missing manufacture`);
      }
      if (!node.model) {
        errors.push(`Node "${node.hostname || index}" is missing model`);
      }
      if (!node.region) {
        errors.push(`Node "${node.hostname || index}" is missing region`);
      }
    });
  }
  
  if (data.edges) {
    data.edges.forEach((edge, index) => {
      if (!edge.source) {
        errors.push(`Edge at index ${index} is missing source`);
      }
      if (!edge.target) {
        errors.push(`Edge at index ${index} is missing target`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
