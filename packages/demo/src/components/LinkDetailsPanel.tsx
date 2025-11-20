import { X, Activity, TrendingUp, AlertTriangle, Zap, Clock, Signal, Network } from 'lucide-react';
import React from 'react';

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
  const linkDetails = generateLinkDetails(connection);
  const avgUtilization = linkDetails.reduce((sum, l) => sum + l.utilization, 0) / linkDetails.length;
  const activeLinks = linkDetails.filter(l => l.status === 'Active').length;
  const totalCapacity = connection.totalCapacity || `${connection.bandwidth_mbps || 1000}M`;
  const avgLatency = linkDetails.reduce((sum, l) => sum + parseFloat(l.latency), 0) / linkDetails.length;
  const avgPacketLoss = linkDetails.reduce((sum, l) => sum + parseFloat(l.packetLoss), 0) / linkDetails.length;

  const NeumorphicCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
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

  const StatCard = ({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: string; color: string
  }) => (
    <div style={{
      background: `linear-gradient(135deg, ${color}15, ${color}08)`,
      border: `1px solid ${color}25`,
      borderRadius: '12px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${color}25, ${color}15)`,
        borderRadius: '8px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon style={{ width: '16px', height: '16px', color }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>{label}</div>
        <div style={{ fontSize: '18px', color: '#1F2937', fontWeight: '700' }}>{value}</div>
      </div>
    </div>
  );

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
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div>
              <h3 style={{
                margin: '0 0 4px 0',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1F2937'
              }}>
                Link Analytics
              </h3>
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

          {/* Summary Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
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
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>

          {/* Individual Links Table */}
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
            </h4>

            <div style={{ overflow: 'hidden', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)' }}>
                    <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: '#475569', textAlign: 'left' }}>Link Name</th>
                    <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: '#475569', textAlign: 'center' }}>Capacity</th>
                    <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: '#475569', textAlign: 'center' }}>Utilization</th>
                    <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: '#475569', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {linkDetails.map((link, index) => (
                    <tr key={link.id} style={{
                      borderTop: index > 0 ? '1px solid #E5E7EB' : 'none',
                      background: index % 2 === 0 ? 'rgba(248,250,252,0.5)' : 'transparent'
                    }}>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                        {link.linkName}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#374151', textAlign: 'center' }}>
                        {link.capacity}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <div style={{
                            width: '40px',
                            height: '6px',
                            background: '#E5E7EB',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${link.utilization}%`,
                                background: link.utilization > 80 ? '#EF4444' : link.utilization > 60 ? '#F59E0B' : '#10B981',
                                borderRadius: '3px',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>
                            {link.utilization}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: '600',
                          background: link.status === 'Active' ? '#10B98120' : '#F59E0B20',
                          color: link.status === 'Active' ? '#059669' : '#D97706',
                          border: `1px solid ${link.status === 'Active' ? '#10B98130' : '#F59E0B30'}`
                        }}>
                          <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: link.status === 'Active' ? '#10B981' : '#F59E0B'
                          }} />
                          {link.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NeumorphicCard>

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
        </div>
      </div>
    </div>
  );
}
