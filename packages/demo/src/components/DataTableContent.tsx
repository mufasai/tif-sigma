import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useState, useMemo, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams } from "ag-grid-community";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface NodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  size?: number;
  layer?: string;
  platform?: string;
  reg?: string;
  witel?: string;
  types?: string;
  details?: any[];
  [key: string]: any;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  source_label?: string;
  target_label?: string;
  source_lon: number;
  source_lat: number;
  target_lon: number;
  target_lat: number;
  total_capacity?: number;
  layer_list?: string;
  ruas_list?: string;
  total_traffic_95_in?: number;
  total_traffic_95_out?: number;
  total_traffic_max_in?: number;
  total_traffic_max_out?: number;
  avg_utilization?: number;
  link_count?: number;
  jml_pisik?: number;
  jml_rec?: number;
  jmpsk?: number;
  source_port_count?: number;
  source_port_idle?: number;
  source_port_used?: number;
  target_port_count?: number;
  target_port_idle?: number;
  target_port_used?: number;
  traffic_max?: number;
  details?: any[];
  [key: string]: any;
}

interface NodesTableProps {
  nodes: NodeData[];
  expandedRows: Set<string>;
  onToggleExpand: (id: string) => void;
}

interface EdgesTableProps {
  edges: EdgeData[];
  expandedRows: Set<string>;
  onToggleExpand: (id: string) => void;
}

// Custom cell renderers for styling
const LayerCellRenderer = (params: ICellRendererParams) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "20px",
    padding: "0 10px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "500",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    color: "white",
    whiteSpace: "nowrap",
  }}>
    {params.value || "N/A"}
  </span>
);

const EdgeLayerCellRenderer = (params: ICellRendererParams) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "20px",
    padding: "0 10px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "500",
    background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
    color: "white",
    whiteSpace: "nowrap",
  }}>
    {params.value || "N/A"}
  </span>
);

const CoordinatesCellRenderer = (params: ICellRendererParams) => {
  const node = params.data as NodeData;
  return (
    <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#6B7280" }}>
      {node.x?.toFixed(4)}, {node.y?.toFixed(4)}
    </span>
  );
};

const SourceCellRenderer = (params: ICellRendererParams) => {
  const edge = params.data as EdgeData;
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.3" }}>
      <span style={{ color: "#3B82F6", fontWeight: "600", fontSize: "13px" }}>
        {edge.source_label || edge.source}
      </span>
      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{edge.source}</span>
    </div>
  );
};

const TargetCellRenderer = (params: ICellRendererParams) => {
  const edge = params.data as EdgeData;
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.3" }}>
      <span style={{ color: "#10B981", fontWeight: "600", fontSize: "13px" }}>
        {edge.target_label || edge.target}
      </span>
      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{edge.target}</span>
    </div>
  );
};

const CapacityCellRenderer = (params: ICellRendererParams) => {
  const edge = params.data as EdgeData;
  const hasDetails = edge.details && edge.details.length > 0;
  let totalCapacityMbps = 0;
  if (hasDetails) {
    totalCapacityMbps = (edge.details || []).reduce((sum: number, detail: any) => {
      const capacity = typeof detail.capacity === 'number' ? detail.capacity : 0;
      return sum + capacity;
    }, 0);
  } else {
    totalCapacityMbps = edge.total_capacity || 0;
  }
  const capacityGbps = totalCapacityMbps > 0 ? (totalCapacityMbps / 1000).toFixed(2) : "0";
  return (
    <span style={{ fontWeight: "700", color: "#8B5CF6" }}>
      {capacityGbps} Gbps
    </span>
  );
};

const TrafficMaxCellRenderer = (params: ICellRendererParams) => {
  const edge = params.data as EdgeData;
  const trafficMaxGbps = edge.traffic_max
    ? (edge.traffic_max / 1000000000).toFixed(2)
    : (edge.total_traffic_max_in
      ? (Math.max(edge.total_traffic_max_in, edge.total_traffic_max_out || 0) / 1000000000).toFixed(2)
      : "0");
  return (
    <span style={{ fontWeight: "600", color: "#6366F1" }}>
      {trafficMaxGbps} Gbps
    </span>
  );
};

