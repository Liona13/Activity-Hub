import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default categories
  const categories = [
    { name: 'Sports & Fitness', description: 'Physical activities and sports events' },
    { name: 'Arts & Culture', description: 'Creative and cultural activities' },
    { name: 'Education', description: 'Learning and educational events' },
    { name: 'Technology', description: 'Tech meetups and workshops' },
    { name: 'Social', description: 'Social gatherings and meetups' },
    { name: 'Outdoor & Adventure', description: 'Outdoor activities and adventures' },
    { name: 'Food & Drink', description: 'Culinary experiences and tastings' },
    { name: 'Health & Wellness', description: 'Health and wellness activities' },
    { name: 'Business & Career', description: 'Professional development events' },
    { name: 'Music & Entertainment', description: 'Music events and entertainment' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 