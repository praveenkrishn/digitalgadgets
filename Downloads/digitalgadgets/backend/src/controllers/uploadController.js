import { uploadImageIfPresent } from "../services/imageService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadProductImage = asyncHandler(async (req, res) => {
  const image = await uploadImageIfPresent(req.file);

  if (!image) {
    const error = new Error("Please upload an image");
    error.statusCode = 400;
    throw error;
  }

  res.status(201).json({
    success: true,
    image
  });
});
