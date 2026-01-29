import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const roles = ['admin','teacher','student'];

    for (const roleName of roles) {
        const role = await prisma.role.upsert({
            where: {name: roleName},
            update: {},
            create: {
                name: roleName,
                description: `Role for ${roleName}`,
            },
        });
        console.log(`Create role: ${role.name}`);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
})