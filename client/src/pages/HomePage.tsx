import { useEffect, useState } from "react";
import PhotoImage from "../components/PhotoImage/PhotoImage";
import { getPhotos } from "../services/apiService";
import { Photo } from "../types";

const HomePage = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photoData = await getPhotos();
        setPhotos(photoData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen mb-10">
      <div className="w-full max-w-[1000px] px-4">
        <div className="flex flex-col items-center gap-20">
          {photos.map((photo) => (
            <PhotoImage
              key={photo.id}
              url={photo.url}
              camera={photo.camera}
              film={photo.film}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
