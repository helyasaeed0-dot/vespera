// @ts-nocheck
"use server";

import { db } from "@/lib/db";
import { JobApplicationSchema, PartnerInquirySchema } from "@/lib/validations";

export async function submitJobApplication(formData: unknown) {
  try {
    const validated = JobApplicationSchema.parse(formData);

    const application = await db.jobApplication.create({
      data: {
        jobId: validated.jobId,
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        linkedinUrl: validated.linkedinUrl || null,
        resumeUrl: validated.resumeUrl,
      },
    });

    return { success: true, application };
  } catch (err: any) {
    if (err.name === "ZodError") {
      return { success: false, error: err.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to submit job application." };
  }
}

export async function submitPartnerInquiry(formData: unknown) {
  try {
    const validated = PartnerInquirySchema.parse(formData);

    const inquiry = await db.partnerInquiry.create({
      data: {
        companyName: validated.companyName,
        contactName: validated.contactName,
        email: validated.email,
        phone: validated.phone,
        partnershipType: validated.partnershipType,
        message: validated.message,
      },
    });

    return { success: true, inquiry };
  } catch (err: any) {
    if (err.name === "ZodError") {
      return { success: false, error: err.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Failed to submit partner inquiry." };
  }
}
