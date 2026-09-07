import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PLANS = [
  { name: "Starter", monthlyCredits: 60, priceCents: 1690 },
  { name: "Pro", monthlyCredits: 180, priceCents: 3290 },
  { name: "Business", monthlyCredits: 420, priceCents: 6590 },
];

async function main() {
  for (const plan of PLANS) {
    const row = await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`Seeded plan: ${row.name} (${row.monthlyCredits}cr, $${(row.priceCents / 100).toFixed(2)})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
