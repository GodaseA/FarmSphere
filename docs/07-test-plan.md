# AgriConnect — Test Plan & Quality Assurance Report

## 1. Test Strategy Overview
Testing spans Unit Tests, Integration Tests, End-to-End API testing via Pytest and HTTPX, and Security RBAC audit validations.

## 2. Test Execution Results

| Test Suite | Scope | Target Behavior | Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| `test_health_check` | System | Health liveness check `/health` | Returns status 200 `{ "status": "ok" }` | **PASS** |
| `test_customer_registration` | Auth | Customer sign up & address persistence | Issues JWT access token, creates customer profile | **PASS** |
| `test_farmer_registration_pending_status` | Auth & RBAC | Farmer registration starts as pending | Creates farmer profile with `verification_status="pending"` | **PASS** |
| `test_unauthorized_access_fails` | Security | Accessing protected route without token | Fails with HTTP 401 Unauthorized | **PASS** |
| `test_admin_route_forbidden_for_anonymous` | Security | Accessing admin dashboard without admin role | Fails with HTTP 401/403 | **PASS** |
| `test_price_prediction_guidance_endpoint` | ML Engine | Mandi price forecasting `/prices/predict` | Returns 3-month forecast with low/high bands | **PASS** |
| `npm run build` | Frontend Bundle | React 18, Vite & Tailwind CSS compilation | Generated minified production bundle in `dist/` | **PASS** |

## 3. Security Checklist
- [x] Passwords salted and hashed with bcrypt (never stored in plain text).
- [x] Token payload contains role claim; server verifies role on every endpoint.
- [x] Farmers cannot post produce listings until `verification_status == 'approved'`.
- [x] Customers cannot review an order until the order status is `delivered`.
- [x] Only the assigned farmer can modify an incoming order's status.
- [x] SQL injection prevented using parameterized SQLAlchemy async statements.
- [x] Cross-Origin Resource Sharing (CORS) configured with trusted origin domains.
