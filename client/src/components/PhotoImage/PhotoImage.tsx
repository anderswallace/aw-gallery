interface PhotoImageProps {
  url: string;
  camera: string;
  film: string;
}

const PhotoImage: React.FC<PhotoImageProps> = ({ url, camera, film }) => {
  return (
    <div className="flex flex-col justify-center">
      <img
        src={url}
        alt="Image"
        className="w-full max-w-[930px] max-h-[621px] h-auto object-contain"
        loading="lazy"
      />
      <div className="flex justify-between w-full mt-2">
        <span className="text-sm text-gray-700">{camera}</span>
        <span className="text-sm text-gray-700">{film}</span>
      </div>
    </div>
  );
};

export default PhotoImage;
