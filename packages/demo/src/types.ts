/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NodeData {
  hostname: string;
  manufacture: string;
  model: string;
  region: string;
  slot?: number;
  port_used?: number;
  port_idle?: number;
  percentage_used?: number;
  latitude?: number;
  longitude?: number;
  [key: string]: any; // Allow dynamic fields
}

export interface EdgeData {
  source: string;
  target: string;
  size?: number;
  color?: string;
  label?: string;
  layer?: string;
  traffic_in?: number;
  traffic_out?: number;
  [key: string]: any; // Allow dynamic fields
}

export interface GraphInputData {
  nodes: NodeData[];
  edges?: EdgeData[];
}

// For raw data from various sources
export interface RawDataItem {
  // Node-related fields
  hostname?: string;
  no_name?: string;
  id?: string;
  name?: string;
  label?: string;
  manufacture?: string;
  manufacturer?: string;
  model?: string;
  region?: string;
  latitude?: number;
  lat?: number;
  longitude?: number;
  lon?: number;
  lng?: number;
  
  // Edge-related fields
  source?: string;
  target?: string;
  ruas?: string;
  nbr?: string;
  layer?: string;
  traffic_in?: number;
  traffic_out?: number;
  
  [key: string]: any;
}

export interface Cluster {
  key: string;
  color: string;
  clusterLabel: string;
}

export interface Tag {
  key: string;
  image: string;
}

export interface Dataset {
  nodes: NodeData[];
  edges?: [string, string][];
  clusters?: Cluster[];
  tags?: Tag[];
}

export interface FiltersState {
  manufactures: Record<string, boolean>;
  regions: Record<string, boolean>;
  models: Record<string, boolean>;
}


export interface NetworkElement {
  ne_id: string;
  hostname: string;
  site_name: string;
  area: string;
  lat: number;
  long: number;
  ospf: string;
  ip_address: string;
  device_type: string;
  vendor: string;
  managed_by: string;
  network_interface: string;
  active_status: number;
  uplink_ne?: string;
  port?: string;
  software_version?: string;
  project?: string;
  deployment?: string;
  update?: string;
  remark?: string;
}

export interface AreaConnection {
  from: string;
  to: string;
  totalCapacity: number;
  linkCount: number;
  utilization: number;
  coords: {
    from: [number, number];
    to: [number, number];
  };
}
