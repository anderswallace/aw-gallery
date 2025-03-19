import { ImageData } from "../types";
import { Photo } from "../types";

const baseUri = import.meta.env.VITE_API_URI || "http://localhost:4000";

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

export const getPhotos = async (): Promise<Photo[]> => {
  try {
    const response = await fetch(`${baseUri}/data`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data: Photo[] = await response.json();
    return data;
  } catch (err) {
    console.error("Error getting photos: ", err);
    throw err;
  }
};
