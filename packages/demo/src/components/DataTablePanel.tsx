import { useState } from "react";
import { FiDownload, FiFilter, FiX, FiLayers, FiLink } from "react-icons/fi";
import { NodesTable, EdgesTable } from "./DataTableContent";

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
  details?: any[];
  [key: string]: any;
}

interface RuasRekapData {
  nodes: NodeData[];
  edges: EdgeData[];
}

interface DataTablePanelProps {
  elements?: any[];
  ruasRekapData?: RuasRekapData | null;
  selectedRuasLayer?: string;
  onClose: () => void;
}

export function DataTablePanel({ elements = [], ruasRekapData, selectedRuasLayer, onClose }: DataTablePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"nodes" | "edges">("nodes");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const nodes = ruasRekapData?.nodes || [];
  const edges = ruasRekapData?.edges || [];

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredNodes = nodes.filter(
    (node: NodeData) =>
      String(node.id || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(node.label || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(node.platform || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(node.witel || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(node.layer || '')?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredEdges = edges.filter(
    (edge: EdgeData) =>
      String(edge.id || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(edge.source || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(edge.target || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(edge.source_label || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(edge.target_label || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(edge.ruas_list || '')?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const exportToCSV = () => {
    const dataToExport = activeTab === "nodes" ? filteredNodes : filteredEdges;
    
    if (dataToExport.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = Object.keys(dataToExport[0]).filter(key => key !== 'details');
    const csvContent = [
      headers.join(","),
      ...dataToExport.map((row: any) => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedRuasLayer || 'data'}_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showRuasTables = ruasRekapData && (nodes.length > 0 || edges.length > 0);

  return (
    <div style={{ position: "fixed", top: "16px", bottom: "16px", left: "16px", right: "16px", zIndex: 1000 }}>
      <div style={{
          height: "100%",
          background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(245,245,245,0.95))",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
          display: "flex",
          flexDirection: "column",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ padding: "20px", borderBottom: "2px solid rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1F2937", margin: 0, marginBottom: "4px" }}>
                {showRuasTables ? `${selectedRuasLayer || 'Ruas Rekap'} Layer Data` : 'Network Elements Data'}
              </h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                {showRuasTables 
                  ? `${nodes.length} nodes and ${edges.length} edges in this layer`
                  : `${elements.length} network elements`
                }
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={exportToCSV} style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                  borderRadius: "10px",
                  border: "none",
                  padding: "8px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.2s",
                }}
              >
                <FiDownload style={{ width: "16px", height: "16px" }} />
                <span>Export CSV</span>
              </button>
              <button onClick={onClose} style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  padding: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <FiX style={{ width: "18px", height: "18px", color: "#6B7280" }} />
              </button>
            </div>
          </div>

          {showRuasTables && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button onClick={() => setActiveTab("nodes")} style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: activeTab === "nodes" 
                    ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                    : "rgba(255,255,255,0.5)",
                  color: activeTab === "nodes" ? "white" : "#6B7280",
                  boxShadow: activeTab === "nodes" ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <FiLayers style={{ width: "16px", height: "16px" }} />
                <span>Nodes ({filteredNodes.length})</span>
              </button>
              <button onClick={() => setActiveTab("edges")} style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: activeTab === "edges" 
                    ? "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
                    : "rgba(255,255,255,0.5)",
                  color: activeTab === "edges" ? "white" : "#6B7280",
                  boxShadow: activeTab === "edges" ? "0 4px 12px rgba(139, 92, 246, 0.3)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <FiLink style={{ width: "16px", height: "16px" }} />
                <span>Edges ({filteredEdges.length})</span>
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                placeholder={showRuasTables 
                  ? (activeTab === "nodes" ? "Search nodes by ID, label, platform, witel..." : "Search edges by ID, source, target, ruas...")
                  : "Search by hostname, site, area..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "98%",
                  padding: "10px 14px",
                  fontSize: "14px",
                  border: "2px solid rgba(0,0,0,0.08)",
                  borderRadius: "10px",
                  outline: "none",
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  transition: "all 0.2s",
                }}
              />
            </div>
            <button style={{
                background: "white",
                borderRadius: "10px",
                border: "2px solid rgba(0,0,0,0.08)",
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#1F2937",
                transition: "all 0.2s",
              }}
            >
              <FiFilter style={{ width: "16px", height: "16px" }} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", background: "rgba(249,250,251,0.3)" }}>
          {showRuasTables ? (
            activeTab === "nodes" ? (
              <NodesTable nodes={filteredNodes} expandedRows={expandedRows} onToggleExpand={toggleRowExpansion} />
            ) : (
              <EdgesTable edges={filteredEdges} expandedRows={expandedRows} onToggleExpand={toggleRowExpansion} />
            )
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>No Ruas Rekap data available</p>
              <p style={{ fontSize: "12px" }}>Please select a Ruas layer from the left sidebar</p>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 20px", borderTop: "2px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.8)" }}>
          <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "13px",
              color: "#6B7280",
              fontWeight: "500",
            }}
          >
            <span>
              Showing {showRuasTables ? (activeTab === "nodes" ? filteredNodes.length : filteredEdges.length) : 0} of {showRuasTables ? (activeTab === "nodes" ? nodes.length : edges.length) : 0} {activeTab}
            </span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
