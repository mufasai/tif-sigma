import React, { useState, useRef, useEffect } from 'react';
import {
  FiChevronRight,
  FiHome,
  FiLayers,
  FiMapPin,
  FiRadio,
  FiZap,
  FiChevronLeft,
  FiMove,
  FiMinimize2,
  FiZoomIn,
  FiZoomOut
} from 'react-icons/fi';

type HierarchyLevel = 'national' | 'regional' | 'witel' | 'sto';

interface HierarchyConfig {
  level: HierarchyLevel;
  name: string;
  description: string;
  icon: React.ElementType;
  zoom: number;
  targetZoom: number;
}

interface NavigationPathItem {
  level: HierarchyLevel;
  name: string;
  identifier?: string;
}

interface DraggableNetworkHierarchyProps {
  currentLevel: HierarchyLevel;
  navigationPath: NavigationPathItem[];
  onLevelChange: (level: HierarchyLevel) => void;
  onNavigateBack: (level: HierarchyLevel) => void;
  onZoomToLevel: (level: HierarchyLevel, targetZoom: number) => void;
  currentZoom?: number;
  totalNodes?: number;
  totalLinks?: number;
}

const levelIcons: Record<HierarchyLevel, React.ElementType> = {
  national: FiHome,
  regional: FiLayers,
  witel: FiMapPin,
  sto: FiRadio
};

const hierarchyLevels: HierarchyConfig[] = [
  {
    level: 'national',
    name: 'National',
    description: 'Nationwide overview',
    icon: FiHome,
    zoom: 4,
    targetZoom: 4.5
  },
  {
    level: 'regional',
    name: 'Regional',
    description: 'Regional clusters',
    icon: FiLayers,
    zoom: 6,
    targetZoom: 6.5
  },
  {
    level: 'witel',
    name: 'Witel',
    description: 'Witel districts',
    icon: FiMapPin,
    zoom: 8,
    targetZoom: 8.5
  },
  {
    level: 'sto',
    name: 'STO',
    description: 'STO sites',
    icon: FiRadio,
    zoom: 10,
    targetZoom: 11
  }
];

const getNetworkLayerInfo = (zoom: number) => {
  if (zoom < 5.5) {
    return {
      layer: 'L1',
      name: 'National Backbone',
      description: 'Core infrastructure',
      icon: FiZap,
      color: '#DC2626',
      bgGradient: 'linear-gradient(135deg, #FEE2E2, #FECACA)'
    };
  } else if (zoom < 7) {
    return {
      layer: 'L2',
      name: 'Regional Aggregation',
      description: 'Metropolitan networks',
      icon: FiLayers,
      color: '#EA580C',
      bgGradient: 'linear-gradient(135deg, #FED7AA, #FDBA74)'
    };
  } else if (zoom < 9) {
    return {
      layer: 'L3',
      name: 'Witel Distribution',
      description: 'Local distribution',
      icon: FiMapPin,
      color: '#059669',
      bgGradient: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)'
    };
  } else {
    return {
      layer: 'L4',
      name: 'STO Detail',
      description: 'Site details',
      icon: FiRadio,
      color: '#4F46E5',
      bgGradient: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)'
    };
  }
};