const UtilizationCellRenderer = (params: ICellRendererParams) => {
  const utilization = params.value || 0;
  let utilizationColor = "#10B981";
  if (utilization > 80) utilizationColor = "#EF4444";
  else if (utilization > 60) utilizationColor = "#F59E0B";
  else if (utilization > 40) utilizationColor = "#FBBF24";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: "20px",
      padding: "0 8px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: "600",
      background: `${utilizationColor}20`,
      color: utilizationColor,
    }}>
      {utilization.toFixed(1)}%
    </span>
  );
};

const LinkCountCellRenderer = (params: ICellRendererParams) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "20px",
    padding: "0 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "600",
    background: "rgba(59, 130, 246, 0.1)",
    color: "#3B82F6",
  }}>
    {params.value || 1}
  </span>
);

// AG Grid custom theme styles
const gridStyles = `
  .ag-theme-custom {
    --ag-background-color: transparent;
    --ag-header-background-color: transparent;
    --ag-odd-row-background-color: rgba(249, 250, 251, 0.5);
    --ag-row-hover-color: rgba(59, 130, 246, 0.05);
    --ag-border-color: rgba(0, 0, 0, 0.06);
    --ag-header-foreground-color: #374151;
    --ag-foreground-color: #1F2937;
    --ag-font-size: 13px;
    --ag-row-border-color: rgba(0, 0, 0, 0.06);
    font-family: inherit;
  }
  .ag-theme-custom .ag-header {
    background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.95) 100%);
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .ag-theme-custom .ag-header-cell {
    padding: 14px 16px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid rgba(0,0,0,0.08) !important;
  }
  .ag-theme-custom .ag-cell {
    padding: 12px 16px;
    display: flex;
    align-items: center;
  }
  .ag-theme-custom .ag-row {
    border-bottom: 1px solid rgba(0,0,0,0.06);
    transition: all 0.2s;
  }
  .ag-theme-custom .ag-row:hover {
    background: rgba(59, 130, 246, 0.05) !important;
  }
  .ag-theme-custom-edge .ag-row:hover {
    background: rgba(139, 92, 246, 0.05) !important;
  }
  .ag-theme-custom .ag-cell-value {
    overflow: visible;
  }
  .ag-theme-custom .ag-paging-panel {
    border-top: 1px solid rgba(0,0,0,0.08);
    padding: 12px 16px;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(8px);
    font-size: 13px;
    color: #6B7280;
  }
  .ag-theme-custom .ag-paging-button {
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 6px;
    transition: all 0.2s;
  }
  .ag-theme-custom .ag-paging-button:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  .ag-theme-custom .ag-paging-page-size .ag-picker-field-wrapper {
    border-radius: 6px;
    border: 1px solid rgba(0,0,0,0.1);
    padding: 4px 8px;
  }
  .ag-theme-custom-edge .ag-paging-button:hover {
    background: rgba(139, 92, 246, 0.1);
  }
`;

