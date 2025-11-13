# Implementation Guide - MapLibreView UI Components

## 📋 Overview

This guide documents the implementation of UI components from `tif-visual-network-intelligence-platform-mockup` into `tif-sigma-fe/packages/demo` MapLibreView.

## 🎯 Implemented Components

### 1. **LeftSidebar** (`src/components/LeftSidebar.tsx`)
- **Location**: Fixed left side (16px from top-left)
- **Features**:
  - Collapsible/expandable panel
  - Minimizable to icon
  - Menu items: Dashboard, Topology, Layers, Analytics, Settings
  - Active menu highlighting with gradient
  - System status indicator
  - Neumorphic design with blur effects

### 2. **CompactSearchBar** (`src/components/CompactSearchBar.tsx`)
- **Location**: Fixed top center
- **Features**:
  - Two modes: Search mode and Route Planning mode
  - Quick filters dropdown
  - Real-time search
  - Route planning with start/end points
  - Glassmorphism design

### 3. **DraggableNetworkHierarchy** (`src/components/DraggableNetworkHierarchy.tsx`)
- **Location**: Draggable panel (initial position: 300px left, 16px top)
- **Features**:
  - Drag to reposition
  - Collapsible/minimizable
  - Hierarchy levels: National → Regional → Witel → STO
  - Breadcrumb navigation
  - Zoom integration
  - Network layer info display
  - Shows total nodes/links count

### 4. **Legend** (`src/components/Legend.tsx`)
- **Location**: Fixed bottom-right corner
- **Features**:
  - Expandable/collapsible
  - Vendor color coding (Cisco, Huawei, Nokia)
  - Link status indicators (Good, Medium, High, Fault)
  - Compact design

### 5. **SelectionInfoPanel** (Inline in MapLibreView)
- **Location**: Fixed top-right (only shows when region/witel selected)
- **Features**:
  - Current selection display
  - Clear individual selections
  - Clear all button
  - Node count display

## 🎨 Design System

### Color Palette
- **Primary**: `#4F46E5` (Indigo) / `#3B82F6` (Blue)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)
- **Neutral**: Grayscale from `#1F2937` to `#F9FAFB`

### Neumorphic Style
```css
background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9));
backdropFilter: blur(20px);
borderRadius: 16-20px;
border: 1px solid rgba(255,255,255,0.3);
boxShadow: 0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8);
```

### Typography
- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Sizes**: 
  - Heading: 16px (bold)
  - Body: 12-14px
  - Small: 10-11px
  - Labels: 10px (uppercase, letter-spacing: 0.5px)

## 🔧 State Management

### New State Variables Added to MapLibreView
```typescript
// Hierarchy navigation
const [currentLevel, setCurrentLevel] = useState<HierarchyLevel>("national");
const [activeMenu, setActiveMenu] = useState<string>("topology");
const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
const [selectedWitel, setSelectedWitel] = useState<string | undefined>();
const [navigationPath, setNavigationPath] = useState<NavigationPathItem[]>([
  { level: "national", name: "Indonesia" },
]);
const [currentZoom, setCurrentZoom] = useState(5);
```

### Handler Functions
```typescript
// Menu click handler
handleMenuClick(menu: string)

// Search handler
handleSearch(query: string)

// Hierarchy navigation
handleLevelChange(level: HierarchyLevel)
handleNavigateBack(level: HierarchyLevel)
handleZoomToLevel(level: HierarchyLevel, targetZoom: number)
```

## 📐 Layout & Z-Index Hierarchy

| Component | Z-Index | Position |
|-----------|---------|----------|
| LeftSidebar | 1000 | Fixed left |
| CompactSearchBar | 999 | Fixed top-center |
| DraggableHierarchy | 1000 | Draggable |
| SelectionInfo | 20 | Fixed top-right |
| Legend | 998 | Fixed bottom-right |
| Map Container | 0 | Relative |

## 🚀 Usage Example

```tsx
import { MapLibreView } from './views/MapLibreView';

function App() {
  return <MapLibreView onClose={() => navigate('/base')} />;
}
```

