import path from "path";
import fs from "fs";
import { Router } from "express";
import { HttpError } from "../errors";
import { AuthenticatedRequest, requireAuth, requireAdmin } from "../middleware/auth";
import { profileImageUpload, upload } from "../middleware/upload";
import { supabaseAdmin } from "../services/supabaseAdmin";
import { createNotification } from "../services/notifications";
import { NotificationType } from "../constants/notifications";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, async (request, response, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", (request as AuthenticatedRequest).userId)
      .single();
    if (error || !data) throw new HttpError(404, "User profile not found");
    response.json({ user: data });
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", requireAuth, async (request, response, next) => {
  try {
    const body = request.body ?? {};
    const updates: Record<string, unknown> = {};
    if (typeof body.fullName === "string")
      updates.full_name = body.fullName.trim();
    if (typeof body.phone === "string" || typeof body.phoneNumber === "string")
      updates.phone = (body.phone || body.phoneNumber).trim();
    if (typeof body.email === "string")
      updates.email = body.email.trim();
    if ("profileImageUrl" in body && (body.profileImageUrl === null || typeof body.profileImageUrl === "string"))
      updates.profile_image_url = body.profileImageUrl;
    if (typeof body.pushToken === "string")
      updates.push_token = body.pushToken;

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", (request as AuthenticatedRequest).userId)
      .select("*")
      .single();

    if (error || !data)
      throw new HttpError(400, error?.message ?? "Could not update profile");
    response.json({ user: data });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/me", requireAuth, async (request, response, next) => {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", (request as AuthenticatedRequest).userId);

    if (error) throw new HttpError(400, error.message);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

type SubmitVerificationBody = {
  identityType?: "aadhaar" | "pan";
  aadhaarNumber?: string;
  aadhaarImagePath?: string | null;
  aadhaarBackImagePath?: string | null;
  selfieImagePath?: string | null;
  panNumber?: string;
  panImagePath?: string | null;
};

// Upload Aadhaar Front image
usersRouter.post(
  "/upload-aadhaar",
  requireAuth,
  upload.single("aadhaarImage"),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & {
        file?: Express.Multer.File;
      };

      if (!authRequest.file) {
        throw new HttpError(400, "No image file provided");
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`;

      response.status(200).json({ path: relativePath });
    } catch (error) {
      next(error);
    }
  },
);

// Upload Aadhaar Back image
usersRouter.post(
  "/upload-aadhaar-back",
  requireAuth,
  upload.single("aadhaarBackImage"),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & {
        file?: Express.Multer.File;
      };

      if (!authRequest.file) {
        throw new HttpError(400, "No image file provided");
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`;

      response.status(200).json({ path: relativePath });
    } catch (error) {
      next(error);
    }
  },
);

