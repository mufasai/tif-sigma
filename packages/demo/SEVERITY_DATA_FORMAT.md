# Severity Data Format - Backend Integration Guide

## Overview
This document describes the expected data format for the `severity` field that should be provided by the backend API for network link visualization.

## Severity Field

### Location
The `severity` field should be included in each **edge/link object** in the topology data.

### Data Type
- **Type**: `string`
- **Required**: No (optional - will fallback to calculated severity if not provided)
- **Case**: lowercase

### Valid Values

| Value | Color | Hex Code | Description | Utilization Range |
|-------|-------|----------|-------------|-------------------|
| `"low"` | Green | `#10B981` | Normal operation | < 60% |
| `"minor"` | Yellow | `#F59E0B` | Warning - approaching capacity | 60-75% |
| `"major"` | Orange | `#F97316` | High utilization - attention needed | 75-90% |
| `"critical"` | Red | `#EF4444` | Critical - immediate action required | ≥ 90% |

## Data Structure Examples

### Example 1: Ruas Rekap Layer (trunk_all_*.json)
```json
{
  "nodes": [...],
  "edges": [
    {
      "id": "edge_001",
      "source": "NODE_A",
      "target": "NODE_B",
      "source_label": "Router A",
      "target_label": "Router B",
      "total_capacity": 10000000000,
      "traffic_in_log": 8500000000,
      "traffic_out_log": 8200000000,
      "avg_utilization": 85,
      "severity": "major",  // ← Backend provides this field
      "link_count": 2,
      "layer_list": "TERA-TERA",
      "ruas_list": "JAKARTA-BANDUNG",
      "details": [...]
    }
  ]
}
```

### Example 2: Ruas Rekap STO Layer (ruas_rekap_sto.json)
```json
{
  "nodes": [...],
  "edges": [
    {
      "id": "sto_edge_001",
      "source": "STO_JKT_001",
      "target": "STO_BDG_001",
      "total_capacity": 5000000000,
      "total_traffic_95_in": 4500000000,
      "total_traffic_95_out": 4300000000,
      "avg_utilization": 90,
      "severity": "critical",  // ← Backend provides this field
      "link_count": 1,
      "layer_list": "METRO",
      "ruas_list": "JKT-BDG-001"
    }
  ]
}
```

### Example 3: Old Structure (node.topology)
```json
{
  "nodes": [
    {
      "id": "NODE_A",
      "label": "Router A",
      "topology": [
        {
          "source": "NODE_A",
          "target": "NODE_B",
          "capacity": 10000000000,
          "utilization": 75,
          "severity": "major",  // ← Backend provides this field
          "ruas": "LINK_001"
        }
      ]
    }
  ]
}
```

## Fallback Behavior

If the `severity` field is **not provided** by the backend, the frontend will automatically calculate it based on utilization percentage:

```typescript
// Fallback calculation (frontend)
function calculateSeverity(utilization: number): string {
  if (utilization >= 90) return 'critical';
  if (utilization >= 75) return 'major';
  if (utilization >= 60) return 'minor';
  return 'low';
}
```

## Implementation Notes

### For Backend Developers:

1. **Add `severity` field** to all edge/link objects in your API responses
2. **Calculate severity** based on your business logic (utilization, SLA, historical data, etc.)
3. **Use lowercase** values: `"low"`, `"minor"`, `"major"`, `"critical"`
4. **Optional field**: If not provided, frontend will calculate based on utilization

### For Frontend Developers:

The frontend code already handles both scenarios:
```typescript
// Priority: Backend severity > Calculated severity
const severity = edge.severity || calculateSeverity(utilization);
```

## Visual Representation

The severity is displayed in multiple places:

1. **Map Lines**: Edge colors on the map
   - Green lines: Low severity
   - Yellow lines: Minor severity
   - Orange lines: Major severity
   - Red lines: Critical severity

2. **Hover Popups**: Shows severity label and color

3. **Click Details**: Displays severity in link details panel

4. **Legend**: Bottom-right corner shows severity color guide

## API Endpoints Affected

The following API endpoints should include the `severity` field:

- `/api/topology/ruas-rekap/trunk_all_*` (all trunk layers)
- `/api/topology/ruas-rekap-sto`
- `/api/topology/sigma-topology`
- Any other endpoint that provides edge/link data

## Testing

### Test Cases:

1. **With severity from backend**: Verify colors match backend severity
2. **Without severity**: Verify fallback calculation works correctly
3. **Invalid severity value**: Should fallback to calculated severity
4. **Mixed data**: Some edges with severity, some without

### Sample Test Data:

```json
{
  "edges": [
    {"id": "1", "utilization": 50, "severity": "low"},      // Green
    {"id": "2", "utilization": 65, "severity": "minor"},    // Yellow
    {"id": "3", "utilization": 80, "severity": "major"},    // Orange
    {"id": "4", "utilization": 95, "severity": "critical"}, // Red
    {"id": "5", "utilization": 70}                          // No severity - will calculate
  ]
}
```

## Questions?

Contact the frontend team for any questions about the severity field implementation.
