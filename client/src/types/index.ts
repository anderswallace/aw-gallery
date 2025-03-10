export interface ImageData {
  camera: string;
  film: string;
  content: File;
}

export type Photo = {
  id: string;
  url: string;
  filename: string;
  camera: string;
  film: string;
  uploadedAt: string;
  expiresAt: string;
};
