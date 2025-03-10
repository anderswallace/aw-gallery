interface PhotoImageProps {
  url: string;
  camera: string;
  film: string;
}

const PhotoImage: React.FC<PhotoImageProps> = ({ url, camera, film }) => {
  return (
    <div className="flex justify-center items-center">
      <img
        src={url}
        alt="Image"
        className="h-[621px] w-auto object-contain"
        loading="lazy"
      />
    </div>
  );
};

export default PhotoImage;
