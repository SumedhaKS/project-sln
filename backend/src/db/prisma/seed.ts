// to seed data


import bcrypt from "bcrypt";
import prisma from "..";

async function main() {
    try {
        const admin = await prisma.user.upsert({
            where: {username: "tester1"},
            update: {},
            create: {
                username: "tester1",
                password: await bcrypt.hash('tester1', 10)
            },
        })

        console.log(`Admin seeded successfully: ${admin.username}`);
    }
    catch (err) {
        console.error(`Failed to Seed.\nError: ${err}`);
    }
    finally {
        await prisma.$disconnect();
    }
}

main()
