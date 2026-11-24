# AgriConnect — User Manual & Operations Guide

## 1. Quick Demo Account Credentials

AgriConnect includes pre-configured seed accounts. You can sign in using the **⚡ Demo Logins** button in the top navigation bar or with manual credentials:

| Role | Email | Password | Status & Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@agriconnect.test` | `admin123` | Full audit, farmer approvals, dispute settlement |
| **Farmer (Approved)** | `farmer1@agriconnect.test` | `farmer123` | Patil Organic Farms (Nashik); active produce listings |
| **Farmer (Pending)** | `farmer2@agriconnect.test` | `farmer123` | Suresh Yadav; pending verification queue demo |
| **Customer** | `customer1@agriconnect.test` | `customer123` | Priya Sharma (Pune); shopping cart and order history |

---

## 2. Using the Dual Theme Switcher
At any time, click the **Theme Toggle** button in the top navigation bar to toggle between:
- **Emerald Harvest**: Fresh, lush agricultural green and crisp clarity.
- **Golden Sunset**: Warm harvest amber, sunlit earth, and rustic fields.

Your preference is saved automatically across sessions.

---

## 3. Farmer Walkthrough
1. **Sign In**: Log in as `farmer1@agriconnect.test`.
2. **Seasonal Crop Yields**: Navigate to **Crop Yields** in the sidebar. Click **Add Harvest Yield** to log a crop cycle, or review the seasonal output Recharts bar charts.
3. **AI Leaf Disease Scan**: Navigate to **Disease AI Scanner**. Upload a leaf photo or pick a sample leaf (e.g. Tomato Blight). Click **Run Leaf Diagnostic Scan**. Review the predicted disease, top-3 ranked alternatives, confidence bar, and organic/chemical remedies tabs.
4. **Produce Listings**: Navigate to **Produce Listings** to view stock, edit prices, pause items, or add new crops.
5. **Fulfill Orders**: Navigate to **Incoming Orders**. Follow the lifecycle: click **Accept & Confirm**, then **Mark Shipped**, and finally **Confirm Delivered**.
6. **Mandi Price Forecast**: Navigate to **Mandi Price Forecast** to inspect forward 3-month price intervals for guidance.

---

## 4. Customer Walkthrough
1. **Sign In**: Log in as `customer1@agriconnect.test`.
2. **Browse Produce**: Navigate to **Browse Market**. Use the keyword search, price slider, and "Only 100% Organic" filters.
3. **Shopping Cart**: Click **Add to Cart** on desired crops. Review the cart and click **Proceed to Checkout**.
4. **Checkout & Payment**: Select **Home Delivery** or **Farm Pickup**, verify the delivery address, and choose **Razorpay Online (Test)** or **Cash on Delivery**.
5. **Order Tracking & Review**: Navigate to **My Orders**. View the 4-step progress tracker. Once an order is marked `Delivered`, click **Rate & Review Farmer** to submit feedback.

---

## 5. Administrator Walkthrough
1. **Sign In**: Log in as `admin@agriconnect.test`.
2. **Overview**: View platform totals: GMV revenue, active listings, order counts, and open disputes.
3. **Farmer Verification Queue**: Navigate to **Verification Queue**. Inspect pending applications (e.g. Suresh Kumar Yadav). Click **View Full Document** to examine the submitted ID proof, then click **Approve Farmer** or **Reject with Reason**.
4. **Disputes Resolution**: Navigate to **Disputes & Refunds**. Review buyer complaints and record resolutions or refunds.
5. **Broadcast Announcements**: Navigate to **Broadcast Alerts** to transmit an advisory to all users, farmers, or customers.
6. **Audit Trail**: Navigate to **Audit Trail** to inspect the sequence of logged administrative and state transition events.
