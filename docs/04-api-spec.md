# AgriConnect — REST API Specification

All endpoints are hosted under prefix `/api/v1` and communicate using `application/json` (or `multipart/form-data` for file uploads). Protected routes require `Authorization: Bearer <jwt_access_token>`.

## 1. Authentication & Profiles (`/auth`, `/users`)
- `POST /auth/register/farmer`: Register farmer with ID proof and farm details.
- `POST /auth/register/customer`: Register retail buyer with delivery address.
- `POST /auth/login`: Exchange credentials for access and refresh tokens.
- `POST /auth/refresh`: Exchange refresh token for fresh access token.
- `POST /auth/logout`: Revoke active session.
- `GET /users/me`: Current authenticated user with profile details.
- `PUT /users/me`: Update profile information.
- `POST /users/upload/avatar`: Upload profile picture.

## 2. Farmer Operations (`/farmer`)
- `GET, POST /farmer/yields`: List and log crop yields.
- `PUT, DELETE /farmer/yields/{id}`: Update or remove harvest records.
- `GET /farmer/yields/analytics`: Aggregated yield metrics by season, crop, and year.
- `GET, POST /farmer/listings`: View own produce and publish new produce.
- `PUT, DELETE /farmer/listings/{id}`: Edit, pause, or remove produce items.
- `GET /farmer/orders`: View incoming customer orders filtered by status.
- `PATCH /farmer/orders/{id}/status`: Transition order status (`confirmed`, `shipped`, `delivered`, `rejected`).
- `GET /farmer/reviews`: View customer ratings and comments received.

## 3. Disease Diagnostic AI (`/disease`)
- `POST /disease/predict`: Multipart upload of leaf image; returns predicted disease class, confidence, top-3 ranked alternatives, and organic/chemical remedies.
- `GET /disease/history`: Timestamped past predictions log for the logged-in farmer.

## 4. Market & Storefront (`/listings`, `/cart`, `/orders`, `/payments`, `/prices`)
- `GET /listings`: Public produce browsing with filters (`crop`, `state`, `district`, `min_price`, `max_price`, `organic`, `q`, `page`, `page_size`).
- `GET /listings/{id}`: Detailed single produce view.
- `GET /farmers/{id}`: Public grower bio, verification status, and listed crops.
- `GET, POST, DELETE /cart`: View, add item, and clear cart.
- `PUT, DELETE /cart/items/{id}`: Update item quantity or remove item.
- `POST /orders`: Checkout cart into orders (split per farmer) with atomic stock deduction.
- `GET /orders`: View logged-in customer's order history.
- `GET /orders/{id}`: Order timeline and tracking details.
- `POST /orders/{id}/review`: Submit star rating and comment after delivery.
- `POST /orders/{id}/dispute`: File complaint or refund request.
- `POST /payments/create`: Create Razorpay payment order.
- `POST /payments/verify`: Verify payment signature and record status.
- `GET /prices/predict`: 3-month mandi price guidance forecast for crop and district.

## 5. Administrative Control (`/admin`)
- `GET /admin/dashboard`: Platform KPIs, revenue, active listings, order counts.
- `GET /admin/farmers/pending`: Identity verification queue.
- `POST /admin/farmers/{id}/verify`: Approve or reject farmer verification.
- `GET /admin/users`: Search and filter user directory.
- `PATCH /admin/users/{id}/status`: Block or unblock accounts.
- `GET /admin/transactions`: Full financial transactions audit log.
- `GET, PATCH /admin/disputes`: List and adjudicate disputes.
- `DELETE /admin/listings/{id}`: Remove policy-violating listings.
- `PATCH /admin/reviews/{id}/hide`: Hide abusive reviews.
- `GET /admin/analytics/demand`: Product demand trends over time.
- `GET /admin/analytics/disease-hotspots`: Pathological infection clusters by region.
- `GET /admin/analytics/sales`: Sales by district and state.
- `POST /admin/notifications/broadcast`: Transmit broadcast announcements.
- `GET /admin/logs`: Audit trail of system events.
- `GET /health`: Liveness and service health probe.
