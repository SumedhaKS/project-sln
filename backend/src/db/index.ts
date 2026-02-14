import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

const prismaClientSingleton = () => {
    const connectionString = `${process.env.DATABASE_URL}`
    const adapter = new PrismaPg({ connectionString })
    const prisma = new PrismaClient({ adapter })
    return prisma
}

type prismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: prismaClientSingleton | undefined;
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;
