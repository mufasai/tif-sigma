# Quick Start Guide - MapLibreView Enhanced UI

## 🚀 Getting Started

### Installation

All components are already integrated. No additional installation required!

### Running the Application

```bash
# Navigate to the demo package
cd tif-sigma-fe/packages/demo

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

## 🎮 Component Overview

### 1. Left Sidebar (Control Panel)

**Location**: Top-left corner  
**Hotkey**: Click minimize icon to toggle

**Features**:
- **Dashboard**: Overview metrics and KPIs
- **Topology**: Network topology view (default)
- **Layers**: Map layer controls
- **Analytics**: Data analysis tools
- **Settings**: Configuration options

**Usage**:
```tsx
// Click any menu item to switch views
<LeftSidebar 
  onMenuClick={handleMenuClick} 
  activeMenu="topology" 
/>
```

**Tips**:
- Click chevron to collapse/expand
- Click X to minimize to single icon
- Click minimized icon to restore panel

---

### 2. Search Bar (Top Center)

**Location**: Top center of map  
**Modes**: Search / Route Planning

**Search Mode**:
1. Type query in search box
2. Press Enter or click "Search"
3. Use quick filters for common searches

**Route Planning Mode**:
1. Click navigation (compass) icon
2. Enter start point
3. Enter destination
4. Click "Find Route"

**Quick Filters**:
- CISCO, HUAWEI, NOKIA (vendor filters)
- Active, Inactive (status filters)
- High Utilization (performance filter)

**Usage Example**:
```tsx
// Search for a node
onSearch("Jakarta PE1")

// Route planning
onSearch("Route: Jakarta PE1 → Surabaya PE2")
```

---

### 3. Network Hierarchy Panel (Draggable)

**Location**: Starts at top-center-left (draggable)  
**Initial Position**: 300px from left, 16px from top

**4 Hierarchy Levels**:
1. **National** (Zoom 4.5x) - Indonesia overview
2. **Regional** (Zoom 6.5x) - Regional clusters
3. **Witel** (Zoom 8.5x) - Witel districts
4. **STO** (Zoom 11x) - STO site details

**Controls**:
- **Drag Handle**: Click and drag to reposition panel
- **Collapse**: Reduce panel width
- **Minimize**: Hide panel completely
- **Zoom Buttons**: Fine-tune zoom for each level

**Navigation**:
```
Indonesia → Regional X → Witel Y → STO Z
    ↑          ↑           ↑         ↑
  Click    Click       Click     Current
  to go    to go       to go     Level
  back     back        back
```

**Current Layer Display**:
- L1: National Backbone (Red)
- L2: Regional Aggregation (Orange)
- L3: Witel Distribution (Green)
- L4: STO Detail (Purple)

---

### 4. Selection Info Panel

**Location**: Top-right corner  
**Visibility**: Only shows when region/witel selected

**Information Displayed**:
- Currently selected region
- Currently selected witel
- Total nodes visible
- Clear individual or all selections

**Usage**:
```tsx
// Select a region
setSelectedRegion("Region 1")

// Select a witel
setSelectedWitel("Witel Jakarta")

