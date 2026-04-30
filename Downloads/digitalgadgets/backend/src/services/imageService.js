import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

export const uploadImageIfPresent = async (file) => {
  if (!file) {
    return "";
  }

  if (!isCloudinaryConfigured) {
    const base64 = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64}`;
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "digital-gadgets"
  });

  return result.secure_url;
};
