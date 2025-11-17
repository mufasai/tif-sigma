import React, { useState } from 'react';
import {
  FiHome,
  FiLayers,
  FiMap,
  FiBarChart2,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX
} from 'react-icons/fi';

interface LeftSidebarProps {
  onMenuClick: (menu: string) => void;
  activeMenu: string;
  // Kabupaten layer controls
  showKabupatenLayer?: boolean;
  kabupatenLoaded?: boolean;
  onToggleKabupaten?: () => void;
  // Layer selection controls
  selectedLayer?: string;
  onLayerChange?: (layer: string) => void;
  capacityDataLength?: number;
  sirkitDataLength?: number;
  airportsDataAvailable?: boolean;
  multilayerMapDataAvailable?: boolean;
  nodeEdgesDataAvailable?: boolean;
  isLayerLoading?: boolean;
}

export function LeftSidebar({
  onMenuClick,
  activeMenu,
  showKabupatenLayer = false,
  kabupatenLoaded = false,
  onToggleKabupaten,
  selectedLayer = 'none', 
  onLayerChange,
  capacityDataLength = 0,
  // sirkitDataLength = 0,
  // airportsDataAvailable = false,
  multilayerMapDataAvailable = false,
  nodeEdgesDataAvailable = false,
  isLayerLoading = false
}: LeftSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      icon: FiHome,
      label: 'Dashboard',
      color: '#3B82F6',
      description: 'Main overview',
      badge: '5'
    },
    {
      id: 'topology',
      icon: FiMap,
      label: 'Topology',
      color: '#8B5CF6',
      description: 'Network view',
      badge: '12'
    },
    {
      id: 'layers',
      icon: FiLayers,
      label: 'Layers',
      color: '#10B981',
      description: 'Map layers',
      badge: ''
    },
    {
      id: 'analytics',
      icon: FiBarChart2,
      label: 'Analytics',
      color: '#F59E0B',
      description: 'Data analysis',
      badge: '7'
    },
    {
      id: 'settings',
      icon: FiSettings,
      label: 'Settings',
      color: '#6B7280',
      description: 'Configuration',
      badge: ''
    },
  ];

  const NeumorphicContainer = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <div
      className={className}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        ...style
      }}
    >
      {children}
    </div>
  );

  const NeumorphicButton = ({
    onClick,
    children,
    title,
    size = 'normal'
  }: {
    onClick: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'small' | 'normal';
  }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.1)',
        padding: size === 'small' ? '6px' : '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6B7280'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
    >
      {children}
    </button>
  );

  // Map-themed Loading Component
  const MapLoadingOverlay = () => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes reverseSpin {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 1; 
            }
            50% { 
              transform: scale(1.05); 
              opacity: 0.7; 
            }
          }
          @keyframes bounce {
            0%, 100% { 
              transform: translateY(0px); 
            }
            50% { 
              transform: translateY(-8px); 
            }
          }
          @keyframes ping {
            0% { 
              transform: scale(0.95); 
              opacity: 0.8; 
            }
            50% {
              opacity: 0.4;
            }
            100% { 
              transform: scale(1.8); 
              opacity: 0; 
            }
          }
          @keyframes dotPulse {
            0%, 100% { 
              transform: scale(0.8); 
              opacity: 0.5; 
            }
            50% { 
              transform: scale(1.2); 
              opacity: 1; 
            }
          }
        `}
      </style>

      <div
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          borderRadius: '28px',
          padding: '56px 48px',
          boxShadow:
            '0 30px 60px rgba(0,0,0,0.25), 0 10px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          minWidth: '360px',
          maxWidth: '400px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background:
              'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Animated Map Icon Container */}
        <div
          style={{
            position: 'relative',
            width: '140px',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Outer rotating ring */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              marginTop: '-50%',
              marginLeft: '-50%',
              border: '4px solid transparent',
              borderTopColor: '#3B82F6',
              borderRightColor: '#8B5CF6',
              borderRadius: '50%',
              animation: 'spin 3s linear infinite',
            }}
          />

          {/* Middle counter-rotating ring */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '85%',
              height: '85%',
              marginTop: '-42.5%',
              marginLeft: '-42.5%',
              border: '3px solid transparent',
              borderBottomColor: '#10B981',
              borderLeftColor: '#059669',
              borderRadius: '50%',
              animation: 'reverseSpin 2.5s linear infinite',
            }}
          />

          {/* Inner pulsing ring */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '70%',
              height: '70%',
              marginTop: '-35%',
              marginLeft: '-35%',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '50%',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />

          {/* Ping effect layers */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '50px',
              height: '50px',
              marginTop: '-25px',
              marginLeft: '-25px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.3)',
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '50px',
              height: '50px',
              marginTop: '-25px',
              marginLeft: '-25px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.3)',
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite 1s',
            }}
          />

          {/* Center map icon */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
              animation: 'bounce 2s ease-in-out infinite',
            }}
          >
            <FiMap
              style={{
                width: '28px',
                height: '28px',
                color: '#FFFFFF',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
            />
          </div>

          {/* Decorative orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '10px',
                height: '10px',
                marginTop: '-5px',
                marginLeft: '-5px',
                borderRadius: '50%',
                background:
                  i % 2 === 0
                    ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
                    : 'linear-gradient(135deg, #10B981, #059669)',
                boxShadow: `0 2px 8px ${i % 2 === 0 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                transform: `rotate(${i * 90}deg) translateY(-60px)`,
                animation: `pulse 1.5s ease-in-out infinite ${i * 0.25}s`,
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px',
            }}
          >
            Loading Map Layer
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#6B7280',
              fontWeight: '500',
              letterSpacing: '0.3px',
            }}
          >
            Preparing visualization...
          </div>
        </div>

        {/* Progress dots */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                animation: `dotPulse 1.4s ease-in-out infinite ${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div style={{ position: 'fixed', left: '16px', top: '16px', zIndex: 1000 }}>
        <NeumorphicButton onClick={() => setIsMinimized(false)} title="Open Control Panel">
          <FiMenu style={{ width: '20px', height: '20px' }} />
        </NeumorphicButton>
      </div>
    );
  }

  return (
    <>
      {/* Show loading overlay when layer is loading */}
      {isLayerLoading && <MapLoadingOverlay />}
      
      <div style={{
        position: 'fixed',
        left: '16px',
        top: '16px',
        zIndex: 1000,
        width: isCollapsed ? '86px' : '288px',
        transition: 'width 0.3s ease'
      }}>
        <NeumorphicContainer style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: 'auto'
        }}>

        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!isCollapsed && (
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: '2px'
              }}>
                VNIP
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6B7280',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Control Panel
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <NeumorphicButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand' : 'Collapse'}
              size="small"
            >
              {isCollapsed ? (
                <FiChevronRight style={{ width: '14px', height: '14px' }} />
              ) : (
                <FiChevronLeft style={{ width: '14px', height: '14px' }} />
              )}
            </NeumorphicButton>

            {!isCollapsed && (
              <NeumorphicButton
                onClick={() => setIsMinimized(true)}
                title="Minimize Panel"
                size="small"
              >
                <FiX style={{ width: '14px', height: '14px' }} />
              </NeumorphicButton>
            )}
          </div>
        </div>

        {/* Layer Controls Section */}
        {!isCollapsed && (
          <div style={{
            padding: '12px',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Map Layers
            </div>

            {/* Kabupaten Toggle Button */}
            {onToggleKabupaten && (
              <button
                onClick={onToggleKabupaten}
                disabled={!kabupatenLoaded}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: kabupatenLoaded ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: showKabupatenLayer
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(240,240,240,0.6))',
                  color: showKabupatenLayer ? '#FFFFFF' : '#374151',
                  boxShadow: showKabupatenLayer
                    ? '0 4px 12px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                    : 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.1)',
                  opacity: kabupatenLoaded ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (kabupatenLoaded && !showKabupatenLayer) {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.8))';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (kabupatenLoaded && !showKabupatenLayer) {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(240,240,240,0.6))';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }
                }}
              >
                <FiLayers style={{ width: '14px', height: '14px' }} />
                <span>{showKabupatenLayer ? 'Hide' : 'Show'} Kabupaten</span>
              </button>
            )}

            {/* Layer Selection Dropdown */}
            {onLayerChange && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Data Layer
                </label>
                <select
                  value={selectedLayer}
                  onChange={(e) => onLayerChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  <option value="none">Pilih Layer</option>
                  <option value="capacity" disabled={capacityDataLength === 0}>
                    Capacity Polygons {capacityDataLength === 0 ? '(Loading...)' : `(${capacityDataLength} points)`}
                  </option>
                  {/* <option value="sirkit" disabled={sirkitDataLength === 0}>
                    Sirkit (Circuit + Boundary) {sirkitDataLength === 0 ? '(Loading...)' : `(${sirkitDataLength} circuits)`}
                  </option>
                  <option value="sigma" disabled={!airportsDataAvailable}>
                    Sigma (Airports Graph) {!airportsDataAvailable ? '(Loading...)' : ''}
                  </option> */} 
                  <option value="nodeedges" disabled={!nodeEdgesDataAvailable}>
                    Capacity Links {!nodeEdgesDataAvailable ? '(Loading...)' : ''}
                  </option>
                   <option value="multilayer" disabled={!multilayerMapDataAvailable}>
                    Links Testing (GeoJSON) {!multilayerMapDataAvailable ? '(Loading...)' : ''}
                  </option> 
                </select>
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => onMenuClick(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    fontWeight: '500',
                    position: 'relative',
                    background: isActive
                      ? 'linear-gradient(135deg, #4F46E5, #3B82F6)'
                      : 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(240,240,240,0.6))',
                    color: isActive ? '#FFFFFF' : '#374151',
                    boxShadow: isActive
                      ? '0 8px 25px rgba(79,70,229,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                      : 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.8))';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(240,240,240,0.6))';
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isActive
                      ? 'rgba(255,255,255,0.2)'
                      : `linear-gradient(135deg, ${item.color}15, ${item.color}08)`,
                    border: isActive ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${item.color}20`,
                    flexShrink: 0
                  }}>
                    <Icon style={{
                      width: '16px',
                      height: '16px',
                      color: isActive ? '#FFFFFF' : item.color
                    }} />
                  </div>

                  {!isCollapsed && (
                    <>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: isActive ? 'rgba(255,255,255,0.8)' : '#9CA3AF',
                          fontWeight: '500'
                        }}>
                          {item.description}
                        </div>
                      </div>

                      {item.badge && (
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: '600',
                          background: isActive
                            ? 'rgba(255,255,255,0.2)'
                            : `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                          color: isActive ? '#FFFFFF' : item.color,
                          border: isActive ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${item.color}30`
                        }}>
                          {item.badge}
                        </div>
                      )}
                    </>
                  )}

                  {isCollapsed && isActive && (
                    <div style={{
                      position: 'absolute',
                      right: '4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '16px',
                      background: '#FFFFFF',
                      borderRadius: '2px',
                      boxShadow: '0 0 8px rgba(255,255,255,0.5)'
                    }} />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {!isCollapsed && (
          <div style={{
            marginTop: 'auto',
            padding: '16px',
            borderTop: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
              borderRadius: '12px',
              padding: '12px',
              border: '1px solid #BBF7D0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px rgba(16,185,129,0.4)'
                }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#065F46'
                }}>
                  System Active
                </span>
              </div>
              <div style={{
                fontSize: '10px',
                color: '#047857',
                fontWeight: '500'
              }}>
                Last sync: Just now
              </div>
            </div>
          </div>
        )}
      </NeumorphicContainer>
    </div>
    </>
  );
}
