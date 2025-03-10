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
    <div>
      <h1>Photos</h1>
      <div>
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
  );
};

export default HomePage;
