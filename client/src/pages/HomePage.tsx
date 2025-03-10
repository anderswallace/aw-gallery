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
    <div className="flex flex-col items-center min-h-screen mb-10 mt-5">
      <header className="w-full max-w-[1000px] bg-white fixed top-0 z-10 lg:py-10 sm:py-0 px-5 lg:block">
        <h1 className="lg:text-4xl sm:text-1xl font-bold text-gray-900 mb-10">
          Anders Wallace
        </h1>
      </header>
      <div className="w-full max-w-[1000px] px-4 lg:pt-35 sm:pt-5">
        <div className="flex flex-col items-start gap-20">
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
