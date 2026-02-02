const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Hitta din profil
    const profile = await prisma.profile.findUnique({
        where: { email: 'robertangberg@gmail.com' }
    });

    if (!profile) {
        console.log('❌ Profile not found!');
        return;
    }

    console.log('Din profil:', profile.id);
    console.log('');

    // Visa befintlig data
    const allCustomers = await prisma.customer.findMany();
    const allCompanies = await prisma.company.findMany();
    const allDeals = await prisma.deal.findMany();
    const allTasks = await prisma.task.findMany();

    console.log('📊 Befintlig data:');
    console.log(`   Customers: ${allCustomers.length}`);
    console.log(`   Companies: ${allCompanies.length}`);
    console.log(`   Deals: ${allDeals.length}`);
    console.log(`   Tasks: ${allTasks.length}`);
    console.log('');

    // Visa vilka ownerIds som finns
    const customerOwners = [...new Set(allCustomers.map(c => c.ownerId))];
    const companyOwners = [...new Set(allCompanies.map(c => c.createdById))];
    const dealOwners = [...new Set(allDeals.map(d => d.ownerId))];

    console.log('👤 OwnerIds som finns:');
    console.log('   Customers ownerId:', customerOwners);
    console.log('   Companies createdById:', companyOwners);
    console.log('   Deals ownerId:', dealOwners);
    console.log('');

    // Uppdatera ALL data till din profil
    console.log('🔧 Uppdaterar ALL data till dig...');

    const c1 = await prisma.customer.updateMany({
        data: { ownerId: profile.id }
    });
    console.log(`   ✅ Customers: ${c1.count}`);

    const c2 = await prisma.company.updateMany({
        data: { createdById: profile.id }
    });
    console.log(`   ✅ Companies: ${c2.count}`);

    const c3 = await prisma.deal.updateMany({
        data: { ownerId: profile.id }
    });
    console.log(`   ✅ Deals: ${c3.count}`);

    const c4 = await prisma.task.updateMany({
        data: { ownerId: profile.id }
    });
    console.log(`   ✅ Tasks: ${c4.count}`);

    const c5 = await prisma.activityLog.updateMany({
        data: { userId: profile.id }
    });
    console.log(`   ✅ Activity logs: ${c5.count}`);

    console.log('');
    console.log('🎉 Klart! All data är nu din.');
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
    });
