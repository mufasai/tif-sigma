import { useState } from "react";
import { FiActivity, FiBarChart2, FiTrendingUp, FiUsers, FiX, FiZap } from "react-icons/fi";
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Area, AreaChart } from "recharts";

interface AnalyticsPageProps {
  onClose: () => void;
}

export function AnalyticsPage({ onClose }: AnalyticsPageProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const performanceData = [
    { month: "Jan", utilization: 65, capacity: 100, traffic: 58 },
    { month: "Feb", utilization: 68, capacity: 100, traffic: 62 },
    { month: "Mar", utilization: 71, capacity: 100, traffic: 65 },
    { month: "Apr", utilization: 69, capacity: 100, traffic: 63 },
    { month: "May", utilization: 74, capacity: 100, traffic: 70 },
    { month: "Jun", utilization: 72, capacity: 100, traffic: 68 },
  ];

  const vendorData = [
    { vendor: "CISCO", count: 385, percentage: 45 },
    { vendor: "HUAWEI", count: 299, percentage: 35 },
    { vendor: "NOKIA", count: 172, percentage: 20 },
  ];

  const regionData = [
    { region: "Jakarta", links: 245, utilization: 78 },
    { region: "Surabaya", links: 189, utilization: 72 },
    { region: "Bandung", links: 156, utilization: 68 },
    { region: "Medan", links: 134, utilization: 65 },
    { region: "Makassar", links: 98, utilization: 62 },
  ];

  return (
    <div style={{ position: "fixed", top: "16px", bottom: "16px", left: "304px", right: "16px", zIndex: 1001 }}>
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
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", padding: "8px", borderRadius: "8px" }}
              >
                <FiBarChart2 style={{ width: "20px", height: "20px", color: "white" }} />
              </div>
              <div>
                <h2 style={{ fontSize: "18px", color: "#1F2937", fontWeight: "700", margin: 0 }}>
                  Analytics Dashboard
                </h2>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>Network Performance & Insights</p>
              </div>
            </div>
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

        {/* Tabs */}
        <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <div
            style={{ display: "flex", gap: "8px", background: "rgba(0,0,0,0.03)", padding: "4px", borderRadius: "8px" }}
          >
            {["overview", "performance", "vendors", "regions"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  background: activeTab === tab ? "white" : "transparent",
                  color: activeTab === tab ? "#1F2937" : "#6B7280",
                  boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s ease",
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                    borderRadius: "12px",
                    border: "1px solid #BFDBFE",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ background: "#3B82F6", padding: "8px", borderRadius: "8px" }}>
                      <FiActivity style={{ width: "16px", height: "16px", color: "white" }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#2563EB" }}>+12%</span>
                  </div>
                  <div style={{ fontSize: "28px", color: "#1F2937", marginBottom: "4px", fontWeight: "700" }}>
                    1,247
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Total Links</div>
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)",
                    borderRadius: "12px",
                    border: "1px solid #BBF7D0",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ background: "#10B981", padding: "8px", borderRadius: "8px" }}>
                      <FiTrendingUp style={{ width: "16px", height: "16px", color: "white" }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#059669" }}>+8%</span>
                  </div>
                  <div style={{ fontSize: "28px", color: "#1F2937", marginBottom: "4px", fontWeight: "700" }}>72%</div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Avg Utilization</div>
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, #FAF5FF, #F3E8FF)",
                    borderRadius: "12px",
                    border: "1px solid #E9D5FF",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ background: "#8B5CF6", padding: "8px", borderRadius: "8px" }}>
                      <FiUsers style={{ width: "16px", height: "16px", color: "white" }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#7C3AED" }}>+15%</span>
                  </div>
                  <div style={{ fontSize: "28px", color: "#1F2937", marginBottom: "4px", fontWeight: "700" }}>856</div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Active NE</div>
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, #FFF7ED, #FFEDD5)",
                    borderRadius: "12px",
                    border: "1px solid #FED7AA",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ background: "#F97316", padding: "8px", borderRadius: "8px" }}>
                      <FiZap style={{ width: "16px", height: "16px", color: "white" }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#EA580C" }}>+5%</span>
                  </div>
                  <div style={{ fontSize: "28px", color: "#1F2937", marginBottom: "4px", fontWeight: "700" }}>
                    12.5 Tbps
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Total Capacity</div>
                </div>
              </div>

              {/* Chart */}
              <div
                style={{
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  padding: "16px",
                }}
              >
                <h3 style={{ fontSize: "14px", color: "#1F2937", marginBottom: "16px", fontWeight: "600" }}>
                  Network Utilization Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="utilization" stroke="#3b82f6" strokeWidth={2} fill="url(#colorUtil)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  padding: "16px",
                }}
              >
                <h3 style={{ fontSize: "14px", color: "#1F2937", marginBottom: "16px", fontWeight: "600" }}>
                  Performance Metrics Comparison
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="utilization" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="traffic" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.05)",
                    padding: "16px",
                  }}
                >
                  <h4 style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", fontWeight: "600" }}>
                    Latency
                  </h4>
                  <div style={{ fontSize: "28px", color: "#1F2937", marginBottom: "4px", fontWeight: "700" }}>
                    12.3 ms
                  </div>
                  <div style={{ fontSize: "12px", color: "#10B981" }}>↓ 5% from last month</div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.05)",
                    padding: "16px",
                  }}
                >
                  <h4 style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", fontWeight: "600" }}>
                    Packet Loss
                  </h4>
                  <div style={{ fontSize: "28px", color: "#1F2937", marginBottom: "4px", fontWeight: "700" }}>
                    0.01%
                  </div>
                  <div style={{ fontSize: "12px", color: "#10B981" }}>↓ 2% from last month</div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.05)",
                    padding: "16px",
                  }}
                >
                  <h4 style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", fontWeight: "600" }}>
                    Availability
                  </h4>
                  <div style={{ fontSize: "28px", color: "#1F2937", marginBottom: "4px", fontWeight: "700" }}>
                    99.98%
                  </div>
                  <div style={{ fontSize: "12px", color: "#10B981" }}>↑ 0.1% from last month</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "vendors" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  padding: "16px",
                }}
              >
                <h3 style={{ fontSize: "14px", color: "#1F2937", marginBottom: "16px", fontWeight: "600" }}>
                  Vendor Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={vendorData}>
                    <XAxis dataKey="vendor" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Vendor Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {vendorData.map((vendor) => (
                  <div
                    key={vendor.vendor}
                    style={{
                      background: "rgba(255,255,255,0.5)",
                      backdropFilter: "blur(4px)",
                      borderRadius: "12px",
                      border: "1px solid rgba(0,0,0,0.05)",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "14px", color: "#1F2937", fontWeight: "600" }}>{vendor.vendor}</span>
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{vendor.percentage}%</span>
                    </div>
                    <div style={{ fontSize: "20px", color: "#1F2937", marginBottom: "8px", fontWeight: "700" }}>
                      {vendor.count}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "#E5E7EB",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ height: "100%", background: "#3B82F6", width: `${vendor.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "regions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  padding: "16px",
                }}
              >
                <h3 style={{ fontSize: "14px", color: "#1F2937", marginBottom: "16px", fontWeight: "600" }}>
                  Regional Performance
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {regionData.map((region) => (
                    <div
                      key={region.region}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        background: "rgba(255,255,255,0.5)",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ fontSize: "14px", color: "#1F2937", fontWeight: "500" }}>{region.region}</span>
                          <span style={{ fontSize: "12px", color: "#6B7280" }}>{region.links} links</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              flex: 1,
                              height: "8px",
                              background: "#E5E7EB",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                background: region.utilization > 75 ? "#F59E0B" : "#10B981",
                                width: `${region.utilization}%`,
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: "12px", color: "#6B7280", width: "48px", textAlign: "right" }}>
                            {region.utilization}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
