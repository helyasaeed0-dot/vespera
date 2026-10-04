// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash("Admin@Vespera2026", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@vespera.com" },
    update: {},
    create: {
      name: "Vespera Administrator",
      email: "admin@vespera.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // 2. Create Categories
  const formalwear = await prisma.category.upsert({
    where: { slug: "italian-formalwear" },
    update: {},
    create: {
      name: "Italian Formalwear",
      slug: "italian-formalwear",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: "smart-electronics" },
    update: {},
    create: {
      name: "Smart Electronics",
      slug: "smart-electronics",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800",
    },
  });

  // 3. Create Sample Products
  await prisma.product.upsert({
    where: { slug: "milano-wool-suit" },
    update: {},
    create: {
      title: "Milano Executive Wool Suit",
      slug: "milano-wool-suit",
      description: "Handcrafted 100% Italian Super 130s wool suit designed for executive formality.",
      price: 850.0,
      salePrice: 720.0,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800"],
      categoryId: formalwear.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "titanium-smart-chronograph" },
    update: {},
    create: {
      title: "Titanium Pro Smart Chronograph",
      slug: "titanium-smart-chronograph",
      description: "Aerospace-grade titanium smart chronograph with sapphire crystal and biometric sensors.",
      price: 490.0,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800"],
      categoryId: electronics.id,
    },
  });

  // 4. Create Job Listing
  await prisma.jobListing.create({
    data: {
      title: "Senior Supply Chain Strategist",
      department: "Global Alliances",
      location: "Dubai, UAE / Hybrid",
      type: "FULL_TIME",
      experience: "5+ Years",
      description: "Lead institutional joint venture planning and cross-border trade route optimization.",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
