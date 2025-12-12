import { FiChevronDown, FiChevronRight, FiScissors, FiCopy, FiClipboard, FiDownload, FiChevronRight as FiArrow } from "react-icons/fi";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams, CellContextMenuEvent } from "ag-grid-community";

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

// Custom drag handle renderer
const DragHandleCellRenderer = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    cursor: "grab",
  }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 4px)",
      gap: "3px",
    }}>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#9CA3AF",
          }}
        />
      ))}
    </div>
  </div>
);

// Context Menu Component
interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onCopyWithHeaders: () => void;
  onExportCsv: () => void;
}

const ContextMenu = ({ x, y, onClose, onCopy, onCopyWithHeaders, onExportCsv }: ContextMenuProps) => {
  const [showExportSubmenu, setShowExportSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#E5E7EB",
    transition: "background 0.15s",
    background: "transparent",
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: x,
        top: y,
        background: "#374151",
        borderRadius: "8px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        minWidth: "220px",
        zIndex: 9999,
        overflow: "visible",
        border: "1px solid #4B5563",
      }}
    >
      <div
        style={menuItemStyle}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#4B5563")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        onClick={() => { onCopy(); onClose(); }}
      >
        <FiScissors size={16} />
        <span>Cut</span>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9CA3AF" }}>⌘X</span>
      </div>
      <div
        style={menuItemStyle}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#4B5563")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        onClick={() => { onCopy(); onClose(); }}
      >
        <FiCopy size={16} />
        <span>Copy</span>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9CA3AF" }}>⌘C</span>
      </div>
      <div
        style={menuItemStyle}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#4B5563")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        onClick={() => { onCopyWithHeaders(); onClose(); }}
      >
        <FiCopy size={16} />
        <span>Copy with Headers</span>
      </div>
      <div
        style={menuItemStyle}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#4B5563")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        onClick={() => { onClose(); }}
      >
        <FiClipboard size={16} />
        <span>Paste</span>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9CA3AF" }}>⌘V</span>
      </div>
      <div style={{ height: "1px", background: "#4B5563", margin: "4px 0" }} />
      <div
        style={{ ...menuItemStyle, position: "relative" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#4B5563"; setShowExportSubmenu(true); }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; setShowExportSubmenu(false); }}
      >
        <FiDownload size={16} />
        <span>Export</span>
        <FiArrow size={14} style={{ marginLeft: "auto" }} />
        {showExportSubmenu && (
          <div
            style={{
              position: "absolute",
              left: "100%",
              top: "-1px",
              background: "#374151",
              borderRadius: "8px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              minWidth: "150px",
              border: "1px solid #4B5563",
              overflow: "hidden",
            }}
            onMouseEnter={() => setShowExportSubmenu(true)}
            onMouseLeave={() => setShowExportSubmenu(false)}
          >
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4B5563")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => { onExportCsv(); onClose(); }}
            >
              <span>CSV Export</span>
            </div>
            <div
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4B5563")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => { onExportCsv(); onClose(); }}
            >
              <span>Excel Export</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Side Panel Component for Column Management
interface SidePanelProps {
  columns: { field: string; headerName: string; visible: boolean }[];
  onToggleColumn: (field: string) => void;
  activeTab: "columns" | "filters" | null;
  onTabChange: (tab: "columns" | "filters" | null) => void;
}

const SidePanel = ({ columns, onToggleColumn, activeTab, onTabChange }: SidePanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColumns = columns.filter(col =>
    col.headerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Panel Content */}
      {activeTab && (
        <div style={{
          width: "250px",
          height: "100%",
          background: "#1F2937",
          borderLeft: "1px solid #374151",
          display: "flex",
          flexDirection: "column",
          color: "#E5E7EB",
        }}>
          {activeTab === "columns" && (
            <div style={{ flex: 1, overflow: "auto", padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>Columns</span>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "#374151",
                  border: "1px solid #4B5563",
                  borderRadius: "6px",
                  color: "#E5E7EB",
                  fontSize: "12px",
                  marginBottom: "12px",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {filteredColumns.map((col) => (
                  <label
                    key={col.field}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#374151")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => onToggleColumn(col.field)}
                      style={{ accentColor: "#3B82F6", width: "14px", height: "14px" }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 3px)", gap: "2px" }}>
                      {[...Array(6)].map((_, i) => (
                        <div key={i} style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#6B7280" }} />
                      ))}
                    </div>
                    <span>{col.headerName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "filters" && (
            <div style={{ flex: 1, padding: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>Filters</div>
              <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Use the filter inputs in each column header.</p>
            </div>
          )}
        </div>
      )}

      {/* Vertical Tab Buttons */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        background: "#F3F4F6",
        borderLeft: "1px solid #E5E7EB",
      }}>
        <button
          onClick={() => onTabChange(activeTab === "columns" ? null : "columns")}
          style={{
            padding: "12px 8px",
            background: activeTab === "columns" ? "#1F2937" : "transparent",
            border: "none",
            color: activeTab === "columns" ? "#E5E7EB" : "#374151",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "600",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "14px" }}>☰</span>
          Columns
        </button>
        <button
          onClick={() => onTabChange(activeTab === "filters" ? null : "filters")}
          style={{
            padding: "12px 8px",
            background: activeTab === "filters" ? "#1F2937" : "transparent",
            border: "none",
            color: activeTab === "filters" ? "#E5E7EB" : "#374151",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "600",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "14px" }}>▼</span>
          Filters
        </button>
      </div>
    </div>
  );
};

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"columns" | "filters" | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true, label: true, layer: true, platform: true, reg: true, witel: true, types: true, coordinates: true, details: true
  });

  const handleCellContextMenu = useCallback((event: CellContextMenuEvent) => {
    event.event?.preventDefault();
    const mouseEvent = event.event as MouseEvent;
    setContextMenu({ x: mouseEvent.clientX, y: mouseEvent.clientY });
  }, []);

  const handleCopy = useCallback(() => {
    gridRef.current?.api.copySelectedRowsToClipboard();
  }, []);

  const handleCopyWithHeaders = useCallback(() => {
    gridRef.current?.api.copySelectedRowsToClipboard({ includeHeaders: true });
  }, []);

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv();
  }, []);

  const handleToggleColumn = useCallback((field: string) => {
    setColumnVisibility(prev => {
      const newVisibility = { ...prev, [field]: !prev[field] };
      // Update AG Grid column visibility
      if (gridRef.current?.api) {
        gridRef.current.api.setColumnsVisible([field], !prev[field]);
      }
      return newVisibility;
    });
  }, []);

  const sidePanelColumns = useMemo(() => [
    { field: "id", headerName: "Node ID", visible: columnVisibility.id },
    { field: "label", headerName: "Label", visible: columnVisibility.label },
    { field: "layer", headerName: "Layer", visible: columnVisibility.layer },
    { field: "platform", headerName: "Platform", visible: columnVisibility.platform },
    { field: "reg", headerName: "Region", visible: columnVisibility.reg },
    { field: "witel", headerName: "Witel", visible: columnVisibility.witel },
    { field: "types", headerName: "Type", visible: columnVisibility.types },
    { field: "coordinates", headerName: "Coordinates", visible: columnVisibility.coordinates },
    { field: "details", headerName: "Details", visible: columnVisibility.details },
  ], [columnVisibility]);

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
      headerName: "",
      width: 40,
      rowDrag: true,
      filter: false,
      sortable: false,
      suppressHeaderMenuButton: true,
      floatingFilter: false,
      cellRenderer: DragHandleCellRenderer,
      cellStyle: { padding: 0 } as any,
    },
    {
      field: "id",
      headerName: "Node ID",
      flex: 0.8,
      minWidth: 70,
      filter: "agTextColumnFilter",
      cellStyle: { fontFamily: "monospace", fontWeight: "600", fontSize: "11px" } as any
    },
    { field: "label", headerName: "Label", flex: 1.5, minWidth: 120, filter: "agTextColumnFilter", valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "12px" } as any },
    { field: "layer", headerName: "Layer", flex: 0.8, minWidth: 80, filter: "agTextColumnFilter", cellRenderer: LayerCellRenderer },
    { field: "platform", headerName: "Platform", flex: 0.8, minWidth: 70, filter: "agTextColumnFilter", valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "11px", color: "#6B7280" } as any },
    { field: "reg", headerName: "Region", flex: 0.7, minWidth: 60, filter: "agTextColumnFilter", valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "11px", color: "#6B7280" } as any },
    { field: "witel", headerName: "Witel", flex: 1, minWidth: 90, filter: "agTextColumnFilter", valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "12px" } as any },
    { field: "types", headerName: "Type", flex: 0.6, minWidth: 50, filter: "agTextColumnFilter", valueFormatter: (p) => p.value || "N/A", cellStyle: { fontSize: "11px", color: "#6B7280" } as any },
    { field: "coordinates", headerName: "Coordinates", flex: 1.2, minWidth: 120, filter: false, cellRenderer: CoordinatesCellRenderer },
    { field: "details", headerName: "Details", flex: 0.8, minWidth: 80, filter: false, floatingFilter: false, cellRenderer: DetailButtonRenderer },
  ], [DetailButtonRenderer]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
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
    <div style={{ height: "100%", display: "flex", flexDirection: "row" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <style>{gridStyles}</style>
        <div className="ag-theme-custom" style={{ flex: expandedNodeId ? "0 0 50%" : 1, width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={nodes}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowSelection="multiple"
            getRowId={(params) => params.data.id}
            suppressCellFocus={true}
            pagination={true}
            paginationPageSize={8}
            paginationPageSizeSelector={[8, 16, 32, 50]}
            rowHeight={45}
            rowDragManaged={true}
            rowDragEntireRow={true}
            onCellContextMenu={handleCellContextMenu}
            preventDefaultOnContextMenu={true}
          />
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onCopy={handleCopy}
            onCopyWithHeaders={handleCopyWithHeaders}
            onExportCsv={handleExportCsv}
          />
        )}

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

      {/* Side Panel */}
      <SidePanel
        columns={sidePanelColumns}
        onToggleColumn={handleToggleColumn}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

export function EdgesTable({ edges, expandedRows, onToggleExpand }: EdgesTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [expandedEdgeId, setExpandedEdgeId] = useState<string | null>(null);
  const [detailSearchTerm, setDetailSearchTerm] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"columns" | "filters" | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true, source: true, target: true, ruas_list: true, layer_list: true, capacity: true, traffic_max: true, avg_utilization: true, link_count: true, details: true
  });

  const handleCellContextMenu = useCallback((event: CellContextMenuEvent) => {
    event.event?.preventDefault();
    const mouseEvent = event.event as MouseEvent;
    setContextMenu({ x: mouseEvent.clientX, y: mouseEvent.clientY });
  }, []);

  const handleCopy = useCallback(() => {
    gridRef.current?.api.copySelectedRowsToClipboard();
  }, []);

  const handleCopyWithHeaders = useCallback(() => {
    gridRef.current?.api.copySelectedRowsToClipboard({ includeHeaders: true });
  }, []);

  const handleExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv();
  }, []);

  const handleToggleColumn = useCallback((field: string) => {
    setColumnVisibility(prev => {
      const newVisibility = { ...prev, [field]: !prev[field] };
      if (gridRef.current?.api) {
        gridRef.current.api.setColumnsVisible([field], !prev[field]);
      }
      return newVisibility;
    });
  }, []);

  const sidePanelColumns = useMemo(() => [
    { field: "id", headerName: "Edge ID", visible: columnVisibility.id },
    { field: "source", headerName: "Source", visible: columnVisibility.source },
    { field: "target", headerName: "Target", visible: columnVisibility.target },
    { field: "ruas_list", headerName: "Ruas", visible: columnVisibility.ruas_list },
    { field: "layer_list", headerName: "Layer", visible: columnVisibility.layer_list },
    { field: "capacity", headerName: "Capacity", visible: columnVisibility.capacity },
    { field: "traffic_max", headerName: "Traffic Max", visible: columnVisibility.traffic_max },
    { field: "avg_utilization", headerName: "Utilization", visible: columnVisibility.avg_utilization },
    { field: "link_count", headerName: "Links", visible: columnVisibility.link_count },
    { field: "details", headerName: "Details", visible: columnVisibility.details },
  ], [columnVisibility]);

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
      headerName: "",
      width: 40,
      rowDrag: true,
      filter: false,
      sortable: false,
      suppressHeaderMenuButton: true,
      floatingFilter: false,
      cellRenderer: DragHandleCellRenderer,
      cellStyle: { padding: 0 } as any,
    },
    {
      field: "id",
      headerName: "Edge ID",
      width: 60,
      filter: "agTextColumnFilter",
      cellStyle: { fontFamily: "monospace", fontWeight: "600", fontSize: "10px" } as any
    },
    { field: "source", headerName: "Source", width: 100, filter: "agTextColumnFilter", filterValueGetter: (p) => p.data?.source_label || p.data?.source, cellRenderer: SourceCellRenderer },
    { field: "target", headerName: "Target", width: 210, filter: "agTextColumnFilter", filterValueGetter: (p) => p.data?.target_label || p.data?.target, cellRenderer: TargetCellRenderer },
    { field: "ruas_list", headerName: "Ruas", width: 160, filter: "agTextColumnFilter", valueFormatter: (p) => p.value || "N/A", cellStyle: { color: "#6B7280", fontSize: "11px" } as any },
    { field: "layer_list", headerName: "Layer", width: 110, filter: "agTextColumnFilter", cellRenderer: EdgeLayerCellRenderer },
    { field: "capacity", headerName: "Capacity", width: 180, filter: "agNumberColumnFilter", cellRenderer: CapacityCellRenderer },
    { field: "traffic_max", headerName: "Traffic Max", width: 110, filter: "agNumberColumnFilter", cellRenderer: TrafficMaxCellRenderer },
    { field: "avg_utilization", headerName: "Utilization", width: 100, filter: "agNumberColumnFilter", cellRenderer: UtilizationCellRenderer },
    { field: "link_count", headerName: "Links", width: 90, filter: "agNumberColumnFilter", cellRenderer: LinkCountCellRenderer },
    { field: "details", headerName: "Details", width: 100, filter: false, floatingFilter: false, cellRenderer: DetailButtonRenderer },
  ], [DetailButtonRenderer]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    suppressSizeToFit: true,
    floatingFilter: true,
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
    <div style={{ height: "100%", display: "flex", flexDirection: "row" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <style>{gridStyles}</style>
        <div className="ag-theme-custom ag-theme-custom-edge" style={{ flex: expandedEdgeId ? "0 0 50%" : 1, width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={edges}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowSelection="multiple"
            getRowId={(params) => params.data.id}
            suppressCellFocus={true}
            pagination={true}
            paginationPageSize={8}
            paginationPageSizeSelector={[8, 16, 32, 50]}
            rowHeight={56}
            rowDragManaged={true}
            rowDragEntireRow={true}
            onCellContextMenu={handleCellContextMenu}
            preventDefaultOnContextMenu={true}
          />
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onCopy={handleCopy}
            onCopyWithHeaders={handleCopyWithHeaders}
            onExportCsv={handleExportCsv}
          />
        )}

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

      {/* Side Panel */}
      <SidePanel
        columns={sidePanelColumns}
        onToggleColumn={handleToggleColumn}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
