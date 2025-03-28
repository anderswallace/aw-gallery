import { Photo, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { Image } from "../controllers/photosController.js";
import { generatePresignedUrl } from "./s3Service.js";
import { config } from "../config/config.js";

const prisma = new PrismaClient();

export const uploadMetadata = async (url: string, photo: Image) => {
  const uploadTime = new Date();
  const expirationTime = new Date(
    uploadTime.getTime() + 1000 * 60 * 60 * 24 * 7
  ); // set expiration time to 7 days in future
  try {
    const photoMetadata = await prisma.photo.create({
      data: {
        id: photo.id,
        url: url,
        filename: photo.file.originalname,
        camera: photo.camera,
        film: photo.film,
        expiresAt: expirationTime,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export const fetchPhotos = async (): Promise<Photo[]> => {
  const photos = await prisma.photo.findMany();
  const now = new Date();

  // check if returned photos have expired pre-signed urls
  // update the URLs if expired
  const updatedPhotos = await Promise.all(
    photos.map(async (photo) => {
      if (new Date(photo.expiresAt) < now) {
        const newUrl = await generatePresignedUrl(
          `${config.awsDirectory}/${photo.filename}/${photo.id}`
        );
        const updatedExpirationDate = new Date(
          now.getTime() + 1000 * 60 * 60 * 24 * 7
        );

        // update database entry for expired photo
        await prisma.photo.update({
          where: { id: photo.id },
          data: {
            url: newUrl,
            expiresAt: updatedExpirationDate,
          },
        });
        return { ...photo, url: newUrl, expiresAt: updatedExpirationDate };
      }

      // if not expired, return original data
      return photo;
    })
  );
  return updatedPhotos;
};

// seed database with placeholder data for testing
/*
async function seedPhotos() {
  const photos = Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    url: faker.internet.domainName(),
    filename: faker.system.fileName(),
    camera: faker.company.name(),
    film: faker.commerce.productMaterial(),
    uploadedAt: faker.date.anytime(),
    expiresAt: faker.date.anytime(),
  }));

  await prisma.photo.createMany({
    data: photos,
  });

  console.log("Photos seeded");
}

async function seed() {
  const photoCount = await prisma.photo.count();

  if (photoCount) {
    console.log("Database already has entries. Skipping seed.");
    return;
  }

  console.log("Seeding photos...");
  await seedPhotos();
  console.log("Seeding completed");
}

export { seed };
*/
