export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  category: string;
  categorySlug: string;
  images: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  specs?: Record<string, string>;
  color?: string;
  colors?: string[];
  sizes?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: string[];
}

export interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "FULL_TIME" | "PART_TIME" | "REMOTE" | "HYBRID";
  experience: string;
  description: string;
  requirements: string[];
  postedAt: string;
}

export interface MOUHighlight {
  id: string;
  title: string;
  partner: string;
  date: string;
  summary: string;
  image: string;
  category: string;
}

export interface LeadershipMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Baby Care & Nursery",
    slug: "baby-care-nursery",
    description: "Premium baby skincare, hypoallergenic diapers, ergonomic strollers & feeding essentials.",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
    subcategories: ["Baby Skincare", "Diapers & Wipes", "Feeding Essentials", "Strollers"],
  },
  {
    id: "cat-2",
    name: "Men's Formalwear & Suits",
    slug: "mens-formalwear-suits",
    description: "Bespoke Italian tailored suits, velvet blazers, crisp formal shirts & luxury accessories.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
    subcategories: ["Tailored Suits", "Blazers", "Formal Shirts", "Tuxedos", "Accessories"],
  },
  {
    id: "cat-3",
    name: "Women's Apparel & Accessories",
    slug: "womens-apparel-accessories",
    description: "Haute couture designer dresses, handcrafted leather handbags, footwear & fine jewelry.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
    subcategories: ["Designer Wear", "Handbags", "Footwear", "Jewelry"],
  },
  {
    id: "cat-4",
    name: "Health & Personal Care",
    slug: "health-personal-care",
    description: "Organic skincare serums, precision grooming kits, & clinical-grade health supplements.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800",
    subcategories: ["Premium Skincare", "Grooming Kits", "Health Supplements"],
  },
  {
    id: "cat-5",
    name: "Tech & Smart Accessories",
    slug: "tech-smart-accessories",
    description: "High-fidelity wireless audio headset, titanium smartwatches & high-capacity power banks.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    subcategories: ["Smartwatches", "Wireless Audio", "Power Banks & Chargers"],
  },
  {
    id: "cat-6",
    name: "Home & Living",
    slug: "home-living",
    description: "Architectural luxury decor, Egyptian silk bedding sets & pro-grade kitchenware.",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800",
    subcategories: ["Luxury Decor", "Bedding Sets", "Kitchenware"],
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
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
    sizes: ["38R", "40R", "42L", "44L"],
    specs: {
      "Material": "100% Super 150s Italian Merino Wool",
      "Fit": "Modern Slim Fit",
      "Lining": "100% Bemberg Silk",
      "Care": "Dry Clean Only",
    }
  },
  {
    id: "prod-2",
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
    specs: {
      "Weight Capacity": "Up to 25 kg",
      "Frame Material": "Aerospace Grade Aluminum",
      "Folded Dimensions": "55 x 45 x 25 cm",
    }
  },
  {
    id: "prod-3",
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
    specs: {
      "Battery Life": "45 Hours (ANC On)",
      "Bluetooth": "5.3 with LDAC / aptX Adaptive",
      "Driver Size": "40mm Custom Beryllium",
    }
  },
  {
    id: "prod-4",
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
    specs: {
      "Material": "Full-Grain Italian Calfskin Leather",
      "Dimensions": "38cm x 28cm x 15cm",
      "Hardware": "18K Gold Plated Brass",
    }
  },
  {
    id: "prod-5",
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
    specs: {
      "Volume": "50 ml / 1.7 fl oz",
      "Skin Type": "Suitable for all skin types",
      "Cruelty-Free": "Yes, 100% Vegan",
    }
  },
  {
    id: "prod-6",
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
    sizes: ["Queen", "King", "Super King"],
    specs: {
      "Thread Count": "1000 TC",
      "Material": "100% Long-Staple Egyptian Cotton",
      "Certification": "OEKO-TEX Standard 100",
    }
  },
  {
    id: "prod-7",
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
    specs: {
      "Water Resistance": "10 ATM / 100 meters",
      "Display": "1.43 inch Sapphire AMOLED",
      "Battery": "14 Days Typical Usage",
    }
  },
  {
    id: "prod-8",
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
    specs: {
      "Age Range": "0-36 months",
      "Free From": "Parabens, Sulfates, Artificial Fragrance",
      "Volume": "4 x 200ml bottles",
    }
  },
];

export const JOB_LISTINGS: JobListing[] = [
  {
    id: "job-1",
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
    postedAt: "2026-09-20",
  },
  {
    id: "job-2",
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
    postedAt: "2026-09-18",
  },
  {
    id: "job-3",
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
    postedAt: "2026-09-22",
  },
  {
    id: "job-4",
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
    postedAt: "2026-09-25",
  },
];

export const MOU_HIGHLIGHTS: MOUHighlight[] = [
  {
    id: "mou-1",
    title: "Vespera & Apex Global Logistics Strategic Supply Chain Alliance",
    partner: "Apex Global Logistics",
    date: "September 2026",
    summary: "Establishment of expedited cross-border delivery hubs covering 30+ international markets with guaranteed 48-hour delivery windows.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    category: "Logistics & Supply Chain",
  },
  {
    id: "mou-2",
    title: "Institutional Partnership Signed with Crestview Capital Group",
    partner: "Crestview Capital",
    date: "August 2026",
    summary: "$45M commitment for expanding Vespera Mart retail distribution centers and high-capacity automated fulfillment nodes.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    category: "Strategic Investment",
  },
  {
    id: "mou-3",
    title: "Joint Sustainable Sourcing Agreement with BioEthic Alliance",
    partner: "BioEthic Alliance",
    date: "July 2026",
    summary: "Complete transition of all Vespera Mart packaging and nursery product lines to 100% biodegradable and zero-carbon certified raw materials.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
    category: "Sustainability & Green Tech",
  },
];

export const LEADERSHIP: LeadershipMember[] = [
  {
    name: "Alexander Vance",
    role: "Founder & Chief Executive Officer",
    bio: "Visionary entrepreneur with over 18 years of leadership across international retail infrastructure, venture growth, and institutional joint ventures.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Sophia Chen",
    role: "Head of E-Commerce",
    bio: "Former VP of Commerce at leading tech scale-ups, specializing in hyper-scale digital store architecture, customer conversion, and product catalog expansion.",
    image: "/images/leadership/sophia-chen.jpg",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Marcus Sterling",
    role: "VP of Strategic Partnerships",
    bio: "Corporate finance & strategic alliance strategist behind $300M+ in international MOUs, government joint ventures, and enterprise channel expansions.",
    image: "/images/leadership/marcus-sterling.jpg",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Elena Rostova",
    role: "Operations & Supply Chain Director",
    bio: "Global supply chain authority managing end-to-end multi-warehouse operations, cold-chain logistics, and automated fulfillment networks across 4 continents.",
    image: "/images/leadership/elena-rostova.jpg",
    linkedin: "https://linkedin.com",
  },
];

export const SPONSOR_LOGOS = [
  { name: "Apex Global Logistics", logo: "APEX" },
  { name: "Crestview Capital", logo: "CRESTVIEW" },
  { name: "Omnitech Systems", logo: "OMNITECH" },
  { name: "Nexus Health", logo: "NEXUS" },
  { name: "Vantage Retail", logo: "VANTAGE" },
  { name: "Horizon Capital", logo: "HORIZON" },
  { name: "Astra BioTech", logo: "ASTRA" },
  { name: "Sovereign Logistics", logo: "SOVEREIGN" },
];
