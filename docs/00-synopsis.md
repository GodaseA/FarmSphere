# AgriConnect — Project Synopsis

## 1. Project Title
**AgriConnect**: An End-to-End Direct Agriculture Marketplace & Crop Pathology Diagnostic Platform

## 2. Abstract
Agricultural supply chains in developing nations suffer from structural inefficiencies: long chains of intermediaries erode farmer profit margins, volatile mandi pricing discourages investment, and late detection of leaf diseases leads to severe yield destruction. AgriConnect solves these challenges through a unified digital platform. Farmers sell directly to retail customers with transparent pricing, while computer vision transfer learning models classify plant leaf diseases from mobile uploads and prescribe organic/chemical treatments. A centralized administrative oversight layer enforces identity verification, audit trails, and fair arbitration.

## 3. Project Objectives
1. **Direct Marketplace**: Enable verified agricultural producers to list harvest produce directly to urban and local buyers, removing middlemen.
2. **Crop Leaf Disease Detection**: Deploy in-process deep learning (MobileNetV2 on PlantVillage) to classify foliar pathogens within 3 seconds, delivering actionable remedies and uncertainty warnings (< 60% confidence).
3. **Mandi Price Guidance**: Provide historical seasonal regression trend forecasting for 3 forward months by crop and district.
4. **Transparent Governance**: Ensure regulatory compliance through mandatory admin verification of land and identity documents, cryptographic audit logging, and dispute resolution.
5. **Dual Theme Accessibility**: Deliver a modern dual-theme user experience ("Emerald Harvest" and "Golden Sunset") optimized for both high-contrast outdoor mobile viewing and desktop management.

## 4. Scope
- **Web Platform**: Responsive desktop and mobile application (React 18 + Vite + Tailwind CSS).
- **Backend API**: High-performance asynchronous FastAPI REST backend in Python 3.11+.
- **Database**: Third Normal Form relational database schema with 16 core entities.
- **Machine Learning**: Standardized model file structure, notebooks, and plug-and-play inference endpoints.