// Clear all
setSelectedRegion(undefined)
setSelectedWitel(undefined)
```

---

### 5. Legend

**Location**: Bottom-right corner  
**Toggle**: Click chevron to expand/collapse

**Color Codes**:

**Vendors**:
- 🔵 Blue = CISCO
- 🔴 Pink = HUAWEI
- 🟣 Purple = NOKIA

**Link Status**:
- 🟢 Green = Good (< 70% utilization)
- 🔵 Blue = Medium (70-85%)
- 🟡 Amber = High (> 85%)
- 🔴 Red = Fault/Critical

---

## 📋 Common Workflows

### Workflow 1: Navigate Network Hierarchy

```
1. Open Hierarchy Panel (if minimized)
2. Click desired level (National → Regional → Witel → STO)
3. Map automatically zooms to appropriate level
4. Use breadcrumbs to navigate back up
```

### Workflow 2: Search for Network Element

```
1. Click search bar at top
2. Type node name or identifier
3. Press Enter or click Search
4. Map centers on found element
5. Details panel opens (if available)
```

### Workflow 3: Plan Route Between Two Points

```
1. Click compass icon in search bar
2. Enter start point (or use quick select)
3. Enter destination (or use quick select)
4. Click "Find Route"
5. Route displays on map with path
```

### Workflow 4: Filter by Vendor

```
1. Click filter icon in search bar
2. Select vendor (CISCO/HUAWEI/NOKIA)
3. Map displays only selected vendor equipment
4. Use "Clear All" to reset
```

### Workflow 5: Zoom to Specific Area

```
1. Use Hierarchy Panel zoom controls
2. OR scroll mouse wheel on map
3. OR use +/- buttons on map
4. Hierarchy level auto-updates based on zoom
```

---

## ⌨️ Keyboard Shortcuts (Future)

Currently not implemented, but planned:

- `Ctrl + /` - Focus search bar
- `Ctrl + H` - Toggle hierarchy panel
- `Ctrl + L` - Toggle legend
- `Ctrl + M` - Toggle menu sidebar
- `Escape` - Close all panels

---

## 🎨 Customization

### Change Panel Position

Edit initial position in component:
```tsx
// DraggableNetworkHierarchy.tsx
const [position, setPosition] = useState({ 
  x: 300,  // Change X position
  y: 16    // Change Y position
});
```

### Change Zoom Levels

Edit zoom targets:
```tsx
const zoomTargets = {
  national: 4.5,   // Change zoom level
  regional: 6.5,
  witel: 8.5,
  sto: 11,
};
```

### Change Colors

Edit color constants:
```tsx
// Primary colors
const primaryIndigo = '#4F46E5';
const primaryBlue = '#3B82F6';

// Status colors
const statusGood = '#10B981';
const statusWarning = '#F59E0B';
const statusError = '#EF4444';
```

---

## 🐛 Troubleshooting

### Panel Not Visible
- Check z-index hierarchy
- Ensure state is initialized properly
- Check browser console for errors

### Drag Not Working
- Verify mouse events are not blocked
- Check if panel has `cursor: grab` style
- Ensure `isDragging` state is working

### Search Not Working
- Verify `onSearch` handler is connected
- Check console for search query logs
- Ensure search function is implemented

### Zoom Not Syncing
- Check map reference is valid
- Verify zoom event listener is attached
- Ensure `currentZoom` state updates

---

## 💡 Best Practices

1. **Panel Management**
   - Minimize unused panels to maximize map space
   - Use drag to position panels for your workflow
   - Collapse panels when only icons needed

2. **Navigation**
   - Use breadcrumbs for quick navigation
   - Zoom buttons for fine-tuning view
   - Search for direct element access

3. **Performance**
   - Close unnecessary panels
   - Limit visible layers
   - Use filters to reduce displayed data

4. **Mobile Usage**
   - All panels are touch-enabled
   - Drag works with touch gestures
   - Buttons have adequate touch targets

---

## 📊 Sample Data

The demo includes sample data from:
- `joined_data.csv` - Main network element data
- `kabupaten.data.ts` - Kabupaten boundaries
- `capacity` layer - Equipment capacity data
- `sirkit` layer - Circuit connections
- `multilayer` - GeoJSON network topology

---

## 🔗 Related Files

- `src/views/MapLibreView.tsx` - Main view component
- `src/components/LeftSidebar.tsx` - Menu sidebar
- `src/components/CompactSearchBar.tsx` - Search component
- `src/components/DraggableNetworkHierarchy.tsx` - Hierarchy panel
- `src/components/Legend.tsx` - Map legend
- `src/styles/maplibre-view.css` - Styling

---

## 📞 Need Help?

1. Check `IMPLEMENTATION_GUIDE.md` for technical details
2. Review component props and state management
3. Inspect browser console for errors
4. Check network tab for data loading issues

---

**Happy Mapping! 🗺️**