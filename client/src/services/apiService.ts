import { ImageData } from "../types";

const baseUri = import.meta.env.VITE_API_URI;

export const uploadPhotoForm = async (imageData: ImageData) => {
  const formData = new FormData();
  formData.append("camera", imageData.camera);
  formData.append("film", imageData.film);
  formData.append("file", imageData.content);

  try {
    const response = await fetch(`${baseUri}/photos`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return response;
  } catch (err) {
    console.error("Error submitting form data: ", err);
    throw err;
  }
};
