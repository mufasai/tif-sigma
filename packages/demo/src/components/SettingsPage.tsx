import { FiBell, FiGlobe, FiSettings, FiShield, FiX } from "react-icons/fi";

interface SettingsPageProps {
  onClose: () => void;
}

export function SettingsPage({ onClose }: SettingsPageProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        bottom: "16px",
        left: "16px",
        right: "16px",
        marginLeft: "71vw",
        zIndex: 1001,
      }}
    >
      <div
        style={{
          height: "100%",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(12px)",
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
            padding: "16px 24px",
            borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
                  padding: "8px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiSettings style={{ width: "20px", height: "20px", color: "white" }} />
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: 0 }}>Settings</h2>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>Manage platform preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
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
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          <div style={{ maxWidth: "672px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Appearance */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(4px)",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 0.5)",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <FiSettings style={{ width: "16px", height: "16px", color: "#8B5CF6" }} />
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>Appearance</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>
                      Glassmorphism Effects
                    </p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      Enable transparent glass-like UI elements
                    </p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#3B82F6",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "22px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(0, 0, 0, 0.05)" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>Show Animations</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      Enable smooth transitions and animations
                    </p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#3B82F6",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "22px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(0, 0, 0, 0.05)" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>Dark Mode</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>Switch to dark color scheme</p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#D1D5DB",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "3px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Settings */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(4px)",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 0.5)",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <FiGlobe style={{ width: "16px", height: "16px", color: "#3B82F6" }} />
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>
                  Map & Visualization
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>Show Link Labels</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      Display capacity labels on network links
                    </p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#3B82F6",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "22px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(0, 0, 0, 0.05)" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>Curved Links</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      Use curved paths for network connections
                    </p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#3B82F6",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "22px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(0, 0, 0, 0.05)" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>Auto-Zoom</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      Automatically zoom to selected elements
                    </p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#3B82F6",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "22px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(4px)",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 0.5)",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <FiBell style={{ width: "16px", height: "16px", color: "#F59E0B" }} />
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>Notifications</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>
                      Performance Alerts
                    </p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      Get notified when utilization exceeds threshold
                    </p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#3B82F6",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "22px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(0, 0, 0, 0.05)" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>
                      Fault Notifications
                    </p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>Receive alerts for network faults</p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#3B82F6",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "22px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(0, 0, 0, 0.05)" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>Email Reports</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      Send daily network health reports via email
                    </p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#D1D5DB",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "3px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(4px)",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 0.5)",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <FiShield style={{ width: "16px", height: "16px", color: "#10B981" }} />
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>Security & Privacy</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>Auto-Lock</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      Lock session after 15 minutes of inactivity
                    </p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#3B82F6",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "22px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(0, 0, 0, 0.05)" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", margin: 0 }}>Audit Logging</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>Track all user actions and changes</p>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "44px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#3B82F6",
                        borderRadius: "24px",
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "18px",
                          width: "18px",
                          left: "22px",
                          bottom: "3px",
                          background: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                style={{
                  background: "#3B82F6",
                  borderRadius: "8px",
                  border: "none",
                  padding: "10px 20px",
                  cursor: "pointer",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3B82F6";
                }}
              >
                Save Changes
              </button>
              <button
                onClick={onClose}
                style={{
                  background: "white",
                  borderRadius: "8px",
                  border: "1px solid #D1D5DB",
                  padding: "10px 20px",
                  cursor: "pointer",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
