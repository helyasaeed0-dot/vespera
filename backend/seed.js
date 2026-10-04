const mongoose = require("mongoose");
const connectDB = require("./config/db");
const config = require("./config/env");
const logger = require("./utils/logger");

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Review = require("./models/Review");
const Order = require("./models/Order");
const Career = require("./models/Career");
const JobApplication = require("./models/JobApplication");
const Partner = require("./models/Partner");

const seedDatabase = async (isStandalone = true) => {
  try {
    if (isStandalone) {
      await connectDB();
      logger.info("Connected to database for standalone seeding...");
    }

    // 1. Clear old data if standalone
    if (isStandalone) {
      await Promise.all([
        User.deleteMany(),
        Category.deleteMany(),
        Product.deleteMany(),
        Review.deleteMany(),
        Order.deleteMany(),
        Career.deleteMany(),
        JobApplication.deleteMany(),
        Partner.deleteMany(),
      ]);
      logger.info("Cleared existing database collections.");
    }

    // 2. Seed Users
    let adminUser = await User.findOne({ email: config.ADMIN_EMAIL });
    if (!adminUser) {
      adminUser = await User.create({
        name: config.ADMIN_NAME || "Vespera Super Admin",
        email: config.ADMIN_EMAIL || "admin@vespera.com",
        password: config.ADMIN_PASSWORD || "VesperaAdmin@2026!",
        role: "admin",
        phone: "+1 (555) 000-0001",
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
      });
    }

    let customerUser = await User.findOne({ email: "alexander@vespera.com" });
    if (!customerUser) {
      customerUser = await User.create({
        name: "Alexander Vance",
        email: "alexander@vespera.com",
        password: "password123",
        role: "user",
        phone: "+1 (555) 019-2834",
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
      });
    }

    // 3. Seed Categories
    const categoriesData = [
      {
        name: "Baby Care & Nursery",
        slug: "baby-care-nursery",
        description: "Premium baby skincare, hypoallergenic diapers, ergonomic strollers & feeding essentials.",
        image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Baby Skincare", "Diapers & Wipes", "Feeding Essentials", "Strollers"],
        isActive: true,
      },
      {
        name: "Men's Formalwear & Suits",
        slug: "mens-formalwear-suits",
        description: "Bespoke Italian tailored suits, velvet blazers, crisp formal shirts & luxury accessories.",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Tailored Suits", "Blazers", "Formal Shirts", "Tuxedos", "Accessories"],
        isActive: true,
      },
      {
        name: "Women's Apparel & Accessories",
        slug: "womens-apparel-accessories",
        description: "Haute couture designer dresses, handcrafted leather handbags, footwear & fine jewelry.",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Designer Wear", "Handbags", "Footwear", "Jewelry"],
        isActive: true,
      },
      {
        name: "Health & Personal Care",
        slug: "health-personal-care",
        description: "Organic skincare serums, precision grooming kits, & clinical-grade health supplements.",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Premium Skincare", "Grooming Kits", "Health Supplements"],
        isActive: true,
      },
      {
        name: "Tech & Smart Accessories",
        slug: "tech-smart-accessories",
        description: "High-fidelity wireless audio headset, titanium smartwatches & high-capacity power banks.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Smartwatches", "Wireless Audio", "Power Banks & Chargers"],
        isActive: true,
      },
      {
        name: "Home & Living",
        slug: "home-living",
        description: "Architectural luxury decor, Egyptian silk bedding sets & pro-grade kitchenware.",
        image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Luxury Decor", "Bedding Sets", "Kitchenware"],
        isActive: true,
      },
    ];

    await Category.insertMany(categoriesData);

    // 4. Seed Products
    const productsData = [
      {
        title: "Vespera Bespoke Italian Wool Tailored Suit",
        slug: "vespera-italian-wool-tailored-suit",
        description: "Handcrafted from 100% Super 150s Italian merino wool. Unmatched elegance designed for modern executives and galas.",
        price: 499.00,
        salePrice: 399.00,
        stock: 24,
        rating: 4.9,
        reviewCount: 42,
        category: "Men's Formalwear & Suits",
        categorySlug: "mens-formalwear-suits",
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
        isNewArrival: true,
        isActive: true,
        colors: ["Midnight Navy", "Charcoal Black", "Slate Grey"],
        sizes: ["38R", "40R", "42L", "44L"],
        specs: {
          "Material": "100% Super 150s Italian Merino Wool",
          "Fit": "Modern Slim Fit",
          "Lining": "100% Bemberg Silk",
          "Care": "Dry Clean Only",
        },
      },
      {
        title: "Ultra-Lightweight Convertible Baby Stroller & Pram",
        slug: "luxury-organic-cotton-baby-stroller",
        description: "Engineered with aircraft-grade aluminum frame and anti-shock rubber tires. Certified organic lining for ultimate infant comfort.",
        price: 320.00,
        salePrice: 280.00,
        stock: 15,
        rating: 4.8,
        reviewCount: 38,
        category: "Baby Care & Nursery",
        categorySlug: "baby-care-nursery",
        images: [
          "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
        isActive: true,
        colors: ["Matte Black", "Rose Gold", "Sage Green"],
        specs: {
          "Weight Capacity": "Up to 25 kg",
          "Frame Material": "Aerospace Grade Aluminum",
          "Folded Dimensions": "55 x 45 x 25 cm",
        },
      },
      {
        title: "Aura Noise-Canceling Wireless Studio Headphones",
        slug: "aura-noise-canceling-wireless-headphones",
        description: "Hybrid Active Noise Cancellation with high-res 40mm beryllium drivers. Up to 45 hours of playback on a single fast charge.",
        price: 249.00,
        salePrice: null,
        stock: 50,
        rating: 4.9,
        reviewCount: 89,
        category: "Tech & Smart Accessories",
        categorySlug: "tech-smart-accessories",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
        isActive: true,
        colors: ["Space Gray", "Silver Frost", "Onyx Black"],
        specs: {
          "Battery Life": "45 Hours (ANC On)",
          "Bluetooth": "5.3 with LDAC / aptX Adaptive",
          "Driver Size": "40mm Custom Beryllium",
        },
      },
      {
        title: "Artisanal Calfskin Designer Tote & Handbag",
        slug: "artisanal-calfskin-designer-tote",
        description: "Hand-finished full-grain leather tote featuring gold-plated hardware, interior laptop sleeve, and detachable shoulder strap.",
        price: 349.00,
        salePrice: 299.00,
        stock: 12,
        rating: 4.7,
        reviewCount: 27,
        category: "Women's Apparel & Accessories",
        categorySlug: "womens-apparel-accessories",
        images: [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
        isActive: true,
        colors: ["Cognac Tan", "Noir Black", "Burgundy"],
        specs: {
          "Material": "Full-Grain Italian Calfskin Leather",
          "Dimensions": "38cm x 28cm x 15cm",
          "Hardware": "18K Gold Plated Brass",
        },
      },
      {
        title: "Vespera Botanical Youth Elixir Skincare Serum",
        slug: "vespera-botanical-youth-elixir-serum",
        description: "Cold-pressed bio-fermented peptide serum enriched with Hyaluronic Acid and Marine Algae to restore skin luminosity.",
        price: 95.00,
        salePrice: 79.00,
        stock: 100,
        rating: 5.0,
        reviewCount: 114,
        category: "Health & Personal Care",
        categorySlug: "health-personal-care",
        images: [
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
        isActive: true,
        specs: {
          "Volume": "50 ml / 1.7 fl oz",
          "Skin Type": "Suitable for all skin types",
          "Cruelty-Free": "Yes, 100% Vegan",
        },
      },
      {
        title: "1000 Thread Count Egyptian Cotton Bedding Set",
        slug: "1000-tc-egyptian-cotton-bedding-set",
        description: "Satin-weave long-staple Giza cotton sheet set including duvet cover, fitted sheet, and 4 embroidered pillowcases.",
        price: 260.00,
        salePrice: 219.00,
        stock: 18,
        rating: 4.8,
        reviewCount: 53,
        category: "Home & Living",
        categorySlug: "home-living",
        images: [
          "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
        isActive: true,
        colors: ["Pearl White", "Ivory Cream", "Slate Blue"],
        sizes: ["Queen", "King", "Super King"],
        specs: {
          "Thread Count": "1000 TC",
          "Material": "100% Long-Staple Egyptian Cotton",
          "Certification": "OEKO-TEX Standard 100",
        },
      },
      {
        title: "Chronos Titanium Smartwatch Pro",
        slug: "chronos-titanium-smartwatch-pro",
        description: "Grade 5 titanium casing, sapphire crystal AMOLED display, ECG monitoring, satellite GPS, and 14-day battery life.",
        price: 399.00,
        salePrice: 349.00,
        stock: 35,
        rating: 4.9,
        reviewCount: 64,
        category: "Tech & Smart Accessories",
        categorySlug: "tech-smart-accessories",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
        isActive: true,
        colors: ["Titanium Silver", "Stealth Black"],
        specs: {
          "Water Resistance": "10 ATM / 100 meters",
          "Display": "1.43 inch Sapphire AMOLED",
          "Battery": "14 Days Typical Usage",
        },
      },
      {
        title: "Hypoallergenic Baby Skincare & Organic Bath Set",
        slug: "hypoallergenic-baby-skincare-bath-set",
        description: "Dermatologist-tested pediatric care bundle with soothing chamomile wash, diaper rash cream, and organic body butter.",
        price: 65.00,
        salePrice: null,
        stock: 80,
        rating: 4.9,
        reviewCount: 71,
        category: "Baby Care & Nursery",
        categorySlug: "baby-care-nursery",
        images: [
          "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800",
        ],
        isFeatured: true,
        isActive: true,
        specs: {
          "Age Range": "0-36 months",
          "Free From": "Parabens, Sulfates, Artificial Fragrance",
          "Volume": "4 x 200ml bottles",
        },
      },
    ];

    const createdProducts = await Product.insertMany(productsData);

    // 5. Seed Careers
    const careersData = [
      {
        title: "Senior Full-Stack Developer",
        department: "Engineering",
        location: "Hybrid / On-site",
        type: "FULL_TIME",
        experience: "5+ Years",
        description: "Lead the architectural evolution of Vespera's high-scale e-commerce platform and institutional partner integrations using Next.js 14, Node.js, and PostgreSQL.",
        requirements: [
          "Extensive experience with Next.js App Router, TypeScript, React Server Components",
          "Proficiency in PostgreSQL, Prisma ORM, Redis, and high-concurrency microservices",
          "Solid understanding of Stripe payment pipelines & NextAuth architecture",
          "Strong track record in CI/CD, performance tuning, and unit/integration testing",
        ],
        isActive: true,
      },
      {
        title: "E-Commerce Category Lead (Baby Care)",
        department: "Retail Operations",
        location: "On-site",
        type: "FULL_TIME",
        experience: "4+ Years",
        description: "Drive commercial performance, supplier acquisition, and inventory optimization for our fast-growing Baby Care & Nursery division across regional markets.",
        requirements: [
          "Proven category management experience in premium FMCG or baby care retail",
          "Strong vendor negotiation and international sourcing capabilities",
          "Data-driven mindset with proficiency in inventory forecasting and margin optimization",
        ],
        isActive: true,
      },
      {
        title: "Corporate Partnerships Specialist",
        department: "Business Development",
        location: "On-site",
        type: "FULL_TIME",
        experience: "3+ Years",
        description: "Structure and negotiate high-impact strategic MOUs, corporate sponsorships, and cross-border commercial alliances for Vespera Enterprise.",
        requirements: [
          "B2B sales or institutional partnership management background",
          "Demonstrated ability to close complex enterprise contracts ($100k+ value)",
          "Excellent executive presentation and relationship building skills",
        ],
        isActive: true,
      },
      {
        title: "Digital Marketing & Brand Strategist",
        department: "Marketing",
        location: "Remote",
        type: "FULL_TIME",
        experience: "3+ Years",
        description: "Craft omnichannel performance campaigns, brand positioning, and customer acquisition strategies across paid social, search, and influencer networks.",
        requirements: [
          "Proven expertise in Meta Ads Manager, Google Ads, TikTok Shop, and affiliate networks",
          "Deep understanding of ROAS optimization, CAC/LTV modeling, and creative strategy",
          "Experience executing luxury retail or multi-category e-commerce launches",
        ],
        isActive: true,
      },
    ];

    const createdCareers = await Career.insertMany(careersData);

    // 6. Seed Partners
    const partnersData = [
      {
        name: "Vespera & Apex Global Logistics Strategic Supply Chain Alliance",
        partner: "Apex Global Logistics",
        date: "September 2026",
        summary: "Establishment of expedited cross-border delivery hubs covering 30+ international markets with guaranteed 48-hour delivery windows.",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
        logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
        category: "Logistics & Supply Chain",
        isActive: true,
      },
      {
        name: "Institutional Partnership Signed with Crestview Capital Group",
        partner: "Crestview Capital",
        date: "August 2026",
        summary: "$45M commitment for expanding Vespera Mart retail distribution centers and high-capacity automated fulfillment nodes.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
        logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
        category: "Strategic Investment",
        isActive: true,
      },
      {
        name: "Joint Sustainable Sourcing Agreement with BioEthic Alliance",
        partner: "BioEthic Alliance",
        date: "July 2026",
        summary: "Complete transition of all Vespera Mart packaging and nursery product lines to 100% biodegradable and zero-carbon certified raw materials.",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
        logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
        category: "Sustainability & Green Tech",
        isActive: true,
      },
    ];

    await Partner.insertMany(partnersData);

    // 7. Seed Sample Reviews
    const suitProduct = createdProducts[0];
    await Review.create([
      {
        product: suitProduct._id,
        user: customerUser._id,
        userName: "David K.",
        userEmail: customerUser.email,
        rating: 5,
        comment: "Exceptional craftsmanship! The fit is immaculate and the materials feel truly luxurious. Delivered within 48 hours.",
        status: "approved",
        isApproved: true,
      },
      {
        product: suitProduct._id,
        user: adminUser._id,
        userName: "Elena M.",
        userEmail: adminUser.email,
        rating: 5,
        comment: "Vespera Mart consistently delivers top-tier quality. Very pleased with the packaging and support team.",
        status: "approved",
        isApproved: true,
      },
    ]);

    // 8. Seed Sample Order
    await Order.create({
      user: customerUser._id,
      orderId: "VES-948201",
      orderItems: [
        {
          product: suitProduct._id,
          title: suitProduct.title,
          slug: suitProduct.slug,
          image: suitProduct.images[0],
          selectedColor: "Midnight Navy",
          selectedSize: "42L",
          quantity: 1,
          priceAtPurchase: 399.00,
        },
      ],
      shippingAddress: {
        fullName: "Alexander Vance",
        email: "alexander@vespera.com",
        phone: "+1 (555) 019-2834",
        street: "742 Evergreen Terrace",
        city: "New York",
        postalCode: "10001",
        country: "United States",
      },
      shippingMethod: "express",
      subtotal: 399.00,
      shippingFee: 0,
      discount: 0,
      total: 399.00,
      paymentMethod: "stripe",
      paymentStatus: "Paid",
      orderStatus: "Shipped",
      trackingNumber: "TRK-884920194US",
    });

    // 9. Seed Sample Application
    await JobApplication.create({
      job: createdCareers[0]._id,
      jobTitle: createdCareers[0].title,
      department: createdCareers[0].department,
      user: customerUser._id,
      fullName: "Alexander Vance",
      email: "alexander@vespera.com",
      phone: "+1 (555) 019-2834",
      linkedinUrl: "https://linkedin.com/in/alexandervance",
      resumeUrl: "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
      resumeName: "Alexander_Vance_Resume.pdf",
      coverLetter: "Excited to bring 6 years of architecture leadership to Vespera Enterprise.",
      status: "Shortlisted",
    });

    logger.info("Database seeding completed successfully.");
    if (isStandalone) {
      process.exit(0);
    }
  } catch (error) {
    logger.error("Database seeding failed", { error: error.message, stack: error.stack });
    if (isStandalone) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = seedDatabase;
