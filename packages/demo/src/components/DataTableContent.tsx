import { FiChevronDown, FiChevronRight, FiSearch } from "react-icons/fi";
import { useState } from "react";

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

export function NodesTable({ nodes, expandedRows, onToggleExpand }: NodesTableProps) {
  const [detailSearchTerms, setDetailSearchTerms] = useState<Record<string, string>>({});

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead style={{
          position: "sticky",
          top: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.95) 100%)",
          backdropFilter: "blur(8px)",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <tr>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Node ID
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Label
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Layer
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Platform
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Region
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Witel
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Type
          </th>
          <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Coordinates
          </th>
          <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Details
          </th>
        </tr>
      </thead>
      <tbody>
        {nodes.map((node, index) => {
          const isExpanded = expandedRows.has(node.id);
          const hasDetails = node.details && node.details.length > 0;
          
          return (
            <>
              <tr key={node.id} style={{
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  background: index % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(249,250,251,0.5)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(249,250,251,0.5)";
                }}
              >
                <td style={{ padding: "12px 16px", fontSize: "13px", fontFamily: "monospace", color: "#1F2937", fontWeight: "600" }}>
                  {node.id}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#1F2937", fontWeight: "500" }}>
                  {node.label || "N/A"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                  <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      color: "white",
                      boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    {node.layer || "N/A"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#1F2937" }}>
                  {node.platform || "N/A"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#1F2937" }}>
                  REG {node.reg || "N/A"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#1F2937" }}>
                  {node.witel || "N/A"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#1F2937" }}>
                  {node.types || "N/A"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "11px", fontFamily: "monospace", color: "#6B7280", textAlign: "center" }}>
                  {node.x.toFixed(4)}, {node.y.toFixed(4)}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  {hasDetails && (
                    <button
                      onClick={() => onToggleExpand(node.id)}
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
                  )}
                </td>
              </tr>
              {isExpanded && hasDetails && (
                <tr>
                  <td colSpan={9} style={{ padding: "0", background: "rgba(59, 130, 246, 0.02)" }}>
                    <div style={{ padding: "16px", borderLeft: "4px solid #3B82F6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#1F2937", margin: 0, whiteSpace: "nowrap" }}>
                          Node Details ({node.details?.length || 0} items)
                        </h4>
                        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                          <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: "16px", height: "16px" }} />
                          <input
                            type="text"
                            placeholder="Search in details..."
                            value={detailSearchTerms[node.id] || ""}
                            onChange={(e) => setDetailSearchTerms({ ...detailSearchTerms, [node.id]: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "8px 12px 8px 36px",
                              borderRadius: "8px",
                              border: "1px solid rgba(0,0,0,0.1)",
                              fontSize: "12px",
                              outline: "none",
                              transition: "all 0.2s"
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = "#3B82F6";
                              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ overflowX: "auto", overflowY: "visible", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.06)", maxHeight: "500px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                          <thead style={{ background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)" }}>
                            <tr>
                              {node.details && node.details.length > 0 && Object.keys(node.details[0]).map((key) => (
                                <th key={key} style={{
                                  padding: "10px 12px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "#475569",
                                  textAlign: "left",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  borderBottom: "2px solid rgba(0,0,0,0.06)",
                                  whiteSpace: "nowrap"
                                }}>
                                  {key.replace(/_/g, " ")}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(node.details || [])
                              .filter((detail: any) => {
                                const searchTerm = (detailSearchTerms[node.id] || "").toLowerCase();
                                if (!searchTerm) return true;
                                return Object.values(detail).some(value => 
                                  String(value).toLowerCase().includes(searchTerm)
                                );
                              })
                              .map((detail: any, idx: number) => (
                              <tr key={idx} style={{
                                borderBottom: "1px solid rgba(0,0,0,0.04)",
                                background: idx % 2 === 0 ? "white" : "rgba(249,250,251,0.5)",
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = idx % 2 === 0 ? "white" : "rgba(249,250,251,0.5)";
                              }}
                              >
                                {Object.entries(detail).map(([key, value]) => (
                                  <td key={key} style={{
                                    padding: "10px 12px",
                                    fontSize: "12px",
                                    color: "#1F2937",
                                    whiteSpace: "nowrap"
                                  }}>
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {(node.details || []).filter((detail: any) => {
                        const searchTerm = (detailSearchTerms[node.id] || "").toLowerCase();
                        if (!searchTerm) return true;
                        return Object.values(detail).some(value => 
                          String(value).toLowerCase().includes(searchTerm)
                        );
                      }).length === 0 && detailSearchTerms[node.id] && (
                        <div style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#6B7280",
                          fontSize: "13px",
                          background: "white",
                          borderRadius: "8px",
                          marginTop: "8px"
                        }}>
                          No results found for "{detailSearchTerms[node.id]}"
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </>
          );
        })}
      </tbody>
    </table>
  );
}


export function EdgesTable({ edges, expandedRows, onToggleExpand }: EdgesTableProps) {
  const [detailSearchTerms, setDetailSearchTerms] = useState<Record<string, string>>({});

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead style={{
          position: "sticky",
          top: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.95) 100%)",
          backdropFilter: "blur(8px)",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <tr>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Edge ID
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Source
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Target
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Ruas
          </th>
          <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Layer
          </th>
          <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Capacity
          </th>
          <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Traffic In
          </th>
          <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Traffic Out
          </th>
          <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Utilization
          </th>
          <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Links
          </th>
          <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#374151", borderBottom: "2px solid rgba(0,0,0,0.08)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Details
          </th>
        </tr>
      </thead>
      <tbody>
        {edges.map((edge, index) => {
          const isExpanded = expandedRows.has(edge.id);
          const hasDetails = edge.details && edge.details.length > 0;
          const capacityGbps = edge.total_capacity ? (edge.total_capacity / 1000000000).toFixed(2) : "N/A";
          const trafficInGbps = edge.total_traffic_95_in ? (edge.total_traffic_95_in / 1000000000).toFixed(2) : "0";
          const trafficOutGbps = edge.total_traffic_95_out ? (edge.total_traffic_95_out / 1000000000).toFixed(2) : "0";
          const utilization = edge.avg_utilization || 0;
          
          let utilizationColor = "#10B981";
          if (utilization > 80) utilizationColor = "#EF4444";
          else if (utilization > 60) utilizationColor = "#F59E0B";
          else if (utilization > 40) utilizationColor = "#FBBF24";
          
          return (
            <>
              <tr key={edge.id} style={{
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  background: index % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(249,250,251,0.5)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(249,250,251,0.5)";
                }}
              >
                <td style={{ padding: "12px 16px", fontSize: "11px", fontFamily: "monospace", color: "#1F2937", fontWeight: "600" }}>
                  {edge.id}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#1F2937", fontWeight: "500" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ color: "#3B82F6", fontWeight: "600" }}>{edge.source_label || edge.source}</span>
                    <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "monospace" }}>{edge.source}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#1F2937", fontWeight: "500" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ color: "#10B981", fontWeight: "600" }}>{edge.target_label || edge.target}</span>
                    <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "monospace" }}>{edge.target}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280" }}>
                  {edge.ruas_list || "N/A"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                  <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                      color: "white",
                      boxShadow: "0 2px 4px rgba(139, 92, 246, 0.2)",
                    }}
                  >
                    {edge.layer_list || "N/A"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "700", color: "#8B5CF6", textAlign: "right" }}>
                  {capacityGbps} Gbps
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#3B82F6", textAlign: "right" }}>
                  {trafficInGbps} Gbps
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#10B981", textAlign: "right" }}>
                  {trafficOutGbps} Gbps
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      background: `${utilizationColor}20`,
                      color: utilizationColor,
                    }}
                  >
                    {utilization.toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "#3B82F6",
                    }}
                  >
                    {edge.link_count || 1}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  {hasDetails && (
                    <button
                      onClick={() => onToggleExpand(edge.id)}
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
                  )}
                </td>
              </tr>
              {isExpanded && hasDetails && (
                <tr>
                  <td colSpan={11} style={{ padding: "0", background: "rgba(139, 92, 246, 0.02)" }}>
                    <div style={{ padding: "16px", borderLeft: "4px solid #8B5CF6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#1F2937", margin: 0, whiteSpace: "nowrap" }}>
                          Edge Details ({edge.details?.length || 0} physical links)
                        </h4>
                        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                          <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: "16px", height: "16px" }} />
                          <input
                            type="text"
                            placeholder="Search in details..."
                            value={detailSearchTerms[edge.id] || ""}
                            onChange={(e) => setDetailSearchTerms({ ...detailSearchTerms, [edge.id]: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "8px 12px 8px 36px",
                              borderRadius: "8px",
                              border: "1px solid rgba(0,0,0,0.1)",
                              fontSize: "12px",
                              outline: "none",
                              transition: "all 0.2s"
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = "#8B5CF6";
                              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ overflowX: "auto", overflowY: "visible", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.06)", maxHeight: "500px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
                          <thead style={{ background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)" }}>
                            <tr>
                              {edge.details && edge.details.length > 0 && Object.keys(edge.details[0]).map((key) => (
                                <th key={key} style={{
                                  padding: "10px 12px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "#475569",
                                  textAlign: "left",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  borderBottom: "2px solid rgba(0,0,0,0.06)",
                                  whiteSpace: "nowrap"
                                }}>
                                  {key.replace(/_/g, " ")}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(edge.details || [])
                              .filter((detail: any) => {
                                const searchTerm = (detailSearchTerms[edge.id] || "").toLowerCase();
                                if (!searchTerm) return true;
                                return Object.values(detail).some(value => 
                                  String(value).toLowerCase().includes(searchTerm)
                                );
                              })
                              .map((detail: any, idx: number) => (
                              <tr key={idx} style={{
                                borderBottom: "1px solid rgba(0,0,0,0.04)",
                                background: idx % 2 === 0 ? "white" : "rgba(249,250,251,0.5)",
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(139, 92, 246, 0.05)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = idx % 2 === 0 ? "white" : "rgba(249,250,251,0.5)";
                              }}
                              >
                                {Object.entries(detail).map(([key, value]) => (
                                  <td key={key} style={{
                                    padding: "10px 12px",
                                    fontSize: "12px",
                                    color: "#1F2937",
                                    whiteSpace: "nowrap"
                                  }}>
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {(edge.details || []).filter((detail: any) => {
                        const searchTerm = (detailSearchTerms[edge.id] || "").toLowerCase();
                        if (!searchTerm) return true;
                        return Object.values(detail).some(value => 
                          String(value).toLowerCase().includes(searchTerm)
                        );
                      }).length === 0 && detailSearchTerms[edge.id] && (
                        <div style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#6B7280",
                          fontSize: "13px",
                          background: "white",
                          borderRadius: "8px",
                          marginTop: "8px"
                        }}>
                          No results found for "{detailSearchTerms[edge.id]}"
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </>
          );
        })}
      </tbody>
    </table>
  );
}
