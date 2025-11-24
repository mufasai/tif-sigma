import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiNavigation, FiFilter, FiX, FiMapPin, FiTarget } from 'react-icons/fi';

export interface SearchSuggestion {
  id: string;
  label: string; // This should map to the 'label' field from ruas rekap data (e.g., "BEKASI", "HDC CIKARANG")
  type: string; // This should map to the 'layer' field from ruas rekap data (e.g., "tera - pehdc")
  latitude: number; // This should map to the 'y' field from ruas rekap data
  longitude: number; // This should map to the 'x' field from ruas rekap data
  metadata?: Record<string, any>; // Additional fields like 'witel', 'platform', 'types', etc.
}

/**
 * Example conversion from ruas rekap node to SearchSuggestion:
 * 
 * const ruasNode = {
 *   id: "BKS",
 *   label: "BEKASI",
 *   layer: "tera - pehdc",
 *   platform: "cisco",
 *   witel: "BEKASI",
 *   types: "TERA",
 *   x: 107.02527,
 *   y: -6.24991
 * };
 * 
 * const suggestion: SearchSuggestion = {
 *   id: ruasNode.id,
 *   label: ruasNode.label,  // ✅ Use the label field directly
 *   type: ruasNode.layer,
 *   latitude: ruasNode.y,
 *   longitude: ruasNode.x,
 *   metadata: {
 *     witel: ruasNode.witel,
 *     platform: ruasNode.platform,
 *     types: ruasNode.types
 *   }
 * };
 */

interface CompactSearchBarProps {
  onSearch: (query: string, suggestion?: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  platformFilters?: string[];
  onFilterClick?: (platform: string) => void;
  onClearFilter?: () => void;
}

/**
 * Helper function to convert ruas rekap node data to SearchSuggestion format
 * This ensures the 'label' field from ruas rekap is properly mapped
 */
export function convertRuasNodeToSuggestion(node: {
  id: string;
  label: string;
  layer?: string;
  platform?: string;
  witel?: string;
  types?: string;
  sto?: string;
  x: number;
  y: number;
  [key: string]: any;
}): SearchSuggestion {
  return {
    id: node.id,
    label: node.label, // ✅ Maps directly from the 'label' field in ruas rekap data
    type: node.layer || 'unknown',
    latitude: node.y,
    longitude: node.x,
    metadata: {
      witel: node.witel,
      platform: node.platform,
      types: node.types,
      sto: node.sto,
      layer: node.layer
    }
  };
}

export function CompactSearchBar({ onSearch, suggestions = [], platformFilters = [], onFilterClick, onClearFilter }: CompactSearchBarProps) {
  const [query, setQuery] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [routeMode, setRouteMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SearchSuggestion | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on query
  // This filters by:
  // 1. suggestion.label - the main label from ruas rekap data (e.g., "BEKASI", "HDC CIKARANG")
  // 2. suggestion.type - the layer type (e.g., "tera - pehdc")
  // 3. suggestion.metadata.witel - the witel information
  // 4. suggestion.metadata.sto - the STO information
  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.label.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.type.toLowerCase().includes(query.toLowerCase()) ||
        (suggestion.metadata?.witel && suggestion.metadata.witel.toLowerCase().includes(query.toLowerCase())) ||
        (suggestion.metadata?.sto && suggestion.metadata.sto.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10); // Limit to 10 suggestions
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [query, suggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, selectedSuggestion || undefined);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.label);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion.label, suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
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
      // Call parent filter handler if provided
      if (onFilterClick) {
        onFilterClick(tag);
      }
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
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
            <FiSearch style={{ width: '16px', height: '16px', color: '#9CA3AF', flexShrink: 0 }} />
            <input
              ref={inputRef}
              placeholder="Search STO "
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedSuggestion(null);
                // Clear filter when user starts typing (if query becomes empty)
                if (e.target.value === '' && onClearFilter) {
                  onClearFilter();
                }
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (filteredSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
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
                onClick={() => {
                  setQuery('');
                  setSelectedSuggestion(null);
                  setShowSuggestions(false);
                  // Call clear filter handler to remove highlight layer
                  if (onClearFilter) {
                    onClearFilter();
                  }
                }}
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
                title="Clear search and filters"
              >
                <FiX style={{ width: '14px', height: '14px' }} />
              </button>
            )}
            <div style={{ height: '16px', width: '1px', background: '#E5E7EB' }}></div>
            {/* <button
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
            </button> */}
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
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '8px' }}>
                Platform Filters {platformFilters.length > 0 ? `(${platformFilters.length} available)` : ''}:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {platformFilters.length > 0 ? (
                  platformFilters.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => handleFilterClick(platform)}
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(79, 70, 229, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                      }}
                    >
                      {platform}
                    </button>
                  ))
                ) : (
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>
                    No platforms available. Please select a layer first.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: '16px',
                right: '16px',
                marginTop: '8px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(240,240,240,0.95))',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                maxHeight: '320px',
                overflowY: 'auto',
                zIndex: 1000
              }}
            >
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    borderBottom: index < filteredSuggestions.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    background: selectedSuggestionIndex === index ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    transition: 'background 0.15s ease',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSuggestionIndex !== index) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: suggestion.type === 'capacity' ? '#FF6B35' : 
                                  suggestion.type === 'sirkit' ? '#4ECDC4' : 
                                  suggestion.type === 'multilayer' ? '#9B59B6' : 
                                  suggestion.type === 'nodeedges' ? '#00BFFF' : '#999999',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937', marginBottom: '2px' }}>
                        {suggestion.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        {suggestion.type === 'capacity' && '📡 Capacity Node'}
                        {suggestion.type === 'sirkit' && '🔗 Sirkit Node'}
                        {suggestion.type === 'multilayer' && '🌐 Multilayer Node'}
                        {suggestion.type === 'nodeedges' && '⚡ Network Node'}
                        {suggestion.metadata?.witel && ` • ${suggestion.metadata.witel}`}
                        {suggestion.metadata?.sto && ` • ${suggestion.metadata.sto}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
