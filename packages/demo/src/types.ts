export interface NodeData {
  hostname: string;
  manufacture: string;
  model: string;
  region: string;
  slot: number;
  port_used: number;
  port_idle: number;
  percentage_used: number;
  latitude: number;
  longitude: number;
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
