import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';

export function Legend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 998 }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}>
        {/* Header */}
        <div style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          borderBottom: isExpanded ? '1px solid rgba(0,0,0,0.05)' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiInfo style={{ width: '14px', height: '14px', color: '#3B82F6' }} />
            <span style={{ fontSize: '12px', color: '#1F2937', fontWeight: '600' }}>Legend</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280'
            }}
          >
            {isExpanded ? (
              <FiChevronDown style={{ width: '12px', height: '12px' }} />
            ) : (
              <FiChevronUp style={{ width: '12px', height: '12px' }} />
            )}
          </button>
        </div>

        {/* Content */}
        {isExpanded && (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Vendors */}
            <div>
              <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Vendors:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3B82F6' }}></div>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>CISCO</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EC4899' }}></div>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>HUAWEI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8B5CF6' }}></div>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>NOKIA</span>
                </div>
              </div>
            </div>

            {/* Link Status */}
            <div>
              <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Link Status:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '2px', background: '#10B981', borderRadius: '1px' }}></div>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Good {'(< 70%)'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '2px', background: '#3B82F6', borderRadius: '1px' }}></div>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Medium (70-85%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '2px', background: '#F59E0B', borderRadius: '1px' }}></div>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>High {'(> 85%)'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '2px', background: '#EF4444', borderRadius: '1px' }}></div>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Fault/Critical</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
