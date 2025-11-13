# Link Details Panel & Topology Drawer Integration

## Overview
Successfully integrated LinkDetailsPanel and TopologyDrawer components into MapLibreView with proper inline styling.

## Components Created

### 1. LinkDetailsPanel (`src/components/LinkDetailsPanel.tsx`)
- **Purpose**: Displays detailed analytics for network links/connections
- **Features**:
  - Summary stats (Capacity, Utilization, Links, Latency)
  - Physical links table with utilization bars
  - Performance metrics grid
  - Recent alerts section
  - Neumorphic card design with glassmorphism effects
- **Styling**: Pure inline styles (no Tailwind dependencies)

### 2. TopologyDrawer (`src/components/TopologyDrawer.tsx`)
- **Purpose**: Shows network topology visualization for selected connections
- **Features**:
  - Draggable and collapsible drawer
  - **Sigma.js-based interactive topology diagram**
  - Hierarchical network layout (PE → AGG → ACCESS)
  - Node types: PE (blue), AGG (purple), ACCESS (green)
  - Link capacity labels on edges
  - Interactive graph with zoom and pan
  - Stats summary (Nodes, Links, Status)
- **Styling**: Pure inline styles (no Tailwind dependencies)
- **Technology**: Sigma.js + Graphology for graph rendering

## Integration Points in MapLibreView

### State Management
```typescript
// Link and Topology drawer states
const [showLinkDetails, setShowLinkDetails] = useState(false);
const [selectedLink, setSelectedLink] = useState<{...} | null>(null);
const [showTopologyDrawer, setShowTopologyDrawer] = useState(false);
const [topologyConnection, setTopologyConnection] = useState<{...} | null>(null);
```

### Click Handlers

#### 1. Multilayer Map Lines
- Shows LinkDetailsPanel with connection details
- Shows TopologyDrawer with network topology
- Extracts from/to from line properties

#### 2. Multilayer Map Points
- Shows NodeDetailDialog
- Shows TopologyDrawer for node context

#### 3. Capacity Layer Points
- Shows NodeDetailDialog
- Shows TopologyDrawer for node context

#### 4. Capacity Layer Lines
- Shows LinkDetailsPanel with link analytics
- Shows TopologyDrawer with topology view

#### 5. Sirkit Layer Points
- Shows NodeDetailDialog
- Shows TopologyDrawer for node context

## Usage

### When User Clicks a Line/Connection:
1. LinkDetailsPanel appears on the right side
2. TopologyDrawer appears at the bottom (draggable)
3. Both panels show information about the selected connection

### When User Clicks a Node/Point:
1. NodeDetailDialog appears (existing functionality)
2. TopologyDrawer appears showing node's network context

### Closing Panels:
- Click X button on LinkDetailsPanel
- Click X button or collapse button on TopologyDrawer
- Panels close independently

## Styling Approach

All components use **inline styles** instead of Tailwind CSS classes to ensure:
- No dependency on Tailwind configuration
- Consistent rendering across different environments
- Glassmorphism and neumorphic effects work out of the box

### Key Style Features:
- Glassmorphism: `backdrop-filter: blur()`
- Neumorphic shadows: Multiple box-shadows
- Smooth transitions: CSS transitions on hover
- Responsive layouts: Flexbox and Grid

## Testing

To test the integration:
1. Load MapLibreView
2. Enable "Multilayer Map" layer from sidebar
3. Click on any line (connection) → LinkDetailsPanel + TopologyDrawer appear
4. Click on any node (point) → NodeDetailDialog + TopologyDrawer appear
5. Test dragging TopologyDrawer
6. Test collapsing/expanding TopologyDrawer
7. Test closing panels

## Topology Visualization Details

### Sigma.js Integration
The TopologyDrawer now uses **Sigma.js** for interactive network topology visualization:

- **Graph Structure**: Hierarchical 3-layer network topology
  - Layer 1 (Top): PE nodes - Provider Edge routers
  - Layer 2 (Middle): AGG nodes - Aggregation switches
  - Layer 3 (Bottom): ACCESS nodes - Access layer devices

- **Node Styling**:
  - PE nodes: Blue (#3b82f6), size 20
  - AGG nodes: Purple (#8b5cf6), size 18
  - ACCESS nodes: Green (#10b981), size 15

- **Edge Styling**:
  - PE-PE backbone: Blue, size 4, labeled "100G"
  - PE-AGG links: Green, size 3, labeled "100G"
  - AGG-AGG links: Green, size 3, labeled "50G"
  - AGG-ACCESS links: Green, size 2, labeled "10G"

- **Interactive Features**:
  - Zoom and pan with mouse
  - Node and edge labels
  - Smooth rendering with WebGL

### Layout Algorithm
The topology uses a fixed hierarchical layout:
- PE nodes positioned at y=3 (top)
- AGG nodes positioned at y=0 (middle)
- ACCESS nodes positioned at y=-3 (bottom)
- Horizontal spacing for left/right network sides

## Future Enhancements

- [ ] Add real topology data from backend
- [ ] Implement node click events in topology drawer
- [ ] Add topology export functionality (PNG/SVG)
- [ ] Add link performance history charts
- [ ] Implement topology path highlighting on map
- [ ] Add topology comparison view
- [ ] Add dynamic layout algorithms (force-directed, circular)
- [ ] Add node filtering and search in topology
- [ ] Add real-time utilization updates on edges
