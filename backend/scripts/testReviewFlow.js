import mongoose from "mongoose";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import dotenv from "dotenv";
dotenv.config();

const API_BASE = "http://localhost:5000/api";

async function main() {
  console.log("=== STARTING FULL END-TO-END PRODUCT REVIEW & MODERATION TEST ===");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for test harness.");

  const { default: User } = await import("../models/User.js");
  const { default: Product } = await import("../models/Product.js");
  const { default: Order } = await import("../models/Order.js");
  const { default: Review } = await import("../models/Review.js");

  // 1. Pick a sample product
  const product = await Product.findOne();
  if (!product) {
    throw new Error("No products found in DB to test with!");
  }
  console.log(`Found test product: "${product.title}" (_id: ${product._id}, slug: ${product.slug})`);

  // Clean up any old test reviews for this product
  await Review.deleteMany({ product: product._id, comment: /E2E Test Review/ });

  // 2. Setup User A (Buyer) and User B (Non-buyer)
  const userAEmail = "e2e_buyer_test@vespera.test";
  const userBEmail = "e2e_nonbuyer_test@vespera.test";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  await User.deleteMany({ email: { $in: [userAEmail, userBEmail] } });

  const userA = await User.create({
    name: "Verified Buyer Alice",
    username: "buyer_alice",
    email: userAEmail,
    password: "TestPassword123!",
    role: "user",
    isVerified: true,
  });

  const userB = await User.create({
    name: "Non-Buyer Bob",
    username: "nonbuyer_bob",
    email: userBEmail,
    password: "TestPassword123!",
    role: "user",
    isVerified: true,
  });

  // Ensure an Order exists for User A containing Product X with paymentStatus 'Paid' and orderStatus 'Delivered'
  await Order.deleteMany({ user: userA._id, "orderItems.title": "E2E Test Item" });
  const testOrder = await Order.create({
    orderId: `VES-TEST-${Date.now()}`,
    user: userA._id,
    orderItems: [
      {
        product: product._id,
        title: product.title,
        slug: product.slug,
        image: product.images?.[0] || "/placeholder.jpg",
        quantity: 1,
        priceAtPurchase: product.price || 100,
      },
    ],
    shippingAddress: {
      fullName: "Verified Buyer Alice",
      street: "123 Test St",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "United States",
      phone: "+15555555555",
    },
    subtotal: product.price || 100,
    shippingFee: 0,
    discount: 0,
    total: product.price || 100,
    paymentMethod: "stripe",
    paymentStatus: "Paid",
    orderStatus: "Delivered",
  });
  console.log(`Created verified delivered order for User A (Order: ${testOrder.orderId})`);

  // Log in User A via API
  const loginARes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userAEmail, password: "TestPassword123!" }),
  });
  const loginAData = await loginARes.json();
  const tokenA = loginAData.accessToken || loginAData.data?.accessToken;
  console.log(`User A logged in: ${!!tokenA}`);

  // Log in User B via API
  const loginBRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userBEmail, password: "TestPassword123!" }),
  });
  const loginBData = await loginBRes.json();
  const tokenB = loginBData.accessToken || loginBData.data?.accessToken;
  console.log(`User B logged in: ${!!tokenB}`);

  // Log in Admin via API
  const loginAdminRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const loginAdminData = await loginAdminRes.json();
  const adminToken = loginAdminData.accessToken || loginAdminData.data?.accessToken;
  console.log(`Admin logged in: ${!!adminToken}`);

  // 3. Test Eligibility Check for User A (Should be true)
  const eligARes = await fetch(`${API_BASE}/reviews/product/${product._id}/eligibility`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const eligAData = await eligARes.json();
  console.log("User A Eligibility Check:", eligAData);
  if (!eligAData.data?.canReview) {
    throw new Error(`User A should be eligible to review! Got: ${JSON.stringify(eligAData)}`);
  }

  // 4. Test Eligibility Check for User B (Should be false, hasPurchased: false)
  const eligBRes = await fetch(`${API_BASE}/reviews/product/${product._id}/eligibility`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const eligBData = await eligBRes.json();
  console.log("User B Eligibility Check:", eligBData);
  if (eligBData.data?.canReview || eligBData.data?.hasPurchased) {
    throw new Error(`User B should NOT be eligible to review! Got: ${JSON.stringify(eligBData)}`);
  }

  // 5. Test Non-buyer Bob attempting to submit review -> Should be rejected with 403 Forbidden
  const bobSubmitRes = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenB}`,
    },
    body: JSON.stringify({
      productId: product._id,
      rating: 5,
      comment: "E2E Test Review: Bob attempting unauthorized review without purchase.",
    }),
  });
  const bobSubmitData = await bobSubmitRes.json();
  console.log("Bob Submit Attempt (unauthorized):", bobSubmitRes.status, bobSubmitData.message);
  if (bobSubmitRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for non-purchasing user, got ${bobSubmitRes.status}`);
  }

  // 6. Test User A submitting review
  const aliceSubmitRes = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      productId: product._id,
      rating: 5,
      comment: "E2E Test Review: Exceptional quality and stunning craftsmanship! Highly recommend.",
    }),
  });
  const aliceSubmitData = await aliceSubmitRes.json();
  console.log("Alice Review Submission:", aliceSubmitRes.status, aliceSubmitData);
  if (!aliceSubmitData.success) {
    throw new Error(`Alice review submission failed: ${aliceSubmitData.message}`);
  }
  const createdReviewId = aliceSubmitData.data?.review?._id;
  console.log(`Created Review ID: ${createdReviewId}, status: ${aliceSubmitData.data?.review?.status}`);
  if (aliceSubmitData.data?.review?.status !== "pending") {
    throw new Error(`Expected new review status to be 'pending', got: ${aliceSubmitData.data?.review?.status}`);
  }

  // 7. Verify Public View: Review must NOT appear publicly yet
  const publicReviewsRes1 = await fetch(`${API_BASE}/reviews/product/${product._id}`);
  const publicReviewsData1 = await publicReviewsRes1.json();
  const appearsPubliclyPending = (publicReviewsData1.data?.reviews || []).some((r) => r._id === createdReviewId);
  console.log("Public View Check (pending): Appears publicly?", appearsPubliclyPending);
  if (appearsPubliclyPending) {
    throw new Error("Pending review is incorrectly visible on public endpoint!");
  }

  // 8. Admin Moderation: Admin fetches reviews list
  const adminReviewsRes = await fetch(`${API_BASE}/admin/reviews?status=pending`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminReviewsData = await adminReviewsRes.json();
  const adminReviewsList = adminReviewsData.data?.reviews || [];
  console.log(`Admin pending reviews count: ${adminReviewsData.data?.counts?.pending}`);
  const foundInAdmin = adminReviewsList.some((r) => r._id === createdReviewId);
  console.log("Admin Moderation Check: Review appears in pending moderation list?", foundInAdmin);
  if (!foundInAdmin) {
    throw new Error(`Review not found in admin pending moderation queue! Response: ${JSON.stringify(adminReviewsData)}`);
  }

  // 9. Admin Approves Review
  const approveRes = await fetch(`${API_BASE}/admin/reviews/${createdReviewId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "approved" }),
  });
  const approveData = await approveRes.json();
  console.log("Admin Approve Result:", approveData);
  if (!approveData.success || approveData.data?.review?.status !== "approved") {
    throw new Error("Failed to approve review as admin!");
  }

  // 10. Verify Public View: Review MUST now appear publicly with updated rating and count
  const publicReviewsRes2 = await fetch(`${API_BASE}/reviews/product/${product._id}`);
  const publicReviewsData2 = await publicReviewsRes2.json();
  const appearsPubliclyApproved = (publicReviewsData2.data?.reviews || []).some((r) => r._id === createdReviewId);
  console.log("Public View Check (approved): Appears publicly?", appearsPubliclyApproved);
  console.log(`Average Rating: ${publicReviewsData2.data?.averageRating}, Total Reviews: ${publicReviewsData2.data?.totalReviews}`);
  if (!appearsPubliclyApproved) {
    throw new Error("Approved review does not appear on public product endpoint!");
  }

  // 11. Admin Hides Review
  const hideRes = await fetch(`${API_BASE}/admin/reviews/${createdReviewId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "hidden" }),
  });
  const hideData = await hideRes.json();
  console.log("Admin Hide Result:", hideData);

  // 12. Verify Public View: Hidden review disappears from public endpoint
  const publicReviewsRes3 = await fetch(`${API_BASE}/reviews/product/${product._id}`);
  const publicReviewsData3 = await publicReviewsRes3.json();
  const appearsPubliclyHidden = (publicReviewsData3.data?.reviews || []).some((r) => r._id === createdReviewId);
  console.log("Public View Check (hidden): Appears publicly?", appearsPubliclyHidden);
  if (appearsPubliclyHidden) {
    throw new Error("Hidden review is still visible on public endpoint!");
  }

  // 13. Admin Deletes Review
  const deleteRes = await fetch(`${API_BASE}/admin/reviews/${createdReviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const deleteData = await deleteRes.json();
  console.log("Admin Delete Result:", deleteData);
  if (!deleteData.success) {
    throw new Error("Failed to delete review as admin!");
  }

  // 14. Verify DB deletion
  const checkDeleted = await Review.findById(createdReviewId);
  console.log("Database verification: Review exists?", !!checkDeleted);
  if (checkDeleted) {
    throw new Error("Review still exists in database after delete!");
  }

  console.log("=== ALL E2E REVIEW & MODERATION TESTS PASSED PERFECTLY! ===");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
