import { X, Activity, TrendingUp, AlertTriangle, Zap, Clock, Signal, Network, Circle, GitBranch } from 'lucide-react';
import React, { ReactNode } from 'react';

interface LinkDetailsPanelProps {
  connection: {
    from: string;
    to: string;
    description?: string;
    bandwidth_mbps?: number;
    utilization?: number;
    latency?: number;
    packetLoss?: number;
    linkCount?: number;
    totalCapacity?: string;
    type?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeData?: Record<string, any>; // Add nodeData to pass all node properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    linkDetails?: Array<Record<string, any>>; // Add linkDetails to pass detailed link data
    clickedType?: 'node' | 'edge'; // Add clickedType to indicate what was clicked
  };
  onClose: () => void;
  onShowTopology?: () => void;
  isTopologyVisible?: boolean;
}

interface LinkDetail {
  id: number;
  linkName: string;
  capacity: string;
  utilization: number;
  status: string;
  latency: string;
  packetLoss: string;
  interface: string;
  vlan: number;
  qos: string;
}

// Generate realistic link details based on connection data
const generateLinkDetails = (connection: LinkDetailsPanelProps['connection']): LinkDetail[] => {
  const baseLatency = connection.latency || Math.random() * 20 + 5;
  const basePacketLoss = connection.packetLoss || Math.random() * 0.1;

  // Generate multiple physical links for redundancy
  const linkCount = connection.linkCount || (connection.bandwidth_mbps && connection.bandwidth_mbps >= 5000 ? 2 : 1);
  const links: LinkDetail[] = [];

  for (let i = 1; i <= linkCount; i++) {
    const capacityPerLink = Math.floor((connection.bandwidth_mbps || 1000) / linkCount);
    const utilizationVariance = Math.random() * 20 - 10; // ±10% variance
    const utilization = Math.max(0, Math.min(100, (connection.utilization || 50) + utilizationVariance));

    links.push({
      id: i,
      linkName: `${connection.from}-PE${i}--${connection.to}-PE${i}`,
      capacity: `${capacityPerLink}M`,
      utilization: Math.round(utilization),
      status: utilization < 95 ? 'Active' : 'Warning',
      latency: `${(baseLatency + Math.random() * 2).toFixed(1)}ms`,
      packetLoss: `${(basePacketLoss + Math.random() * 0.02).toFixed(3)}%`,
      interface: connection.type === 'L1_BACKBONE' ? 'TenGigE' : connection.type === 'L2_AGGREGATION' ? 'GigE' : 'FastEthernet',
      vlan: 100 + i,
      qos: connection.type === 'L1_BACKBONE' ? 'Premium' : connection.type === 'L2_AGGREGATION' ? 'Business' : 'Standard'
    });
  }

  return links;
};

