import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

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
