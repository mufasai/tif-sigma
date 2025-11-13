import { useState } from 'react';
import { FiSearch, FiNavigation, FiFilter, FiX, FiPlus, FiMapPin, FiTarget } from 'react-icons/fi';

interface CompactSearchBarProps {
  onSearch: (query: string) => void;
}

export function CompactSearchBar({ onSearch }: CompactSearchBarProps) {
  const [query, setQuery] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [routeMode, setRouteMode] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const toggleRouteMode = () => {
    setRouteMode(!routeMode);
    if (routeMode) {
      setStartPoint('');
      setEndPoint('');
    }
  };

  const handleRouteSearch = () => {
    if (startPoint.trim() && endPoint.trim()) {
      onSearch(`Route: ${startPoint} → ${endPoint}`);
    }
  };

  const handleFilterClick = (tag: string) => {
    if (routeMode) {
      if (!startPoint) {
        setStartPoint(tag);
      } else if (!endPoint) {
        setEndPoint(tag);
      }
    } else {
      setQuery(tag);
    }
    setShowFilters(false);
  };

  if (!routeMode) {
    return (
      <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, width: '100%', maxWidth: '448px', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
            <FiSearch style={{ width: '16px', height: '16px', color: '#9CA3AF', flexShrink: 0 }} />
            <input
              placeholder="Search NE, link, area, witel..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                border: 'none',
                background: 'transparent',
                height: '32px',
                fontSize: '14px',
                outline: 'none',
                padding: 0,
                flex: 1,
                color: '#1F2937',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9CA3AF'
                }}
              >
                <FiX style={{ width: '14px', height: '14px' }} />
              </button>
            )}
            <div style={{ height: '16px', width: '1px', background: '#E5E7EB' }}></div>
            <button
              onClick={toggleRouteMode}
              title="Route Planning Mode"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                transition: 'all 0.2s ease'
              }}
            >
              <FiPlus style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              title="Filters"
              style={{
                background: showFilters ? 'linear-gradient(135deg, #4F46E520, #3B82F610)' : 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: showFilters ? '#4F46E5' : '#6B7280',
                transition: 'all 0.2s ease'
              }}
            >
              <FiFilter style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={toggleRouteMode}
              title="Route Planning"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                transition: 'all 0.2s ease'
              }}
            >
              <FiNavigation style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={handleSearch}
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px 12px',
                cursor: 'pointer',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              Search
            </button>
          </div>

          {showFilters && (
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', padding: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '8px' }}>Quick Filters:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['CISCO', 'HUAWEI', 'NOKIA', 'Active', 'Inactive', 'High Utilization'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleFilterClick(tag)}
                    style={{
                      fontSize: '12px',
                      padding: '6px 12px',
                      background: 'rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '8px',
                      color: '#374151',
                      transition: 'all 0.2s',
                      border: '1px solid rgba(0,0,0,0.05)',
                      cursor: 'pointer'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, width: '100%', maxWidth: '896px', padding: '0 16px' }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
              flexShrink: 0
            }}>
              <FiMapPin style={{ width: '14px', height: '14px', color: '#059669' }} />
            </div>
            <input
              placeholder="Start point..."
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                height: '32px',
                fontSize: '14px',
                outline: 'none',
                padding: 0,
                flex: 1,
                color: '#1F2937',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
            {startPoint && (
              <button onClick={() => setStartPoint('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9CA3AF' }}>
                <FiX style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '14px', color: '#9CA3AF' }}>→</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
              flexShrink: 0
            }}>
              <FiTarget style={{ width: '14px', height: '14px', color: '#DC2626' }} />
            </div>
            <input
              placeholder="Destination..."
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                height: '32px',
                fontSize: '14px',
                outline: 'none',
                padding: 0,
                flex: 1,
                color: '#1F2937',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
            {endPoint && (
              <button onClick={() => setEndPoint('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9CA3AF' }}>
                <FiX style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>

          <div style={{ height: '16px', width: '1px', background: '#E5E7EB' }}></div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? 'linear-gradient(135deg, #4F46E520, #3B82F610)' : 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px',
              cursor: 'pointer',
              color: showFilters ? '#4F46E5' : '#6B7280'
            }}
          >
            <FiFilter style={{ width: '16px', height: '16px' }} />
          </button>
          <button
            onClick={toggleRouteMode}
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,240,0.7))',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px',
              cursor: 'pointer',
              color: '#6B7280'
            }}
          >
            <FiX style={{ width: '16px', height: '16px' }} />
          </button>
          <button
            onClick={handleRouteSearch}
            disabled={!startPoint || !endPoint}
            style={{
              background: !startPoint || !endPoint ? 'linear-gradient(135deg, #9CA3AF, #6B7280)' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px 12px',
              cursor: !startPoint || !endPoint ? 'not-allowed' : 'pointer',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '600',
              opacity: !startPoint || !endPoint ? 0.5 : 1
            }}
          >
            Find Route
          </button>
        </div>

        {showFilters && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', padding: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '8px' }}>
              Quick Select {!startPoint ? '(Start)' : !endPoint ? '(Destination)' : ''}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Jakarta PE1', 'Surabaya PE2', 'Bandung PE3', 'Medan PE4', 'Semarang PE5'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleFilterClick(tag)}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '8px',
                    color: '#374151',
                    border: '1px solid rgba(0,0,0,0.05)',
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