// Upload PAN image
usersRouter.post(
  "/upload-pan",
  requireAuth,
  upload.single("panImage"),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & {
        file?: Express.Multer.File;
      };

      if (!authRequest.file) {
        throw new HttpError(400, "No image file provided");
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`;

      response.status(200).json({ path: relativePath });
    } catch (error) {
      next(error);
    }
  },
);

// Upload selfie image
usersRouter.post(
  "/upload-selfie",
  requireAuth,
  upload.single("selfieImage"),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & {
        file?: Express.Multer.File;
      };

      if (!authRequest.file) {
        throw new HttpError(400, "No image file provided");
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`;

      response.status(200).json({ path: relativePath });
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.post(
  "/upload-profile-image",
  requireAuth,
  profileImageUpload.single("profileImage"),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & {
        file?: Express.Multer.File;
      };

      if (!authRequest.file) {
        throw new HttpError(400, "No image file provided");
      }

      const relativePath = `/uploads/profile-images/${authRequest.userId}/${authRequest.file.filename}`;

      const { error } = await supabaseAdmin
        .from("users")
        .update({ profile_image_url: relativePath })
        .eq("id", authRequest.userId);

      if (error) {
        throw new HttpError(400, error.message ?? "Could not update user profile image URL");
      }

      response.status(200).json({
        publicUrl: relativePath,
        path: relativePath,
        url: relativePath,
      });
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  "/verifications/document",
  requireAuth,
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & { userRole?: string };
      const rawPath = String(request.query.path || request.query.filepath || "");
      if (!rawPath) throw new HttpError(400, "Document path parameter is required");

      const baseDir = path.resolve(process.cwd(), "uploads", "verifications");
      const normalizedPath = rawPath.replace(/^[/\\]+/, "");
      const targetPath = path.resolve(process.cwd(), normalizedPath);

      // Prevent path traversal
      if (!targetPath.startsWith(baseDir)) {
        throw new HttpError(403, "Access denied: invalid document path");
      }

      if (!fs.existsSync(targetPath)) {
        throw new HttpError(404, "Verification document not found");
      }

      // Check owner or admin
      const isOwner = authRequest.userId && targetPath.includes(path.join("uploads", "verifications", authRequest.userId));
      const isAdmin = authRequest.userRole && ["admin", "WEBSITE_ADMIN", "SYSTEM_ADMIN"].includes(authRequest.userRole);

      if (!isOwner && !isAdmin) {
        // Double check admin role from DB if not already set on request
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("id", authRequest.userId)
          .maybeSingle();

        if (!user || !["admin", "WEBSITE_ADMIN", "SYSTEM_ADMIN"].includes(user.role)) {
          throw new HttpError(403, "Forbidden access to verification document");
        }
      }

      response.sendFile(targetPath);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.post(
  "/verification/submit",
  requireAuth,
  async (request, response, next) => {
    try {
      const {
        aadhaarNumber,
        aadhaarImagePath,
        selfieImagePath,
      } = request.body as SubmitVerificationBody;

      const authRequest = request as AuthenticatedRequest;

      // Check existing status
      const { data: existingUser, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("verification_status")
        .eq("id", authRequest.userId)
        .maybeSingle();

      if (fetchError) {
        throw new HttpError(500, "Failed to load user profile");
      }

      if (!existingUser) {
        throw new HttpError(404, "User profile not found");
      }

      if (
        existingUser.verification_status === "submitted" ||
        existingUser.verification_status === "verified"
      ) {
        throw new HttpError(409, "Verification has already been submitted");
      }

      if (!aadhaarNumber || typeof aadhaarNumber !== "string" || !/^\d{12}$/.test(aadhaarNumber.trim())) {
        throw new HttpError(400, "aadhaarNumber must be exactly 12 numeric digits");
      }
      if (!aadhaarImagePath || typeof aadhaarImagePath !== "string" || !aadhaarImagePath.trim()) {
        throw new HttpError(400, "aadhaarImagePath is required");
      }
      if (!selfieImagePath || typeof selfieImagePath !== "string" || !selfieImagePath.trim()) {
        throw new HttpError(400, "selfieImagePath is required");
      }

      const updatePayload = {
        verification_status: "submitted",
        aadhaar_number: aadhaarNumber.trim(),
        aadhaar_image_path: aadhaarImagePath.trim(),
        selfie_image_path: selfieImagePath.trim(),
      };

      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update(updatePayload)
        .eq("id", authRequest.userId)
        .select("*")
        .single();

      if (updateError || !updatedUser) {
        throw new HttpError(
          500,
          updateError?.message ?? "Failed to submit verification",
        );
      }

      response.status(200).json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  },
);

// ─── Website Admin Verification Management ──────────────────────────────────
usersRouter.get("/admin/verifications", requireAdmin, async (request, response, next) => {
  try {
    const status = request.query.status as string | undefined;
    let query = supabaseAdmin
      .from("users")
      .select("id, full_name, phone, email, verification_status, aadhaar_number, aadhaar_image_path, selfie_image_path, created_at")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("verification_status", status);
    } else {
      query = query.in("verification_status", ["submitted", "verified", "rejected"]);
    }

    const { data, error } = await query;
    if (error) throw new HttpError(500, error.message);
    response.json({ verifications: data ?? [] });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/admin/verifications/:targetUserId/review", requireAdmin, async (request, response, next) => {
  try {
    const { targetUserId } = request.params;
    const { action, notes } = request.body ?? {};

    if (!action || !["approve", "reject"].includes(action)) {
      throw new HttpError(400, "Action must be 'approve' or 'reject'");
    }

    const newStatus = action === "approve" ? "verified" : "rejected";

    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update({
        verification_status: newStatus,
      })
      .eq("id", targetUserId)
      .select("*")
      .single();

    if (error || !updatedUser) {
      throw new HttpError(500, error?.message ?? "Failed to update verification review");
    }

    const userIdStr = String(targetUserId);

    if (newStatus === "verified") {
      await createNotification(userIdStr, "Verification Approved", "Your identity verification has been approved by the Ashram administration.", NotificationType.VERIFICATION_APPROVED);
    } else {
      await createNotification(userIdStr, "Verification Update", `Your identity verification status was updated to ${newStatus}.${notes ? ` Notes: ${notes}` : ""}`, NotificationType.VERIFICATION_UPDATED);
    }

    response.json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
});
