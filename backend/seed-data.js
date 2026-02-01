const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    // Hämta befintliga kunder
    const customers = await prisma.customer.findMany();
    if (customers.length === 0) {
        console.log('Inga kunder finns');
        return;
    }

    console.log(`Hittade ${customers.length} kunder`);

    // Skapa deals
    const deals = [
        { title: 'Webbprojekt ABC', value: 150000, stage: 'won', customerId: customers[0].id },
        { title: 'App-utveckling XYZ', value: 280000, stage: 'negotiation', customerId: customers[1 % customers.length].id },
        { title: 'Konsultuppdrag Q1', value: 75000, stage: 'proposal', customerId: customers[2 % customers.length].id },
        { title: 'E-handel redesign', value: 120000, stage: 'contact', customerId: customers[3 % customers.length].id },
        { title: 'CRM-implementation', value: 95000, stage: 'lead', customerId: customers[4 % customers.length].id },
        { title: 'Support-avtal 2026', value: 45000, stage: 'won', customerId: customers[0].id },
        { title: 'Förlorat projekt', value: 200000, stage: 'lost', customerId: customers[1 % customers.length].id },
        { title: 'API-integration', value: 65000, stage: 'proposal', customerId: customers[2 % customers.length].id },
    ];

    for (const deal of deals) {
        const created = await prisma.deal.create({ data: deal });
        await prisma.activityLog.create({
            data: {
                action: 'created',
                entityType: 'deal',
                entityId: created.id,
                entityName: deal.title,
            }
        });
    }
    console.log('Skapade 8 deals');

    // Skapa tasks
    const tasks = [
        { title: 'Ring kund om offert', priority: 'high', dueDate: new Date('2026-02-03') },
        { title: 'Förbered presentation', priority: 'medium', dueDate: new Date('2026-02-05') },
        { title: 'Skicka kontrakt', priority: 'high', dueDate: new Date('2026-02-02'), completed: true },
        { title: 'Boka möte med IT', priority: 'low', dueDate: new Date('2026-02-10') },
        { title: 'Uppföljning vecka 6', priority: 'medium', dueDate: new Date('2026-02-07') },
        { title: 'Försenad uppgift', priority: 'high', dueDate: new Date('2026-01-25') },
        { title: 'Avsluta projekt', priority: 'medium', dueDate: new Date('2026-01-30'), completed: true },
    ];

    for (const task of tasks) {
        const created = await prisma.task.create({ data: task });
        await prisma.activityLog.create({
            data: {
                action: 'created',
                entityType: 'task',
                entityId: created.id,
                entityName: task.title,
            }
        });
    }
    console.log('Skapade 7 tasks');

    await prisma.$disconnect();
    console.log('Klart!');
}

seed().catch(e => {
    console.error(e);
    process.exit(1);
});
