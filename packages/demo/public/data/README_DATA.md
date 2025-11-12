# Data Files Documentation

## Capacity Data Files

### capacity_ref_202511101441.csv
- **Timestamp**: 2025-11-10 14:41
- **Columns**: sto, sto_l, witel, longitude, latitude, boundary, types, platform, node, reg, hostname, manufacture, version, tipe_card, port_used, port_idle
- **Purpose**: Detailed equipment capacity data with port information
- **Key Features**:
  - Contains hostname information
  - Includes port usage statistics (port_used, port_idle)
  - Has equipment version and card type details
  - Used for detailed equipment analysis

### capacity_ref_202511101613.csv
- **Timestamp**: 2025-11-10 16:13
- **Columns**: sto, sto_l, witel, longitude, latitude, boundary, types, platform, node, reg, cap
- **Purpose**: Simplified capacity data with capacity values
- **Key Features**:
  - Contains 'cap' column for capacity values
  - More streamlined data structure
  - Focused on capacity metrics
  - **Currently used in the application**

## Circuit Data Files

### list_sirkit_ref_202511101614.csv
- **Timestamp**: 2025-11-10 16:14
- **Columns**: sto, sto_l, witel, longitude, latitude, boundary, types, platform, node, reg, sap_descp, node_id, sap, vrf_srvtipe, ipadd_v4, sap_admst, port_descp, n2_node, sap_2, sap_descp_2, serviceid, serv_descp, precedence, me_akses, me_aksesport, me_aksessap, me_aksesvlan, port_descp_2, oltip, oltname, manufacture, port_int, jm_onu, sap_1, sap_descp_1, port_descp_1
- **Purpose**: Circuit/service data with network topology
- **Key Features**:
  - Contains boundary data (WKT POLYGON format)
  - Includes SAP (Service Access Point) information
  - Has OLT (Optical Line Terminal) details
  - Network service descriptions
  - IP addressing information
  - **Displays both points and boundaries on map**

## Layer Visualization

### Capacity Layer
- **Color**: Orange (#FF6B35)
- **Data Source**: capacity_ref_202511101613.csv
- **Features**:
  - Equipment points with capacity info
  - Connecting lines between equipment
  - STO boundary polygons
  - Popup shows: hostname, manufacture, platform, capacity, ports

### Sirkit Layer
- **Color**: Cyan (#4ECDC4)
- **Data Source**: list_sirkit_ref_202511101614.csv
- **Features**:
  - Circuit points
  - STO boundary polygons (from WKT data)
  - Popup shows: node, STO, witel, region, SAP info, OLT details
  - Boundary popup shows: STO name, circuit count

### Sigma Layer
- **Color**: Red (#e22352)
- **Data Source**: airports.json
- **Features**:
  - Airport nodes as graph
  - Flight connections as edges
  - Interactive graph overlay on map