export function LinkDetailsPanel({ connection, onClose, onShowTopology, isTopologyVisible = false }: LinkDetailsPanelProps) {
  console.log("{{testtestest}}",connection)
  const linkDetails = generateLinkDetails(connection);
  const avgUtilization = linkDetails.reduce((sum, l) => sum + l.utilization, 0) / linkDetails.length;
  const activeLinks = linkDetails.filter(l => l.status === 'Active').length;

  // Helper function to format capacity with K suffix for thousands
  const formatCapacity = (gbps: number): string => {
    if (gbps >= 1000) {
      return `${(gbps / 1000).toFixed(2)}K Gbps`;
    }
    return `${gbps.toFixed(2)} Gbps`;
  };

  // Calculate total capacity - prioritize linkDetails if available
  let totalCapacity: string;

  if (connection.linkDetails && connection.linkDetails.length > 0) {
    // Sum all capacities from linkDetails and convert to Gbps
    const totalCapacityBps = connection.linkDetails.reduce((sum, detail) => {
      const capacity = typeof detail.capacity === 'number' ? detail.capacity : 0;
      return sum + capacity;
    }, 0);

    if (totalCapacityBps > 0) {
      const totalGbps = totalCapacityBps / 1000000000;
      totalCapacity = formatCapacity(totalGbps);
    } else {
      // If linkDetails exist but no valid capacity, use fallback
      totalCapacity = connection.totalCapacity || (connection.bandwidth_mbps ? `${connection.bandwidth_mbps}M` : 'N/A');
    }
  } else {
    // No linkDetails, use provided totalCapacity or fallback
    totalCapacity = connection.totalCapacity || (connection.bandwidth_mbps ? `${connection.bandwidth_mbps}M` : 'N/A');
  }

  const avgLatency = linkDetails.reduce((sum, l) => sum + parseFloat(l.latency), 0) / linkDetails.length;
  const avgPacketLoss = linkDetails.reduce((sum, l) => sum + parseFloat(l.packetLoss), 0) / linkDetails.length;



  interface NeumorphicCardProps {
    children?: ReactNode;
    className?: string;
  }

  const NeumorphicCard = ({ children, className = "" }: NeumorphicCardProps) => {
    return (
      <div
        className={className}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.8))',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
          padding: '16px'
        }}
      >
        {children}
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: string; color: string
  }): React.ReactElement => {
    return (
      <div style={{
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        border: `1px solid ${color}25`,
        borderRadius: '8px',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        minWidth: '0'
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${color}25, ${color}15)`,
          borderRadius: '6px',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon style={{ width: '14px', height: '14px', color }} />
        </div>
        <div style={{ flex: 1, minWidth: '0' }}>
          <div style={{ fontSize: '9px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</div>
          <div style={{ fontSize: '14px', color: '#1F2937', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      bottom: '16px',
      right: '16px',
      width: '600px',
      zIndex: 1001,
    }}>
      <div style={{
        height: '100%',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          paddingBottom: '1px',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1F2937'
                }}>
                  Link Analytics
                </h3>
                {/* Clicked Type Badge */}
                {connection.clickedType && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: connection.clickedType === 'node'
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.15))'
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.15))',
                    color: connection.clickedType === 'node' ? '#1E40AF' : '#6D28D9',
                    border: connection.clickedType === 'node'
                      ? '1.5px solid rgba(59, 130, 246, 0.4)'
                      : '1.5px solid rgba(139, 92, 246, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    boxShadow: connection.clickedType === 'node'
                      ? '0 2px 8px rgba(59, 130, 246, 0.15)'
                      : '0 2px 8px rgba(139, 92, 246, 0.15)',
                    transition: 'all 0.2s ease',
                    animation: 'fadeInBadge 0.3s ease-out'
                  }}>
                    {connection.clickedType === 'node' ? (
                      <Circle style={{ width: '13px', height: '13px', strokeWidth: 2.5 }} />
                    ) : (
                      <GitBranch style={{ width: '13px', height: '13px', strokeWidth: 2.5 }} />
                    )}
                    {connection.clickedType === 'node' ? 'Node' : 'Edge'}
                  </span>
                )}
                <style>{`
                  @keyframes fadeInBadge {
                    from {
                      opacity: 0;
                      transform: scale(0.9);
                    }
                    to {
                      opacity: 1;
                      transform: scale(1);
                    }
                  }
                `}</style>
              </div>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#6B7280',
                fontWeight: '500'
              }}>
                {connection.description || `${connection.from} → ${connection.to}`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onShowTopology && (
                <button
                  onClick={onShowTopology}
                  style={{
                    background: isTopologyVisible
                      ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.8))'
                      : 'linear-gradient(145deg, rgba(147, 51, 234, 0.9), rgba(126, 34, 206, 0.8))',
                    border: isTopologyVisible
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid rgba(147, 51, 234, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = isTopologyVisible
                      ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                      : '0 4px 12px rgba(147, 51, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                  title={isTopologyVisible ? "Hide Network Topology" : "Show Network Topology"}
                >
                  <Network style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                  <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: '600' }}>
                    {isTopologyVisible ? 'Hide' : 'Show'} Topology
                  </span>
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <X style={{ width: '16px', height: '16px', color: '#6B7280' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>

          {/* Alerts Section */}
          <NeumorphicCard>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
              Recent Alerts
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {avgUtilization > 80 && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  fontSize: '12px',
                  color: '#92400E'
                }}>
                  <strong>Warning:</strong> High utilization detected ({avgUtilization.toFixed(0)}%) at {new Date().toLocaleTimeString()}
                </div>
              )}
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#DBEAFE',
                border: '1px solid #BFDBFE',
                fontSize: '12px',
                color: '#1E40AF'
              }}>
                <strong>Info:</strong> Scheduled maintenance window: Sunday 02:00-04:00 WIB
              </div>
              {Math.random() > 0.5 && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#D1FAE5',
                  border: '1px solid #A7F3D0',
                  fontSize: '12px',
                  color: '#065F46'
                }}>
                  <strong>Success:</strong> Link optimization completed successfully
                </div>
              )}
            </div>
          </NeumorphicCard>

          {/* Summary Stats Grid - Compact Single Row 4x1 Layout */}
          <NeumorphicCard>

            <div style={{
              display: 'flex',
              gap: '6px'
            }}>
              <StatCard
                icon={Zap}
                label="CAPACITY"
                value={totalCapacity}
                color="#4F46E5"
              />
              <StatCard
                icon={TrendingUp}
                label="AVG UTIL"
                value={`${avgUtilization.toFixed(0)}%`}
                color={avgUtilization > 80 ? '#EF4444' : avgUtilization > 60 ? '#F59E0B' : '#10B981'}
              />
              <StatCard
                icon={Activity}
                label="LINKS"
                value={`${activeLinks}/${linkDetails.length}`}
                color="#8B5CF6"
              />
              <StatCard
                icon={Clock}
                label="LATENCY"
                value={`${avgLatency.toFixed(1)}ms`}
                color="#06B6D4"
              />
            </div>
          </NeumorphicCard>

          {/* Physical Links Table - Combined with Detailed Information */}
          <NeumorphicCard>
            <h4 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Signal style={{ width: '16px', height: '16px', color: '#4F46E5' }} />
              Physical Links
              {connection.linkDetails && Array.isArray(connection.linkDetails) && connection.linkDetails.length > 0 && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#4F46E520',
                  color: '#4F46E5',
                  border: '1px solid #4F46E530'
                }}>
                  {connection.linkDetails.length} link{connection.linkDetails.length !== 1 ? 's' : ''}
                </span>
              )}
            </h4>

            <div style={{
              overflowX: 'auto',
              overflowY: 'visible',
              borderRadius: '12px',
              maxHeight: '400px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: connection.linkDetails && connection.linkDetails.length > 0 ? '1400px' : '100%'
              }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr style={{ background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)' }}>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'left', minWidth: '180px' }}>
                      Ruas / Link Name
                    </th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'left', minWidth: '140px' }}>Source Node</th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'left', minWidth: '140px' }}>Target Node</th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'center', minWidth: '110px' }}>Layer</th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'center', minWidth: '110px' }}>Port Log</th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'right', minWidth: '110px' }}>Capacity</th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'right', minWidth: '110px' }}>Traffic In Log (Mbps)</th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'right', minWidth: '110px' }}>Traffic Out Log (Mbps)</th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'right', minWidth: '110px' }}>Traffic In PSK (Mbps)</th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'right', minWidth: '110px' }}>Traffic Out PSK (Mbps)</th>
                    <th style={{ padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#475569', textAlign: 'center', minWidth: '100px' }}>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {connection.linkDetails && connection.linkDetails.length > 0 ? (
                    // Show detailed link data if available
                    connection.linkDetails.map((detail, index) => {
                      const capacity = typeof detail.capacity === 'number' ? (detail.capacity / 1000000000).toFixed(2) + ' Gbps' : 'N/A';
                      const traffic_in_log = typeof detail.traffic_in_log === 'number' ? (detail.traffic_in_log / 1000000).toFixed(2) : 'N/A';
                      const traffic_out_log = typeof detail.traffic_out_log === 'number' ? (detail.traffic_out_log / 1000000).toFixed(2) : 'N/A';
                      const traffic_in_psk = typeof detail.traffic_in_psk === 'number' ? (detail.traffic_in_psk / 1000000).toFixed(2) : 'N/A';
                      const traffic_out_psk = typeof detail.traffic_out_psk === 'number' ? (detail.traffic_out_psk / 1000000).toFixed(2) : 'N/A';
                      const utilization = typeof detail.utilization === 'number' ? detail.utilization.toFixed(2) : '0.00';

                      return (
                        <tr key={index} style={{
                          borderTop: index > 0 ? '1px solid #E5E7EB' : 'none',
                          background: index % 2 === 0 ? 'rgba(248,250,252,0.5)' : 'transparent'
                        }}>
                          <td style={{ padding: '10px 8px', fontSize: '11px', color: '#374151', fontWeight: '500' }}>
                            {String(detail.ruas || 'N/A')}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '11px', color: '#374151' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: '600' }}>{String(detail.source_node || detail.source || 'N/A')}</span>
                              <span style={{ fontSize: '9px', color: '#6B7280' }}>{String(detail.source_label || '')}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '11px', color: '#374151' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: '600' }}>{String(detail.target_node || detail.target || 'N/A')}</span>
                              <span style={{ fontSize: '9px', color: '#6B7280' }}>{String(detail.target_label || '')}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '10px', color: '#374151', textAlign: 'center' }}>
                            <span style={{
                              padding: '3px 6px',
                              borderRadius: '4px',
                              background: '#8B5CF615',
                              color: '#8B5CF6',
                              fontWeight: '600',
                              fontSize: '9px'
                            }}>
                              {String(detail.layer || detail.trunk_layer || 'N/A')}
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '10px', color: '#374151', textAlign: 'center', fontFamily: 'monospace' }}>
                            {String(detail.port_log || 'N/A')}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '11px', color: '#4F46E5', textAlign: 'right', fontWeight: '600' }}>
                            {capacity}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '11px', color: '#3B82F6', textAlign: 'right', fontWeight: '600' }}>
                            {traffic_in_log}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '11px', color: '#10B981', textAlign: 'right', fontWeight: '600' }}>
                            {traffic_out_log}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '11px', color: '#6366F1', textAlign: 'right' }}>
                            {traffic_in_psk}
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '11px', color: '#14B8A6', textAlign: 'right' }}>
                            {traffic_out_psk}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        
                              <span style={{ fontSize: '10px', color: '#374151', fontWeight: '700' }}>
                                {utilization}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // Show generated link data with same column structure
                    linkDetails.map((link, index) => (
                      <tr key={link.id} style={{
                        borderTop: index > 0 ? '1px solid #E5E7EB' : 'none',
                        background: index % 2 === 0 ? 'rgba(248,250,252,0.5)' : 'transparent'
                      }}>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#374151', fontWeight: '500' }}>
                          {link.linkName}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#374151' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '600' }}>{connection.from}</span>
                            <span style={{ fontSize: '9px', color: '#6B7280' }}>Source</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#374151' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '600' }}>{connection.to}</span>
                            <span style={{ fontSize: '9px', color: '#6B7280' }}>Target</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '10px', color: '#374151', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 6px',
                            borderRadius: '4px',
                            background: '#8B5CF615',
                            color: '#8B5CF6',
                            fontWeight: '600',
                            fontSize: '9px'
                          }}>
                            {connection.type || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '10px', color: '#374151', textAlign: 'center', fontFamily: 'monospace' }}>
                          {link.interface}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#4F46E5', textAlign: 'right', fontWeight: '600' }}>
                          {link.capacity}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#3B82F6', textAlign: 'right', fontWeight: '600' }}>
                          N/A
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#10B981', textAlign: 'right', fontWeight: '600' }}>
                          N/A
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#6366F1', textAlign: 'right' }}>
                          N/A
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#14B8A6', textAlign: 'right' }}>
                          N/A
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{
                              width: '60px',
                              height: '6px',
                              background: '#E5E7EB',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              {/* <div
                                style={{
                                  height: '100%',
                                  width: `${link.utilization}%`,
                                  background: link.utilization > 80 ? '#EF4444' : link.utilization > 60 ? '#F59E0B' : '#10B981',
                                  borderRadius: '3px',
                                  transition: 'width 0.3s ease'
                                }}
                              /> */}
                            </div>
                            <span style={{ fontSize: '10px', color: '#374151', fontWeight: '700' }}>
                              {link.utilization}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Scroll hint - always show */}
            <div style={{
              marginTop: '8px',
              padding: '6px 12px',
              background: 'rgba(79, 70, 229, 0.05)',
              borderRadius: '6px',
              fontSize: '10px',
              color: '#4F46E5',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ← Scroll horizontally to view all columns →
            </div>
          </NeumorphicCard>

          {/* Edge Details Section - Show when edge is clicked */}
          {connection.clickedType === 'edge' && connection.nodeData && (
            <NeumorphicCard>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1F2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <GitBranch style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
                Edge Details
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {/* Display edge properties from nodeData (edge data outside details array) */}
                {Object.entries(connection.nodeData)
                  .filter(([key]) =>
                    // Exclude details array and some internal fields that are not useful
                    !['details', 'topology', 'x', 'y', 'coordinates', 'source_lon', 'source_lat', 'target_lon', 'target_lat'].includes(key)
                  )
                  .map(([key, value]) => {
                    // Format the key
                    const formattedKey = key
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');

                    // Format the value
                    let formattedValue: string;
                    let valueColor = '#1F2937';

                    // Special formatting for specific fields
                    if (key.includes('capacity') && typeof value === 'number') {
                      formattedValue = `${(value / 1000000000).toFixed(2)} Gbps`;
                      valueColor = '#7C3AED';
                    } else if (key.includes('traffic') && typeof value === 'number') {
                      formattedValue = `${(value / 1000000).toFixed(2)} Mbps`;
                      valueColor = key.includes('in') ? '#3B82F6' : '#10B981';
                    } else if (key.includes('utilization') && typeof value === 'number') {
                      formattedValue = `${value.toFixed(2)}%`;
                      valueColor = value > 80 ? '#EF4444' : value > 60 ? '#F59E0B' : '#10B981';
                    } else if (key === 'link_count' && typeof value === 'number') {
                      formattedValue = String(value);
                      valueColor = '#8B5CF6';
                    } else if (key === 'size' && typeof value === 'number') {
                      formattedValue = String(value);
                      valueColor = '#6366F1';
                    } else if (typeof value === 'string' && value.length > 50) {
                      formattedValue = value.substring(0, 47) + '...';
                    } else if (value === null || value === undefined || value === '') {
                      formattedValue = 'N/A';
                    } else if (typeof value === 'object') {
                      formattedValue = JSON.stringify(value);
                    } else {
                      formattedValue = String(value);
                    }

                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          padding: '8px',
                          background: 'rgba(249, 250, 251, 0.5)',
                          borderRadius: '8px',
                          border: '1px solid rgba(229, 231, 235, 0.5)'
                        }}
                      >
                        <span style={{
                          fontSize: '11px',
                          color: '#6B7280',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {formattedKey}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          color: valueColor,
                          fontWeight: '600',
                          wordBreak: 'break-word'
                        }}>
                          {formattedValue}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </NeumorphicCard>
          )}

          {/* Performance Metrics */}
          <NeumorphicCard>
            <h4 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#10B981' }} />
              Performance Metrics
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Average Latency</span>
                <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: '700' }}>{avgLatency.toFixed(1)} ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Packet Loss</span>
                <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: '700' }}>{avgPacketLoss.toFixed(3)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Availability (24h)</span>
                <span style={{ fontSize: '14px', color: '#10B981', fontWeight: '700' }}>99.{Math.floor(Math.random() * 10 + 90)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Total Traffic (24h)</span>
                <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: '700' }}>{(Math.random() * 10 + 1).toFixed(1)} TB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Link Type</span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: connection.type === 'L1_BACKBONE' ? '#DC262620' : connection.type === 'L2_AGGREGATION' ? '#EA580C20' : '#05966920',
                  color: connection.type === 'L1_BACKBONE' ? '#DC2626' : connection.type === 'L2_AGGREGATION' ? '#EA580C' : '#059669',
                  border: `1px solid ${connection.type === 'L1_BACKBONE' ? '#DC262630' : connection.type === 'L2_AGGREGATION' ? '#EA580C30' : '#05966930'}`
                }}>
                  {connection.type?.replace('_', ' ') || 'LEGACY'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Redundancy</span>
                <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: '700' }}>{linkDetails.length > 1 ? 'Active-Active' : 'Single Path'}</span>
              </div>
            </div>
          </NeumorphicCard>

          {/* Node Details Section - Show when node is clicked */}
          {connection.clickedType === 'node' && connection.nodeData && (
            <NeumorphicCard>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1F2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Circle style={{ width: '16px', height: '16px', color: '#3B82F6' }} />
                Node Details
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {/* Dynamically render all node properties */}
                {Object.entries(connection.nodeData)
                  .filter(([key]) =>
                    // Exclude certain keys that are not useful to display
                    !['topology', 'details', 'x', 'y', 'coordinates', 'source_lon', 'source_lat', 'target_lon', 'target_lat' , 'platform'].includes(key)
                  )
                  .map(([key, value]) => {
                    // Format the key to be more readable
                    const formattedKey = key
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');

                    // Format the value with special handling for specific fields
                    let formattedValue: string;
                    let valueColor = '#1F2937';

                    if (key.includes('capacity') && typeof value === 'number') {
                      formattedValue = `${(value / 1000000000).toFixed(2)} Gbps`;
                      valueColor = '#3B82F6';
                    } else if (key.includes('traffic') && typeof value === 'number') {
                      formattedValue = `${(value / 1000000).toFixed(2)} Mbps`;
                      valueColor = key.includes('in') ? '#3B82F6' : '#10B981';
                    } else if (key.includes('utilization') && typeof value === 'number') {
                      formattedValue = `${value.toFixed(2)}%`;
                      valueColor = value > 80 ? '#EF4444' : value > 60 ? '#F59E0B' : '#10B981';
                    } else if (typeof value === 'string' && value.length > 50) {
                      formattedValue = value.substring(0, 47) + '...';
                    } else if (value === null || value === undefined || value === '') {
                      formattedValue = 'N/A';
                    } else if (typeof value === 'object') {
                      formattedValue = JSON.stringify(value);
                    } else {
                      formattedValue = String(value);
                    }

                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          padding: '8px',
                          background: 'rgba(249, 250, 251, 0.5)',
                          borderRadius: '8px',
                          border: '1px solid rgba(229, 231, 235, 0.5)'
                        }}
                      >
                        <span style={{
                          fontSize: '11px',
                          color: '#6B7280',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {formattedKey}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          color: valueColor,
                          fontWeight: '600',
                          wordBreak: 'break-word'
                        }}>
                          {formattedValue}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Show coordinates if available */}
              {(connection.nodeData.longitude !== undefined || connection.nodeData.latitude !== undefined) && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>
                    COORDINATES
                  </div>
                  <div style={{ fontSize: '13px', color: '#3B82F6', fontWeight: '700' }}>
                    Longitude: {typeof connection.nodeData.longitude === 'string' ? parseFloat(connection.nodeData.longitude).toFixed(6) : 'N/A'}, Latitude: {typeof connection.nodeData.latitude === 'string' ? parseFloat(connection.nodeData.latitude).toFixed(6) : 'N/A'}
                  </div>
                </div>
              )}
            </NeumorphicCard>
          )}


        </div>
      </div>
    </div>
  );
}
