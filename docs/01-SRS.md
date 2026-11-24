# AgriConnect — Software Requirements Specification (SRS)

## 1. Introduction
### 1.1 Purpose
This document provides a comprehensive specification of requirements for AgriConnect, a web-based agricultural commerce and diagnostic system connecting verified farmers, urban consumers, and platform administrators.

### 1.2 User Classes and Roles
- **Farmer**: Producers who log yield metrics, perform AI disease diagnosis, publish produce listings, and fulfill customer shipments.
- **Customer**: Retail buyers who search produce, maintain shopping carts, place orders, complete payments, and submit reviews after delivery.
- **Administrator**: Operational personnel who review identity/land documents, resolve disputes, moderate listings/reviews, monitor audit trails, and transmit broadcasts.

---

## 2. Functional Requirements

| ID | Module | Requirement Description | Role |
| :--- | :--- | :--- | :--- |
| **FR-01** | Auth | User can register and log in via email or phone with bcrypt password hashing; receives JWT access (15 min) and refresh tokens (7 days). | All |
| **FR-02** | Auth | Farmer registration requires farm details and government ID proof upload; starts with `pending` status until admin review. | Farmer |
| **FR-03** | Profile | Users can view and update profile address, contact numbers, and avatars. | All |
| **FR-04** | Yield | Farmers can perform full CRUD on seasonal crop yields (crop, season, sowing date, harvest date, output, land acreage). | Farmer |
| **FR-05** | Yield | System visualizes yield trends across seasons (Kharif, Rabi, Zaid) and years with interactive comparison charts. | Farmer |
| **FR-06** | Disease | Farmer uploads leaf photo and receives predicted disease class, confidence score, and top-3 ranked alternatives within 3 seconds. | Farmer |
| **FR-07** | Disease | Diagnostic result renders chemical treatment, organic alternative, application dosage, and prevention tips. | Farmer |
| **FR-08** | Disease | Model predictions below 60% confidence are marked `uncertain` with explicit guidance to consult local extension officers. | Farmer |
| **FR-09** | Disease | Farmer can view full timestamped history of previous leaf diagnostic scans. | Farmer |
| **FR-10** | Listing | Approved farmers can create, edit, pause, and delete marketplace produce listings with price, stock, grade (A/B/C), and photos. | Farmer |
| **FR-11** | Browse | Customers can search and filter live produce by crop, farmer, district, price range, and organic certification. | Customer |
| **FR-12** | Browse | Customers can inspect public farmer profiles with reliability ratings and farm details. | Customer |
| **FR-13** | Order | Customers can manage shopping carts and checkout with delivery address and fulfillment choice (home delivery or farm pickup). | Customer |
| **FR-14** | Order | Farmers can accept or reject incoming orders and update status along the lifecycle: `pending` -> `confirmed` -> `shipped` -> `delivered`. | Farmer |
| **FR-15** | Order | Customers can track live status of orders on an interactive progress timeline. | Customer |
| **FR-16** | Payment | Customers can settle orders via Razorpay test gateway (cards/UPI/netbanking) or Cash on Delivery (COD). | Customer |
| **FR-17** | Review | Customers can rate (1 to 5 stars) and review a farmer only after the order status has been verified as `delivered`. | Customer |
| **FR-18** | Notify | Users receive notifications for status changes, approvals, and platform broadcasts. | All |
| **FR-19** | Admin | Admin views aggregate dashboard totals: farmers, pending verifications, customers, active listings, order counts, and GMV revenue. | Admin |
| **FR-20** | Admin | Admin approves or rejects farmer verification applications with required reason notes. | Admin |
| **FR-21** | Admin | Admin can search, filter, block, and unblock user accounts across all roles. | Admin |
| **FR-22** | Admin | Admin can inspect complete financial transaction ledger with seller, buyer, and date filters. | Admin |
| **FR-23** | Admin | Admin can adjudicate buyer-farmer disputes and record resolutions or refund status. | Admin |
| **FR-24** | Admin | Admin can moderate and remove policy-violating listings or abusive reviews. | Admin |
| **FR-25** | Admin | Admin dashboard displays analytics on crop demand curves, regional sales volumes, and geographic disease hotspots. | Admin |
| **FR-26** | Admin | Admin can transmit broadcast alerts to all users, farmers, or customers. | Admin |
| **FR-27** | Price | Farmers can inspect 3-month forward mandi price forecast intervals for guidance. | Farmer |

---

## 3. Non-Functional Requirements

- **NFR-01 Performance**: List endpoints respond in under 500 ms for 10,000 listings; leaf disease diagnostic inference completes under 3 seconds per image.
- **NFR-02 Security**: Passwords hashed with bcrypt; JWT access token lifetime of 15 minutes; role-based access control (RBAC) enforced on every endpoint.
- **NFR-03 Data Integrity**: Order placement and stock deduction occur within a single atomic database transaction.
- **NFR-04 Auditability**: Every admin action and order state change is persisted to `admin_logs` with actor ID and timestamp.
- **NFR-05 Usability**: Responsive from 360px mobile width upwards with high-contrast dual theme support ("Emerald Harvest" & "Golden Sunset").
- **NFR-06 Availability**: Backend exposes a `/health` liveness probe endpoint.
- **NFR-07 Localisation**: UI strings extracted into translation dictionaries supporting English, Hindi, and Marathi.
