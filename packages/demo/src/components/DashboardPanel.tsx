import { useState } from "react";
import { FiActivity, FiTrendingUp, FiUsers, FiX, FiZap } from "react-icons/fi";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface KPIData {
  revenue: { value: string; change: number };
  utilization: { value: string; change: number };
  customerCount: { value: string; change: number };
  bandwidth: { value: string; change: number };
  historicalTrend: { month: string; value: number }[];
}

interface DashboardPanelProps {
  kpiData: KPIData;
  onClose: () => void;
}

type TabType = "counter" | "analysis" | "business";

export function DashboardPanel({ kpiData, onClose }: DashboardPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("counter");

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        bottom: "16px",
        right: "16px",
        width: "384px",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          height: "100%",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(4px)",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(229, 231, 235, 0.5)",
          display: "flex",
          flexDirection: "column",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FiX style={{ width: "16px", height: "16px", color: "#6B7280" }} />
            </button>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "4px",
              background: "rgba(243, 244, 246, 0.5)",
              borderRadius: "8px",
              padding: "4px",
            }}
          >
            {(["counter", "analysis", "business"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: activeTab === tab ? "white" : "transparent",
                  color: activeTab === tab ? "#111827" : "#6B7280",
                  boxShadow: activeTab === tab ? "0 1px 2px rgba(0, 0, 0, 0.05)" : "none",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* KPI Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {/* Revenue Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div
                    style={{
                      background: "#06B6D4",
                      borderRadius: "8px",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiTrendingUp style={{ width: "16px", height: "16px", color: "white" }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "#0E7490" }}>+{kpiData.revenue.change}%</div>
                </div>
                <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                  {kpiData.revenue.value}
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>BKIS Revenue</div>
              </div>

              {/* Utilization Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div
                    style={{
                      background: "#22C55E",
                      borderRadius: "8px",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiActivity style={{ width: "16px", height: "16px", color: "white" }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "#15803D" }}>+{kpiData.utilization.change}%</div>
                </div>
                <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                  {kpiData.utilization.value}
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>Network Utilization</div>
              </div>

              {/* Customer Count Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div
                    style={{
                      background: "#A855F7",
                      borderRadius: "8px",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiUsers style={{ width: "16px", height: "16px", color: "white" }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "#7E22CE" }}>+{kpiData.customerCount.change}%</div>
                </div>
                <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                  {kpiData.customerCount.value}
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>Customer Count</div>
              </div>

              {/* Bandwidth Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(249, 115, 22, 0.3)",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div
                    style={{
                      background: "#F97316",
                      borderRadius: "8px",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiZap style={{ width: "16px", height: "16px", color: "white" }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "#C2410C" }}>+{kpiData.bandwidth.change}%</div>
                </div>
                <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                  {kpiData.bandwidth.value}
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>Bandwidth Usage</div>
              </div>
            </div>

            {/* Historical Trend */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 0.5)",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111827" }}>Historical Trend</h3>
                <span style={{ fontSize: "12px", color: "#3B82F6" }}>6 Months</span>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={kpiData.historicalTrend}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Network Summary */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 0.5)",
                padding: "16px",
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>Network Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>Total Links</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#111827" }}>1,247</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>Active NE</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#111827" }}>856</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>Total Capacity</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#111827" }}>12.5 Tbps</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>Avg Utilization</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#22C55E" }}>68%</span>
                </div>
              </div>
            </div>

            {/* Vendor Distribution */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 0.5)",
                padding: "16px",
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>Vendor Distribution</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      flex: "0 0 45%",
                      height: "8px",
                      background: "#3B82F6",
                      borderRadius: "9999px",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>CISCO</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#111827", marginLeft: "auto" }}>45%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      flex: "0 0 35%",
                      height: "8px",
                      background: "#EC4899",
                      borderRadius: "9999px",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>HUAWEI</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#111827", marginLeft: "auto" }}>35%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      flex: "0 0 20%",
                      height: "8px",
                      background: "#A855F7",
                      borderRadius: "9999px",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>NOKIA</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#111827", marginLeft: "auto" }}>20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
