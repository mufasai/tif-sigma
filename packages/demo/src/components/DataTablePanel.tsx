import { useState } from "react";
import { FiDownload, FiFilter, FiX } from "react-icons/fi";

interface NetworkElement {
  ne_id?: string;
  hostname?: string;
  node?: string;
  site_name?: string;
  sto?: string;
  area?: string;
  witel?: string;
  ip_address?: string;
  ipadd_v4?: string;
  vendor?: string;
  manufacture?: string;
  device_type?: string;
  platform?: string;
  types?: string;
  active_status?: number;
  software_version?: string;
}

interface DataTablePanelProps {
  elements: NetworkElement[];
  onClose: () => void;
}

export function DataTablePanel({ elements, onClose }: DataTablePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredElements = elements.filter(
    (el: NetworkElement) =>
      (el.hostname?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (el.site_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (el.area?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (el.node?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (el.sto?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  return (
    <div style={{ position: "fixed", top: "16px", bottom: "16px", left: "16px", right: "16px", zIndex: 1000 }}>
      <div
        style={{
          height: "100%",
          background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
          display: "flex",
          flexDirection: "column",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1F2937", margin: 0 }}>Network Elements Data</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                style={{
                  background: "white",
                  borderRadius: "8px",
                  border: "1px solid #D1D5DB",
                  padding: "6px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#1F2937",
                }}
              >
                <FiDownload style={{ width: "14px", height: "14px" }} />
                <span>Export</span>
              </button>
              <button
                onClick={onClose}
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiX style={{ width: "16px", height: "16px", color: "#6B7280" }} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                placeholder="Search by hostname, site, area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "98%",
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  outline: "none",
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              />
            </div>
            <button
              style={{
                background: "white",
                borderRadius: "8px",
                border: "1px solid #D1D5DB",
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: "500",
                color: "#1F2937",
              }}
            >
              <FiFilter style={{ width: "14px", height: "14px" }} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(4px)",
                zIndex: 10,
              }}
            >
              <tr>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6B7280",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  Hostname
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6B7280",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  Site/STO
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6B7280",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  Area/Witel
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6B7280",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  IP Address
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6B7280",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  Vendor
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6B7280",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  Type/Platform
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6B7280",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredElements.map((element: NetworkElement, index: number) => {
                const hostname = element.hostname || element.node || element.ne_id || "N/A";
                const site = element.site_name || element.sto || "N/A";
                const area = element.area || element.witel || "N/A";
                const ip = element.ip_address || element.ipadd_v4 || "N/A";
                const vendor = element.vendor || element.manufacture || "N/A";
                const deviceType = element.device_type || element.platform || element.types || "N/A";
                const status = element.active_status !== undefined ? element.active_status : 1;

                return (
                  <tr key={index} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <td style={{ padding: "12px 16px", fontSize: "12px", fontFamily: "monospace", color: "#1F2937" }}>
                      {hostname}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#1F2937" }}>{site}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#1F2937" }}>{area}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", fontFamily: "monospace", color: "#1F2937" }}>
                      {ip}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          background:
                            vendor === "CISCO"
                              ? "#DBEAFE"
                              : vendor === "HUAWEI"
                                ? "#FCE7F3"
                                : vendor === "NOKIA"
                                  ? "#F3E8FF"
                                  : "#F3F4F6",
                          color:
                            vendor === "CISCO"
                              ? "#1E40AF"
                              : vendor === "HUAWEI"
                                ? "#BE185D"
                                : vendor === "NOKIA"
                                  ? "#6B21A8"
                                  : "#374151",
                        }}
                      >
                        {vendor}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#1F2937" }}>{deviceType}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          background: status === 1 ? "#D1FAE5" : "#F3F4F6",
                          color: status === 1 ? "#065F46" : "#374151",
                        }}
                      >
                        <span
                          style={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: status === 1 ? "#10B981" : "#9CA3AF",
                          }}
                        ></span>
                        {status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#6B7280",
            }}
          >
            <span>
              Showing {filteredElements.length} of {elements.length} network elements
            </span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