## 🎯 Key Features

### 1. Hierarchy Navigation
- **4 Levels**: National (4.5x) → Regional (6.5x) → Witel (8.5x) → STO (11x)
- **Auto-zoom**: Automatic zoom level adjustment based on hierarchy
- **Breadcrumbs**: Visual path with click-to-navigate

### 2. Map Integration
- Tracks map zoom changes
- Syncs zoom with hierarchy level
- Fly-to animation on level changes

### 3. Search & Filters
- Quick tag filters
- Route planning mode with start/end points
- Search history (future enhancement)

### 4. Responsive Design
- All panels adapt to screen size
- Mobile-friendly touch interactions
- Collapsible panels to maximize map space

## 🔄 State Flow

```
User Action → Handler → State Update → UI Re-render → Map Update
```

Example flow for level change:
```
User clicks "Regional" 
→ handleLevelChange('regional')
→ setCurrentLevel('regional')
→ handleZoomToLevel('regional', 6.5)
→ Map flies to zoom 6.5
→ UI updates breadcrumb & highlights
```

## 📝 Component Props

### LeftSidebar
```typescript
{
  onMenuClick: (menu: string) => void;
  activeMenu: string;
}
```

### CompactSearchBar
```typescript
{
  onSearch: (query: string) => void;
}
```

### DraggableNetworkHierarchy
```typescript
{
  currentLevel: HierarchyLevel;
  navigationPath: NavigationPathItem[];
  onLevelChange: (level: HierarchyLevel) => void;
  onNavigateBack: (level: HierarchyLevel) => void;
  onZoomToLevel: (level: HierarchyLevel, targetZoom: number) => void;
  currentZoom?: number;
  totalNodes?: number;
  totalLinks?: number;
}
```

## 🎨 Styling Guidelines

### Button States
- **Default**: Light gradient with inset shadow
- **Hover**: Slight lift (translateY(-1px)) + shadow
- **Active**: Gradient background (indigo to blue)
- **Disabled**: Opacity 0.5, cursor not-allowed

### Transitions
- **Duration**: 200-300ms
- **Easing**: `ease-in-out`
- **Properties**: `all` or specific (transform, opacity, background)

## 🐛 Known Considerations

1. **Z-Index Management**: Ensure no component conflicts with map controls
2. **Performance**: Draggable panel uses requestAnimationFrame for smooth movement
3. **Mobile**: Touch events handled for drag functionality
4. **Accessibility**: All interactive elements have titles/aria-labels

## 🔮 Future Enhancements

- [ ] Persist panel positions in localStorage
- [ ] Add keyboard shortcuts
- [ ] Implement search history
- [ ] Add filter presets
- [ ] Real-time collaboration indicators
- [ ] Export current view as image
- [ ] Save/load custom layouts

## 📚 Dependencies

```json
{
  "react": "^18.0.0",
  "react-icons": "^4.x",
  "maplibre-gl": "^3.x"
}
```

## 🎯 Integration Checklist

- [x] LeftSidebar component created
- [x] CompactSearchBar component created
- [x] DraggableNetworkHierarchy component created
- [x] Legend component created
- [x] State management added to MapLibreView
- [x] Handler functions implemented
- [x] Zoom synchronization working
- [x] SelectionInfoPanel integrated
- [x] Styling consistent across all components
- [x] TypeScript types defined
- [x] Components rendered above map

## 💡 Tips

1. **Customization**: All colors and sizes are defined inline for easy modification
2. **Performance**: Use React.memo() for components that don't need frequent re-renders
3. **Testing**: Test drag functionality across different screen sizes
4. **Accessibility**: Add ARIA labels for screen reader support

## 📞 Support

For issues or questions about the implementation:
1. Check component props and state
2. Verify z-index hierarchy
3. Ensure handler functions are properly connected
4. Check browser console for TypeScript errors

---

**Last Updated**: 2024
**Version**: 1.0.0
**Author**: Implementation Team