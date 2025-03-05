import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { Photo } from "../controllers/photosController";

const prisma = new PrismaClient();

export const uploadMetadata = async (url: string, photo: Photo) => {
  try {
    const photoMetadata = await prisma.photo.create({
      data: {
        id: photo.id,
        url: url,
        filename: photo.file.originalname,
        camera: photo.camera,
        film: photo.film,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

async function seedPhotos() {
  const photos = Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    url: faker.internet.domainName(),
    filename: faker.system.fileName(),
    camera: faker.company.name(),
    film: faker.commerce.productMaterial(),
    uploadedAt: faker.date.anytime(),
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
