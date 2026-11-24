import asyncio
import uuid
from datetime import date, datetime, timedelta
from sqlalchemy import select
from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.core.security import hash_password
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.customer_profile import CustomerProfile
from app.models.crop_yield import CropYield
from app.models.listing import CropListing
from app.models.disease import DiseaseTreatment, DiseasePrediction
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.review import Review
from app.models.cart import Cart
from app.models.notification import Notification
from app.models.admin_log import AdminLog


async def seed_database():
    print("Beginning AgriConnect database seeding...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        admin_check = (await db.execute(select(User).where(User.email == "admin@agriconnect.test"))).scalar_one_or_none()
        if admin_check:
            print("Database already contains seed data. Skipping re-seed.")
            return

        # 1. Seed Disease Treatments
        treatments = [
            DiseaseTreatment(
                class_name="Tomato___Early_blight",
                crop="Tomato",
                disease_name="Early Blight (Alternaria solani)",
                is_healthy=False,
                chemical_treatment="Fungicides containing chlorothalonil, mancozeb, or azoxystrobin (Quadris).",
                organic_treatment="Copper fungicide spray, Bacillus subtilis bio-fungicide, and remove infected lower leaves.",
                dosage="2.5 ml per liter of water; spray every 7-10 days upon first symptom detection.",
                prevention_tips="Practice 3-year crop rotation, maintain wide row spacing for air circulation, use drip irrigation to prevent wet foliage."
            ),
            DiseaseTreatment(
                class_name="Tomato___Late_blight",
                crop="Tomato",
                disease_name="Late Blight (Phytophthora infestans)",
                is_healthy=False,
                chemical_treatment="Mefenoxam + Mancozeb (Ridomil Gold) or Cymoxanil (Curzate).",
                organic_treatment="Liquid copper octanoate; immediately destroy heavily blighted plants to stop spore dispersal.",
                dosage="2.0 g per liter of water; apply preventatively during cool, humid conditions.",
                prevention_tips="Plant resistant tomato varieties, destroy volunteer potato plants nearby, avoid overhead watering."
            ),
            DiseaseTreatment(
                class_name="Tomato___healthy",
                crop="Tomato",
                disease_name="Healthy Plant",
                is_healthy=True,
                chemical_treatment="None required.",
                organic_treatment="Maintain organic compost mulch and neem oil preventative spray bi-weekly.",
                dosage="N/A",
                prevention_tips="Continue balanced nitrogen/phosphorus/potassium fertigation and monitor for insect vectors."
            ),
            DiseaseTreatment(
                class_name="Potato___Early_blight",
                crop="Potato",
                disease_name="Early Blight (Alternaria solani)",
                is_healthy=False,
                chemical_treatment="Mancozeb 75% WP or Propineb 70% WP.",
                organic_treatment="Neem seed kernel extract (5%) or Trichoderma viride foliar spray.",
                dosage="2.5 g per liter of water; early morning application.",
                prevention_tips="Ensure certified disease-free seed tubers, hill vines properly, avoid sprinkler irrigation."
            ),
            DiseaseTreatment(
                class_name="Potato___Late_blight",
                crop="Potato",
                disease_name="Late Blight (Phytophthora infestans)",
                is_healthy=False,
                chemical_treatment="Metalaxyl 8% + Mancozeb 64% WP (Krilaxyl / Ridomil).",
                organic_treatment="Bordeaux mixture 1% spray at 10-day intervals.",
                dosage="2.5 g per liter of water; thorough coverage on both sides of leaves.",
                prevention_tips="Burn cull piles, monitor temperature (10-20°C) and high humidity forecast for early preventive sprays."
            ),
            DiseaseTreatment(
                class_name="Apple___Apple_scab",
                crop="Apple",
                disease_name="Apple Scab (Venturia inaequalis)",
                is_healthy=False,
                chemical_treatment="Captan 50% WP or Difenoconazole 25% EC (Score).",
                organic_treatment="Lime sulfur during dormant season, sulfur powder or potassium bicarbonate during leaf break.",
                dosage="1.5 ml per liter of water during pink bud stage.",
                prevention_tips="Rake and shred fallen apple leaves in autumn to eliminate overwintering fungal ascospores."
            ),
            DiseaseTreatment(
                class_name="Corn_(maize)___Common_rust_",
                crop="Corn",
                disease_name="Common Rust (Puccinia sorghi)",
                is_healthy=False,
                chemical_treatment="Azoxystrobin + Propiconazole (Quilt Xcel) or Pyraclostrobin.",
                organic_treatment="Sulfur dust application at tassel emergence.",
                dosage="1 ml per liter of water.",
                prevention_tips="Plant rust-resistant hybrids; plant early in the season to escape late summer spore clouds."
            ),
            DiseaseTreatment(
                class_name="Grape___Black_rot",
                crop="Grape",
                disease_name="Black Rot (Guignardia bidwellii)",
                is_healthy=False,
                chemical_treatment="Myclobutanil (Rally 40WSP) or Mancozeb.",
                organic_treatment="Liquid copper spray from bud break to 4 weeks post-bloom.",
                dosage="1.5 g per liter of water.",
                prevention_tips="Prune out all mummified berries from vine canopies before bud break."
            ),
            DiseaseTreatment(
                class_name="Pepper,_bell___Bacterial_spot",
                crop="Bell Pepper",
                disease_name="Bacterial Spot (Xanthomonas campestris)",
                is_healthy=False,
                chemical_treatment="Streptomycin sulfate or fixed copper bactericide.",
                organic_treatment="Copper hydroxide with Bacillus amyloliquefaciens.",
                dosage="2 g per liter of water.",
                prevention_tips="Use hot-water treated seeds, sanitize tools between plots, avoid handling plants when wet."
            )
        ]
        db.add_all(treatments)
        await db.flush()

        # 2. Seed Users
        hashed_pwd_admin = hash_password("admin123")
        hashed_pwd_farmer = hash_password("farmer123")
        hashed_pwd_customer = hash_password("customer123")

        # Admin
        admin_user = User(
            full_name="Platform Administrator",
            email="admin@agriconnect.test",
            phone="+919800000001",
            password_hash=hashed_pwd_admin,
            role="admin",
            status="active"
        )
        db.add(admin_user)

        # Farmer 1 (Approved)
        farmer1 = User(
            full_name="Rameshwar Patil",
            email="farmer1@agriconnect.test",
            phone="+919800000002",
            password_hash=hashed_pwd_farmer,
            role="farmer",
            status="active"
        )
        db.add(farmer1)
        await db.flush()

        f1_profile = FarmerProfile(
            user_id=farmer1.id,
            farm_name="Patil Organic Agro Farms",
            village="Dindori",
            district="Nashik",
            state="Maharashtra",
            pincode="422202",
            land_size_acres=12.5,
            id_proof_url="https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
            land_proof_url="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",
            verification_status="approved",
            verified_by=admin_user.id,
            verified_at=datetime.now() - timedelta(days=30),
            avg_rating=4.8,
            rating_count=19
        )
        db.add(f1_profile)

        # Farmer 2 (Pending - for Admin verification demo)
        farmer2 = User(
            full_name="Suresh Kumar Yadav",
            email="farmer2@agriconnect.test",
            phone="+919800000003",
            password_hash=hashed_pwd_farmer,
            role="farmer",
            status="active"
        )
        db.add(farmer2)
        await db.flush()

        f2_profile = FarmerProfile(
            user_id=farmer2.id,
            farm_name="Yadav Kisan Kendra",
            village="Malegaon",
            district="Nashik",
            state="Maharashtra",
            pincode="423203",
            land_size_acres=8.0,
            id_proof_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600",
            land_proof_url="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",
            verification_status="pending",  # Pending admin verification
            avg_rating=0.0,
            rating_count=0
        )
        db.add(f2_profile)

        # Customer 1
        customer1 = User(
            full_name="Priya Sharma",
            email="customer1@agriconnect.test",
            phone="+919800000004",
            password_hash=hashed_pwd_customer,
            role="customer",
            status="active"
        )
        db.add(customer1)
        await db.flush()

        c1_profile = CustomerProfile(
            user_id=customer1.id,
            address_line="Flat 402, Green Meadows, Baner Road",
            city="Pune",
            district="Pune",
            state="Maharashtra",
            pincode="411045"
        )
        db.add(c1_profile)

        # Customer Cart
        cart1 = Cart(customer_id=customer1.id)
        db.add(cart1)

        # 3. Seed Crop Yields for Farmer 1
        yields = [
            CropYield(
                farmer_id=farmer1.id,
                crop_name="Tomato",
                season="kharif",
                year=2025,
                sowing_date=date(2025, 6, 15),
                harvest_date=date(2025, 9, 20),
                quantity_kg=4800.0,
                land_area_acres=3.5,
                notes="Excellent harvest with drip irrigation and organic bio-fertilizer."
            ),
            CropYield(
                farmer_id=farmer1.id,
                crop_name="Red Onion",
                season="rabi",
                year=2025,
                sowing_date=date(2025, 10, 10),
                harvest_date=date(2026, 2, 5),
                quantity_kg=7200.0,
                land_area_acres=4.0,
                notes="Nashik red onions, grade A quality."
            ),
            CropYield(
                farmer_id=farmer1.id,
                crop_name="Golden Wheat",
                season="rabi",
                year=2024,
                sowing_date=date(2024, 11, 1),
                harvest_date=date(2025, 3, 15),
                quantity_kg=5100.0,
                land_area_acres=3.0,
                notes="Sharbati high-protein wheat strain."
            ),
            CropYield(
                farmer_id=farmer1.id,
                crop_name="Sweet Corn",
                season="zaid",
                year=2025,
                sowing_date=date(2025, 3, 1),
                harvest_date=date(2025, 5, 25),
                quantity_kg=2900.0,
                land_area_acres=2.0,
                notes="Zaid crop between rabi and kharif."
            )
        ]
        db.add_all(yields)
        await db.flush()

        # 4. Seed Crop Listings (10 produce listings)
        listings = [
            CropListing(
                farmer_id=farmer1.id,
                crop_yield_id=yields[0].id,
                crop_name="Organic Farm Tomatoes",
                description="Vine-ripened, naturally grown without synthetic chemical pesticides. Juicy and rich in lycopene.",
                price_per_kg=35.0,
                quantity_available_kg=850.0,
                min_order_kg=2.0,
                quality_grade="A",
                is_organic=True,
                image_urls=["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600"],
                status="active"
            ),
            CropListing(
                farmer_id=farmer1.id,
                crop_yield_id=yields[1].id,
                crop_name="Nashik Red Onions",
                description="Famous pungent Nashik red onions. Thick skin with excellent shelf life of up to 4 months.",
                price_per_kg=28.0,
                quantity_available_kg=1500.0,
                min_order_kg=5.0,
                quality_grade="A",
                is_organic=False,
                image_urls=["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600"],
                status="active"
            ),
            CropListing(
                farmer_id=farmer1.id,
                crop_yield_id=yields[2].id,
                crop_name="Premium Sharbati Wheat",
                description="Golden grain Sharbati wheat, hand-harvested and cleaned. Makes soft and aromatic rotis.",
                price_per_kg=42.0,
                quantity_available_kg=2100.0,
                min_order_kg=10.0,
                quality_grade="A",
                is_organic=True,
                image_urls=["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600"],
                status="active"
            ),
            CropListing(
                farmer_id=farmer1.id,
                crop_yield_id=yields[3].id,
                crop_name="Fresh Golden Sweet Corn",
                description="Plump and naturally sweet cobs harvested at dawn. Perfect for roasting and salads.",
                price_per_kg=30.0,
                quantity_available_kg=400.0,
                min_order_kg=2.0,
                quality_grade="A",
                is_organic=True,
                image_urls=["https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600"],
                status="active"
            ),
            CropListing(
                farmer_id=farmer1.id,
                crop_name="Shimla Royal Apples",
                description="Crisp, sweet, and aromatic mountain-grown apples. Handpicked from high-altitude orchards.",
                price_per_kg=120.0,
                quantity_available_kg=600.0,
                min_order_kg=1.0,
                quality_grade="A",
                is_organic=False,
                image_urls=["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600"],
                status="active"
            ),
            CropListing(
                farmer_id=farmer1.id,
                crop_name="Fresh Green Spinach (Palak)",
                description="Tender leafy spinach grown with vermicompost. High iron content and crisp stems.",
                price_per_kg=25.0,
                quantity_available_kg=150.0,
                min_order_kg=1.0,
                quality_grade="A",
                is_organic=True,
                image_urls=["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600"],
                status="active"
            ),
            CropListing(
                farmer_id=farmer1.id,
                crop_name="Nagpur Sweet Oranges",
                description="Juicy, citrus-rich Nagpur santras. High juice percentage with a balanced sweet and tangy flavor.",
                price_per_kg=65.0,
                quantity_available_kg=750.0,
                min_order_kg=3.0,
                quality_grade="B",
                is_organic=False,
                image_urls=["https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600"],
                status="active"
            ),
            CropListing(
                farmer_id=farmer1.id,
                crop_name="Pahari Fresh Potatoes",
                description="Smooth skin medium-sized potatoes. Low moisture content, ideal for fries and curries.",
                price_per_kg=22.0,
                quantity_available_kg=1200.0,
                min_order_kg=5.0,
                quality_grade="A",
                is_organic=False,
                image_urls=["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600"],
                status="active"
            ),
            CropListing(
                farmer_id=farmer1.id,
                crop_name="Guntur Spicy Green Chillies",
                description="Sharp and fiery fresh green chillies. Intense flavor and aroma.",
                price_per_kg=70.0,
                quantity_available_kg=180.0,
                min_order_kg=0.5,
                quality_grade="A",
                is_organic=True,
                image_urls=["https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600"],
                status="active"
            ),
            CropListing(
                farmer_id=farmer1.id,
                crop_name="Aromatic Basmati Rice",
                description="Aged long-grain Basmati rice. Slender grains that double in length after cooking.",
                price_per_kg=95.0,
                quantity_available_kg=900.0,
                min_order_kg=5.0,
                quality_grade="A",
                is_organic=False,
                image_urls=["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600"],
                status="active"
            )
        ]
        db.add_all(listings)
        await db.flush()

        # 5. Seed Past Delivered Order + Review for Customer 1
        order1 = Order(
            order_no="ORD-2026-DEMO1",
            customer_id=customer1.id,
            farmer_id=farmer1.id,
            fulfilment="delivery",
            delivery_address="Flat 402, Green Meadows, Baner Road, Pune, Maharashtra - 411045",
            total_amount=350.0,
            status="delivered",
            placed_at=datetime.now() - timedelta(days=5),
            delivered_at=datetime.now() - timedelta(days=2)
        )
        db.add(order1)
        await db.flush()

        item1 = OrderItem(
            order_id=order1.id,
            listing_id=listings[0].id,
            crop_name="Organic Farm Tomatoes",
            unit_price=35.0,
            quantity_kg=10.0,
            line_total=350.0
        )
        db.add(item1)

        pay1 = Payment(
            order_id=order1.id,
            method="online",
            status="paid",
            amount=350.0,
            gateway_order_id="pay_order_demo_101",
            gateway_payment_id="pay_demo_98765"
        )
        db.add(pay1)

        # Review
        rev1 = Review(
            order_id=order1.id,
            customer_id=customer1.id,
            farmer_id=farmer1.id,
            rating=5,
            comment="The tomatoes arrived incredibly fresh! Crisp, fragrant, and far better than supermarket produce. Thank you Patil Farms!"
        )
        db.add(rev1)

        # 6. Seed Sample Disease Prediction Record
        pred1 = DiseasePrediction(
            farmer_id=farmer1.id,
            crop_yield_id=yields[0].id,
            image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600",
            predicted_class="Tomato___Early_blight",
            confidence=0.9150,
            is_uncertain=False,
            top3=[
                {"class": "Tomato___Early_blight", "confidence": 0.915},
                {"class": "Tomato___Late_blight", "confidence": 0.052},
                {"class": "Tomato___healthy", "confidence": 0.021}
            ],
            treatment_id=1,
            model_version="v1.0",
            district="Nashik",
            state="Maharashtra"
        )
        db.add(pred1)

        # 7. Seed Broadcast Announcement
        notif = Notification(
            audience="all",
            title="Welcome to AgriConnect 2026",
            body="Empowering verified farmers with direct customer marketplace, ML leaf diagnostics, and transparent mandi forecasting."
        )
        db.add(notif)

        # 8. Seed Admin Log
        admin_log = AdminLog(
            actor_id=admin_user.id,
            action_type="INITIAL_SEED",
            target_type="system",
            remarks="Seeded platform demo accounts, listings, disease remedies, and analytics records."
        )
        db.add(admin_log)

        await db.commit()
        print("AgriConnect seed completed successfully!")
        print("  Admin:    admin@agriconnect.test    / admin123")
        print("  Farmer 1: farmer1@agriconnect.test  / farmer123  (Approved)")
        print("  Farmer 2: farmer2@agriconnect.test  / farmer123  (Pending Verification)")
        print("  Customer: customer1@agriconnect.test / customer123")


if __name__ == "__main__":
    asyncio.run(seed_database())
