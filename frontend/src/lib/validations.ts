import { z } from "zod";

export const RegisterSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const CheckoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Cart cannot be empty"),
  paymentMethod: z.enum(["STRIPE", "COD"]),
  shippingAddress: z.object({
    fullName: z.string().min(2, "Full name is required"),
    address: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    postalCode: z.string().min(3, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
    phone: z.string().min(8, "Valid phone number is required"),
  }),
});

export const JobApplicationSchema = z.object({
  jobId: z.string().uuid(),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  resumeUrl: z.string().url("Resume file URL is required"),
});

export const PartnerInquirySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  partnershipType: z.string().min(2, "Partnership type is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});
