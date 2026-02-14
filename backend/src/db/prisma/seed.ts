// to seed data


import bcrypt from "bcrypt";
import prisma from "..";

async function main() {
    try {
        const admin = await prisma.user.upsert({
            where: {username: "admin"},
            update: {},
            create: {
                username: "admin",
                password: await bcrypt.hash('secretadmin', 10)
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
