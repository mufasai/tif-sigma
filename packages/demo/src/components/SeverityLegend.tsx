import React from 'react';

interface SeverityLegendProps {
  visible?: boolean;
}

export const SeverityLegend: React.FC<SeverityLegendProps> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
        padding: '16px',
        minWidth: '200px',
        zIndex: 10,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#6B7280' }}
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
          Link Severity
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Low - Green */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '4px',
              background: '#10B981',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1F2937' }}>Low</div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>{'< 60% utilization'}</div>
          </div>
        </div>

        {/* Minor - Yellow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '4px',
              background: '#F59E0B',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1F2937' }}>Minor</div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>60-75% utilization</div>
          </div>
        </div>

        {/* Major - Orange */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '4px',
              background: '#F97316',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(249, 115, 22, 0.3)',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1F2937' }}>Major</div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>75-90% utilization</div>
          </div>
        </div>

        {/* Critical - Red */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '4px',
              background: '#EF4444',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1F2937' }}>Critical</div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>≥ 90% utilization</div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          fontSize: '10px',
          color: '#6B7280',
          textAlign: 'center',
        }}
      >
        Based on link utilization percentage
      </div>
    </div>
  );
};
