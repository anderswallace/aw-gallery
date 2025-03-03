import React, { useState, useEffect, useRef } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { cameraOptions, allowedExtensions } from "../../constants/constants";
import ImageUploadButton from "../ImageUploadButton/ImageUploadButton";
import { ImageData } from "../../types";
import { uploadPhotoForm } from "../../services/apiService";

const PhotoUpload: React.FC = () => {
  const [cameraValue, setCameraValue] = useState<string | null>(
    cameraOptions[0]
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [filmValue, setFilmValue] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      alert("Please upload a file");
      setPhotoFile(null);
    } else {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        setPhotoFile(file);
      } else {
        alert(
          `Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`
        );
        setPhotoFile(null);
      }
    }
  };

  const handleFileUpload = async () => {
    if (cameraValue !== null && photoFile !== null && filmValue !== "") {
      const imageData: ImageData = {
        camera: cameraValue,
        film: filmValue,
        content: photoFile,
      };

      try {
        const response = await uploadPhotoForm(imageData);
        console.log(response.status);

        if (!response.ok) {
          console.log("Error uploading image");
        } else {
          console.log("Success: ", response);
          setPhotoFile(null);
          setPhotoPreview("");
          setFilmValue("");
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // TODO: Handle behavior for consecutive uploads
      } catch (err) {
        console.error("Failed to upload data: ", err);
      }
    } else {
      alert("Please fill all fields before submitting");
      return;
    }
  };

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [photoFile]);

  return (
    <div>
      <div className="flex justify-center m-15">
        <Box className="flex space-x-5">
          <div>
            <Autocomplete
              value={cameraValue}
              onChange={(_event: any, newValue: string | null) => {
                setCameraValue(newValue);
                if (newValue === "Leica Q2") {
                  setFilmValue("N/A");
                }
              }}
              options={cameraOptions}
              sx={{ width: 250 }}
              renderInput={(params) => <TextField {...params} label="Camera" />}
            />
          </div>
          <div>
            <TextField
              id="outlined-basic"
              value={filmValue}
              label="Film"
              variant="outlined"
              disabled={cameraValue === "Leica Q2"}
              onChange={(e) => setFilmValue(e.target.value)}
            />
          </div>
          <div className="flex">
            <ImageUploadButton onChange={handleFileChange} ref={fileInputRef} />
          </div>
          <div className="flex">
            <Button disabled={!photoFile} onClick={handleFileUpload}>
              Upload
            </Button>
          </div>
        </Box>
      </div>
      <div className="flex justify-center">
        {photoPreview && <img src={photoPreview} height={270} width={180} />}
      </div>
    </div>
  );
};

export default PhotoUpload;