export function DraggableNetworkHierarchy({
  currentLevel,
  navigationPath,
  onLevelChange,
  onNavigateBack,
  onZoomToLevel,
  currentZoom = 5,
  totalNodes = 0,
  totalLinks = 0
}: DraggableNetworkHierarchyProps) {
  const [position, setPosition] = useState({ x: 310, y: 16 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const panelRef = useRef<HTMLDivElement>(null);
  const networkLayer = getNetworkLayerInfo(currentZoom);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const NeumorphicContainer = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div
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
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.9)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0px)';
        e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.1)';
      }}
    >
      {children}
    </button>
  );

  if (isMinimized) {
    return (
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <NeumorphicContainer>
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div onMouseDown={handleMouseDown} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
              <FiMove style={{ width: '16px', height: '16px', color: '#6B7280' }} />
            </div>
            <NeumorphicButton onClick={() => setIsMinimized(false)} title="Expand Hierarchy Panel">
              <FiLayers style={{ width: '16px', height: '16px' }} />
            </NeumorphicButton>
          </div>
        </NeumorphicContainer>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        width: isCollapsed ? '280px' : '420px',
        cursor: isDragging ? 'grabbing' : 'default',
        transition: isDragging ? 'none' : 'width 0.3s ease'
      }}
    >
      <NeumorphicContainer style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              onMouseDown={handleMouseDown}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                padding: '4px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #6B728020, #6B728010)',
                border: '1px solid #6B728030',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Drag to move panel"
            >
              <FiMove style={{ width: '14px', height: '14px', color: '#6B7280' }} />
            </div>

            {!isCollapsed && (
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '2px' }}>
                  Network Hierarchy
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {totalNodes} nodes • {totalLinks} links
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <NeumorphicButton onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? 'Expand' : 'Collapse'} size="small">
              {isCollapsed ? <FiChevronRight style={{ width: '14px', height: '14px' }} /> : <FiChevronLeft style={{ width: '14px', height: '14px' }} />}
            </NeumorphicButton>

            <NeumorphicButton onClick={() => setIsMinimized(true)} title="Minimize Panel" size="small">
              <FiMinimize2 style={{ width: '14px', height: '14px' }} />
            </NeumorphicButton>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Navigation Path
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {navigationPath.map((item, index) => {
                  const IconComponent = levelIcons[item.level];
                  const isLast = index === navigationPath.length - 1;
                  const isClickable = !isLast;

                  return (
                    <React.Fragment key={`${item.level}-${item.identifier || item.name}`}>
                      <button
                        onClick={() => isClickable ? onNavigateBack(item.level) : undefined}
                        disabled={!isClickable}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: isClickable ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          background: isLast ? 'linear-gradient(135deg, #4F46E5, #3B82F6)' : 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(240,240,240,0.6))',
                          color: isLast ? '#FFFFFF' : '#374151',
                          fontWeight: isLast ? '600' : '500',
                          fontSize: '12px'
                        }}
                      >
                        <IconComponent style={{ width: '12px', height: '12px' }} />
                        <span>{item.name}</span>
                      </button>
                      {!isLast && <FiChevronRight style={{ width: '12px', height: '12px', color: '#9CA3AF' }} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Hierarchy Levels
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hierarchyLevels.map((level) => {
                  const IconComponent = level.icon;
                  const isActive = currentLevel === level.level;
                  const isAvailable = navigationPath.some(p => p.level === level.level) || level.level === 'national';

                  return (
                    <div key={level.level} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => {
                          if (isAvailable) {
                            onLevelChange(level.level);
                            onZoomToLevel(level.level, level.targetZoom);
                          }
                        }}
                        disabled={!isAvailable}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: 'none',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          transition: 'all 0.3s ease',
                          fontSize: '13px',
                          fontWeight: '500',
                          background: isActive ? 'linear-gradient(135deg, #4F46E5, #3B82F6)' : isAvailable ? 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(240,240,240,0.6))' : 'rgba(156,163,175,0.3)',
                          color: isActive ? '#FFFFFF' : isAvailable ? '#374151' : '#9CA3AF',
                          opacity: isAvailable ? 1 : 0.5
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(79,70,229,0.1)',
                          border: '1px solid rgba(79,70,229,0.2)'
                        }}>
                          <IconComponent style={{ width: '12px', height: '12px' }} />
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontWeight: '600' }}>{level.name}</div>
                          <div style={{ fontSize: '10px', color: isActive ? 'rgba(255,255,255,0.8)' : '#9CA3AF', fontWeight: '500' }}>
                            {level.description}
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '600', color: isActive ? 'rgba(255,255,255,0.9)' : '#6B7280' }}>
                          {level.targetZoom}x
                        </div>
                      </button>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <NeumorphicButton onClick={() => onZoomToLevel(level.level, level.targetZoom - 1)} title="Zoom Out" size="small">
                          <FiZoomOut style={{ width: '10px', height: '10px' }} />
                        </NeumorphicButton>
                        <NeumorphicButton onClick={() => onZoomToLevel(level.level, level.targetZoom + 1)} title="Zoom In" size="small">
                          <FiZoomIn style={{ width: '10px', height: '10px' }} />
                        </NeumorphicButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Current Layer
              </div>
              <div style={{ background: networkLayer.bgGradient, borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <networkLayer.icon style={{ width: '16px', height: '16px', color: networkLayer.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '2px' }}>
                      {networkLayer.layer} - {networkLayer.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: '500' }}>
                      {networkLayer.description}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', fontFamily: 'monospace' }}>
                    {currentZoom.toFixed(1)}x
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </NeumorphicContainer>
    </div>
  );
}