export function NodesTable({ nodes, expandedRows, onToggleExpand }: NodesTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [detailSearchTerm, setDetailSearchTerm] = useState("");

  const DetailButtonRenderer = useCallback((params: ICellRendererParams) => {
    const node = params.data as NodeData;
    const hasDetails = node.details && node.details.length > 0;
    const isExpanded = expandedRows.has(node.id);

    if (!hasDetails) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand(node.id);
          setExpandedNodeId(isExpanded ? null : node.id);
        }}
        style={{
          background: isExpanded ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" : "rgba(59, 130, 246, 0.1)",
          border: "none",
          borderRadius: "6px",
          padding: "6px 12px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          fontWeight: "600",
          color: isExpanded ? "white" : "#3B82F6",
          transition: "all 0.2s",
        }}
      >
        {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
        <span>{node.details?.length || 0} items</span>
      </button>
    );
  }, [expandedRows, onToggleExpand]);

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: "id",
      headerName: "Node ID",
      flex: 0.8,
      minWidth: 70,
      cellStyle: { fontFamily: "monospace", fontWeight: "600", fontSize: "11px" } as any
    },
    { field: "label", headerName: "Label", flex: 1.5, minWidth: 120, valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "12px" } as any },
    { field: "layer", headerName: "Layer", flex: 0.8, minWidth: 80, cellRenderer: LayerCellRenderer },
    { field: "platform", headerName: "Platform", flex: 0.8, minWidth: 70, valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "11px", color: "#6B7280" } as any },
    { field: "reg", headerName: "Region", flex: 0.7, minWidth: 60, valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "11px", color: "#6B7280" } as any },
    { field: "witel", headerName: "Witel", flex: 1, minWidth: 90, valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "12px" } as any },
    { field: "types", headerName: "Type", flex: 0.6, minWidth: 50, valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "11px", color: "#6B7280" } as any },
    { field: "coordinates", headerName: "Coordinates", flex: 1.2, minWidth: 120, cellRenderer: CoordinatesCellRenderer },
    { field: "details", headerName: "Details", flex: 0.8, minWidth: 80, cellRenderer: DetailButtonRenderer },
  ], [DetailButtonRenderer]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  const expandedNode = useMemo(() => {
    if (!expandedNodeId) return null;
    return nodes.find(n => n.id === expandedNodeId);
  }, [expandedNodeId, nodes]);

  const filteredDetails = useMemo(() => {
    if (!expandedNode?.details) return [];
    if (!detailSearchTerm) return expandedNode.details;
    return expandedNode.details.filter((detail: any) =>
      Object.values(detail).some(value =>
        String(value).toLowerCase().includes(detailSearchTerm.toLowerCase())
      )
    );
  }, [expandedNode, detailSearchTerm]);

  const detailColumnDefs = useMemo<ColDef[]>(() => {
    if (!expandedNode?.details?.[0]) return [];
    return Object.keys(expandedNode.details[0]).map(key => ({
      field: key,
      headerName: key.replace(/_/g, " ").toUpperCase(),
      flex: 1,
      valueFormatter: (p) => String(p.value ?? ""),
    }));
  }, [expandedNode]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <style>{gridStyles}</style>
      <div className="ag-theme-custom" style={{ flex: expandedNodeId ? "0 0 50%" : 1, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={nodes}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection="single"
          getRowId={(params) => params.data.id}
          suppressCellFocus={true}
          pagination={true}
          paginationPageSize={8}
          paginationPageSizeSelector={[8, 16, 32, 50]}
          rowHeight={45}
        />
      </div>

      {expandedNodeId && expandedNode && (
        <div style={{
          flex: "0 0 50%",
          padding: "16px",
          borderTop: "4px solid #3B82F6",
          background: "rgba(59, 130, 246, 0.02)",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#1F2937", margin: 0 }}>
              Node Details ({expandedNode.details?.length || 0} items)
            </h4>
            <input
              type="text"
              placeholder="Search in details..."
              value={detailSearchTerm}
              onChange={(e) => setDetailSearchTerm(e.target.value)}
              style={{
                flex: 1,
                maxWidth: "400px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.1)",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <button
              onClick={() => {
                setExpandedNodeId(null);
                onToggleExpand(expandedNodeId);
              }}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                color: "#EF4444",
              }}
            >
              Close
            </button>
          </div>
          <div className="ag-theme-custom" style={{ flex: 1 }}>
            <AgGridReact
              rowData={filteredDetails}
              columnDefs={detailColumnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function EdgesTable({ edges, expandedRows, onToggleExpand }: EdgesTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [expandedEdgeId, setExpandedEdgeId] = useState<string | null>(null);
  const [detailSearchTerm, setDetailSearchTerm] = useState("");

  const DetailButtonRenderer = useCallback((params: ICellRendererParams) => {
    const edge = params.data as EdgeData;
    const hasDetails = edge.details && edge.details.length > 0;
    const isExpanded = expandedRows.has(edge.id);

    if (!hasDetails) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand(edge.id);
          setExpandedEdgeId(isExpanded ? null : edge.id);
        }}
        style={{
          background: isExpanded ? "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" : "rgba(139, 92, 246, 0.1)",
          border: "none",
          borderRadius: "6px",
          padding: "6px 12px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          fontWeight: "600",
          color: isExpanded ? "white" : "#8B5CF6",
          transition: "all 0.2s",
        }}
      >
        {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
        <span>{edge.details?.length || 0} items</span>
      </button>
    );
  }, [expandedRows, onToggleExpand]);

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: "id",
      headerName: "Edge ID",
      width: 60,
      cellStyle: { fontFamily: "monospace", fontWeight: "600", fontSize: "10px" } as any
    },
    { field: "source", headerName: "Source", width: 100, cellRenderer: SourceCellRenderer },
    { field: "target", headerName: "Target", width: 210, cellRenderer: TargetCellRenderer },
    { field: "ruas_list", headerName: "Ruas", width: 160, valueFormatter: (p) => p.value || "N/A", cellStyle: { color: "#6B7280", fontSize: "11px" } as any },
    { field: "layer_list", headerName: "Layer", width: 110, cellRenderer: EdgeLayerCellRenderer },
    { field: "capacity", headerName: "Capacity", width: 180, cellRenderer: CapacityCellRenderer },
    { field: "traffic_max", headerName: "Traffic Max", width: 110, cellRenderer: TrafficMaxCellRenderer },
    { field: "avg_utilization", headerName: "Utilization", width: 100, cellRenderer: UtilizationCellRenderer },
    { field: "link_count", headerName: "Links", width: 90, cellRenderer: LinkCountCellRenderer },
    { field: "details", headerName: "Details", width: 100, cellRenderer: DetailButtonRenderer },
  ], [DetailButtonRenderer]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    suppressSizeToFit: true,
  }), []);

  const expandedEdge = useMemo(() => {
    if (!expandedEdgeId) return null;
    return edges.find(e => e.id === expandedEdgeId);
  }, [expandedEdgeId, edges]);

  const filteredDetails = useMemo(() => {
    if (!expandedEdge?.details) return [];
    if (!detailSearchTerm) return expandedEdge.details;
    return expandedEdge.details.filter((detail: any) =>
      Object.values(detail).some(value =>
        String(value).toLowerCase().includes(detailSearchTerm.toLowerCase())
      )
    );
  }, [expandedEdge, detailSearchTerm]);

  const detailColumnDefs = useMemo<ColDef[]>(() => {
    if (!expandedEdge?.details?.[0]) return [];
    return Object.keys(expandedEdge.details[0]).map(key => ({
      field: key,
      headerName: key.replace(/_/g, " ").toUpperCase(),
      flex: 1,
      valueFormatter: (p) => String(p.value ?? ""),
    }));
  }, [expandedEdge]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <style>{gridStyles}</style>
      <div className="ag-theme-custom ag-theme-custom-edge" style={{ flex: expandedEdgeId ? "0 0 50%" : 1, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={edges}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection="single"
          getRowId={(params) => params.data.id}
          suppressCellFocus={true}
          pagination={true}
          paginationPageSize={8}
          paginationPageSizeSelector={[8, 16, 32, 50]}
          rowHeight={56}
        />
      </div>

      {expandedEdgeId && expandedEdge && (
        <div style={{
          flex: "0 0 50%",
          padding: "16px",
          borderTop: "4px solid #8B5CF6",
          background: "rgba(139, 92, 246, 0.02)",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#1F2937", margin: 0 }}>
              Edge Details ({expandedEdge.details?.length || 0} physical links)
            </h4>
            <input
              type="text"
              placeholder="Search in details..."
              value={detailSearchTerm}
              onChange={(e) => setDetailSearchTerm(e.target.value)}
              style={{
                flex: 1,
                maxWidth: "400px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.1)",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <button
              onClick={() => {
                setExpandedEdgeId(null);
                onToggleExpand(expandedEdgeId);
              }}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                color: "#EF4444",
              }}
            >
              Close
            </button>
          </div>
          <div className="ag-theme-custom ag-theme-custom-edge" style={{ flex: 1 }}>
            <AgGridReact
              rowData={filteredDetails}
              columnDefs={detailColumnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
