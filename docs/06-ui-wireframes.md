# AgriConnect — UI Design System & Dual Theme Specification

## 1. Dual Theme System Architecture
AgriConnect features a dynamic, persistent dual-theme engine controlled via the top navigation bar and persisted in `localStorage`.

### Theme 1: Emerald Harvest (Default)
- **Concept**: Lush Organic Farmland & Herbal Vitality.
- **Brand Colors**:
  - Primary Brand: Emerald 600 (`#059669`)
  - Accent / Highlights: Mint 500 (`#10b981`)
  - Background Tint: Light Green Tint (`#ecfdf5`)
  - Text & Headings: Slate 900 (`#0f172a`)
- **Use Case**: Default high-clarity viewing, organic market feel, crisp contrast.

### Theme 2: Golden Sunset (Warm Amber / Sunlit Earth)
- **Concept**: Warm Harvest Grain, Sunlit Fields & Countryside Earth.
- **Brand Colors**:
  - Primary Brand: Amber 600 (`#d97706`)
  - Accent / Highlights: Warm Gold 500 (`#f59e0b`)
  - Background Tint: Warm Amber 50 (`#fffbeb`)
  - Text & Headings: Slate 900 (`#0f172a`)
- **Use Case**: High-comfort warm tone, optimal for outdoor sunlight reading and harvest season aesthetics.

---

## 2. Page Wireframes & Layout Structures

### 2.1 Public Storefront
```
+------------------------------------------------------------------------+
| [Logo: AgriConnect]   Home   Browse   Leaf AI   Mandi   [Theme] [EN] [Cart] [Login] |
+------------------------------------------------------------------------+
|                                                                        |
|    "Fresh From Farm, Directly to Your Doorstep"                         |
|    [Search fresh tomatoes, onions, wheat...                  [Search]] |
|    Popular: Tomatoes | Nashik Onions | Sharbati Wheat | Apples         |
|                                                                        |
+------------------------------------------------------------------------+
|  [Leaf Disease AI]      [Verified Farmers]      [Mandi Price Forecast] |
+------------------------------------------------------------------------+
|  Fresh Harvest Today:                                                  |
|  [Card: Tomato]         [Card: Onion]           [Card: Wheat]          |
|  ₹35/kg [Add]           ₹28/kg [Add]            ₹42/kg [Add]           |
+------------------------------------------------------------------------+
```

### 2.2 Farmer Dashboard
```
+------------------------------------------------------------------------+
| [AgriConnect Farmer]    Back to Storefront        [Theme Toggle] [Profile] |
+-------------------+----------------------------------------------------+
| • Dashboard       |  Welcome, Rameshwar Patil (Patil Organic Farms)    |
| • Crop Yields     |  [Total Output: 19,000kg] [Pending Orders: 2]      |
| • Disease AI      |                                                    |
| • Produce Catalog |  Incoming Orders Fulfillment:                      |
| • Orders          |  #ORD-101 | 10kg Tomatoes | [Accept] [Reject]      |
| • Price Forecast  |                                                    |
| • Reviews         |  Seasonal Yield Production (Recharts Bar Chart)    |
+-------------------+----------------------------------------------------+
```

### 2.3 Plant Leaf Diagnostic Interface
```
+------------------------------------------------------------------------+
| Leaf Photo Upload Zone:                                                |
| [ Drag & Drop Leaf Image / Pick Demo Leaf ]  ->  [Run Diagnostic Scan]  |
|                                                                        |
| Diagnostic Report:                                                     |
| Disease: Tomato - Early Blight (Alternaria solani)                     |
| Confidence: 91.5% [========================]                           |
| Top-3: 1. Early Blight (91.5%) | 2. Late Blight (5.2%) | 3. Healthy   |
|                                                                        |
| [Organic Remedies]    [Chemical Control]    [Prevention & Dosage]      |
| - Copper fungicide spray every 7 days                                  |
| - Remove infected lower leaves promptly                                |
+------------------------------------------------------------------------+
```

### 2.4 Administrator Console
```
+------------------------------------------------------------------------+
| [Admin Console]         Overview   Verification   Users   Disputes     |
+-------------------+----------------------------------------------------+
| • Overview        |  Platform GMV: ₹125,000 | Active Farmers: 12       |
| • Verification    |                                                    |
| • User Directory  |  Farmer Verification Queue:                        |
| • Transactions    |  Suresh Yadav (8.0 Acres) [View ID Proof]          |
| • Disputes        |  Actions: [Approve Farmer]  [Reject with Reason]   |
| • Analytics       |                                                    |
| • Broadcast       |  Regional Disease Hotspot Clusters:                |
| • Audit Logs      |  Nashik: Tomato Early Blight (14 incidents)        |
+-------------------+----------------------------------------------------+
```
