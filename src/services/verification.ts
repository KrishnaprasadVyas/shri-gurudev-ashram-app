import api from "../api/axiosClient";
import { getFriendlyApiError } from "../utils/apiErrors";

export type UploadImageResponse = {
  path: string;
};

export type SubmitVerificationInput = {
  aadhaarNumber: string;
  aadhaarImagePath: string;
  selfieImagePath: string;
};

function getMimeTypeFromUri(imageUri: string): string {
  const match = imageUri.match(/\.([a-zA-Z0-9]+)(?:[?#].*)?$/);

  if (!match) {
    return "image/jpeg";
  }

  const extension = match[1].toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    default:
      return "image/jpeg";
  }
}

export async function uploadAadhaar(
  imageUri: string,
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("aadhaarImage", {
    uri: imageUri,
    type: getMimeTypeFromUri(imageUri),
    name: "aadhaar.jpg",
  } as any);

  try {
    const { data } = await api.post<UploadImageResponse>(
      "/api/users/upload-aadhaar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  } catch (error) {
    throw new Error(
      getFriendlyApiError(
        error,
        "Could not upload Aadhaar image. Please try again.",
      ),
    );
  }
}

export async function uploadSelfie(
  imageUri: string,
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("selfieImage", {
    uri: imageUri,
    type: getMimeTypeFromUri(imageUri),
    name: "selfie.jpg",
  } as any);

  try {
    const { data } = await api.post<UploadImageResponse>(
      "/api/users/upload-selfie",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  } catch (error) {
    throw new Error(
      getFriendlyApiError(
        error,
        "Could not upload selfie image. Please try again.",
      ),
    );
  }
}

export async function submitVerification(
  input: SubmitVerificationInput,
): Promise<void> {
  try {
    await api.post("/api/users/verification/submit", input);
  } catch (error) {
    throw new Error(
      getFriendlyApiError(
        error,
        "Verification submission failed. Please try again.",
        [
          {
            match: /Verification has already been submitted/i,
            message: "Verification already submitted.",
          },
          {
            match: /aadhaarNumber must be exactly 12 numeric digits/i,
            message: "Aadhaar must be 12 digits.",
          },
        ],
      ),
    );
  }
}
