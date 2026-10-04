// @ts-nocheck
"use server";

import { db } from "@/lib/db";

export async function getProducts(params?: { categorySlug?: string; search?: string }) {
  try {
    const whereClause: any = {};

    if (params?.categorySlug) {
      whereClause.category = { slug: params.categorySlug };
    }

    if (params?.search) {
      whereClause.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, products };
  } catch (error) {
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    if (!product) return { success: false, error: "Product not found" };
    return { success: true, product };
  } catch (error) {
    return { success: false, error: "Failed to fetch product details" };
  }
}

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, categories };
  } catch (error) {
    return { success: false, error: "Failed to fetch categories" };
  }
}
