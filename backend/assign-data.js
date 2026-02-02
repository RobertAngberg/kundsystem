const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const profile = await prisma.profile.findUnique({
        where: { email: 'robertangberg@gmail.com' }
    });
    console.log('User ID:', profile?.id);

    if (profile) {
        // Uppdatera alla kunder utan ownerId
        const customers = await prisma.customer.updateMany({
            where: { ownerId: null },
            data: { ownerId: profile.id }
        });
        console.log('Updated customers:', customers.count);

        // Uppdatera alla företag utan createdById
        const companies = await prisma.company.updateMany({
            where: { createdById: null },
            data: { createdById: profile.id }
        });
        console.log('Updated companies:', companies.count);

        // Uppdatera alla deals utan ownerId
        const deals = await prisma.deal.updateMany({
            where: { ownerId: null },
            data: { ownerId: profile.id }
        });
        console.log('Updated deals:', deals.count);

        // Uppdatera alla tasks utan ownerId
        const tasks = await prisma.task.updateMany({
            where: { ownerId: null },
            data: { ownerId: profile.id }
        });
        console.log('Updated tasks:', tasks.count);

        // Uppdatera alla activity logs utan userId
        const logs = await prisma.activityLog.updateMany({
            where: { userId: null },
            data: { userId: profile.id }
        });
        console.log('Updated activity logs:', logs.count);

        console.log('\nDone! All data now belongs to you.');
    } else {
        console.log('Profile not found!');
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
    });
