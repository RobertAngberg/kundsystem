import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Hämta första profilen (din inloggade användare)
  const profile = await prisma.profile.findFirst();
  if (!profile) {
    console.log('❌ Ingen profil hittades! Logga in i appen först.');
    return;
  }
  console.log(
    `👤 Använder profil: ${profile.name || profile.email} (${profile.id})`,
  );

  // Rensa befintlig data (i rätt ordning pga foreign keys)
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.company.deleteMany();

  console.log('🗑️  Raderade all befintlig data');

  const ownerId = profile.id;

  // Skapa företag
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Spotify AB',
        orgNumber: '556703-7485',
        email: 'info@spotify.com',
        phone: '08-123 45 67',
        website: 'https://spotify.com',
        address: 'Regeringsgatan 19',
        city: 'Stockholm',
        zipCode: '111 53',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Klarna Bank AB',
        orgNumber: '556737-0431',
        email: 'kontakt@klarna.se',
        phone: '08-120 120 00',
        website: 'https://klarna.com',
        address: 'Sveavägen 46',
        city: 'Stockholm',
        zipCode: '111 34',
      },
    }),
    prisma.company.create({
      data: {
        name: 'IKEA Svenska AB',
        orgNumber: '556074-7569',
        email: 'kundservice@ikea.se',
        phone: '0476-587 00',
        website: 'https://ikea.se',
        address: 'Tulpanvägen 8',
        city: 'Älmhult',
        zipCode: '343 81',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Volvo Cars AB',
        orgNumber: '556074-3089',
        email: 'info@volvocars.com',
        phone: '031-59 00 00',
        website: 'https://volvocars.com',
        address: 'Assar Gabrielssons väg',
        city: 'Göteborg',
        zipCode: '405 31',
      },
    }),
    prisma.company.create({
      data: {
        name: 'Northvolt AB',
        orgNumber: '559015-8894',
        email: 'hello@northvolt.com',
        phone: '08-505 855 00',
        website: 'https://northvolt.com',
        address: 'Alströmergatan 20',
        city: 'Stockholm',
        zipCode: '112 47',
      },
    }),
  ]);

  console.log(`🏢 Skapade ${companies.length} företag`);

  // Skapa kunder
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Anna Lindberg',
        email: 'anna.lindberg@spotify.com',
        phone: '070-123 45 67',
        companyId: companies[0].id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Erik Johansson',
        email: 'erik.johansson@klarna.se',
        phone: '073-987 65 43',
        companyId: companies[1].id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Maria Svensson',
        email: 'maria.svensson@ikea.se',
        phone: '076-555 12 34',
        companyId: companies[2].id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Johan Bergström',
        email: 'johan.bergstrom@volvocars.com',
        phone: '070-111 22 33',
        companyId: companies[3].id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Lisa Ekström',
        email: 'lisa.ekstrom@northvolt.com',
        phone: '072-444 55 66',
        companyId: companies[4].id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Anders Nilsson',
        email: 'anders.nilsson@gmail.com',
        phone: '073-777 88 99',
        companyId: null,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sofia Larsson',
        email: 'sofia.larsson@outlook.com',
        phone: '070-333 44 55',
        companyId: null,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Oscar Andersson',
        email: 'oscar@techstartup.se',
        phone: '076-222 33 44',
        companyId: companies[0].id,
      },
    }),
  ]);

  console.log(`👥 Skapade ${customers.length} kunder`);

  // Skapa deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: 'Spotify - CRM Implementation',
        value: 450000,
        stage: 'won',
        customerId: customers[0].id,
        ownerId,
        description: 'Fullständig CRM-implementation för säljteamet',
        closedAt: new Date('2026-01-15'),
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Klarna - API Integration',
        value: 280000,
        stage: 'negotiation',
        customerId: customers[1].id,
        ownerId,
        description: 'Integration med betalningssystem',
      },
    }),
    prisma.deal.create({
      data: {
        title: 'IKEA - E-handel Dashboard',
        value: 175000,
        stage: 'proposal',
        customerId: customers[2].id,
        ownerId,
        description: 'Analytics dashboard för e-handel',
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Volvo - Fleet Management',
        value: 620000,
        stage: 'contact',
        customerId: customers[3].id,
        ownerId,
        description: 'System för fordonshantering',
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Northvolt - Produktionssystem',
        value: 380000,
        stage: 'lead',
        customerId: customers[4].id,
        ownerId,
        description: 'Uppföljning av batteriproduktion',
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Spotify - Support Avtal',
        value: 95000,
        stage: 'won',
        customerId: customers[7].id,
        ownerId,
        description: 'Årligt supportavtal',
        closedAt: new Date('2026-01-20'),
      },
    }),
    prisma.deal.create({
      data: {
        title: 'IKEA - Lagerhantering',
        value: 150000,
        stage: 'lost',
        customerId: customers[2].id,
        ownerId,
        description: 'Förlorad till konkurrent',
        closedAt: new Date('2026-01-10'),
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Anders Nilsson - Hemsida',
        value: 35000,
        stage: 'proposal',
        customerId: customers[5].id,
        ownerId,
        description: 'Enkel företagshemsida',
      },
    }),
  ]);

  console.log(`💼 Skapade ${deals.length} deals`);

  // Skapa tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Ring Klarna om kontraktsdetaljer',
        description: 'Diskutera slutliga villkor',
        dueDate: tomorrow,
        priority: 'high',
        dealId: deals[1].id,
        ownerId,
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Skicka offert till IKEA',
        description: 'Färdigställ och skicka offerten',
        dueDate: today,
        priority: 'high',
        dealId: deals[2].id,
        ownerId,
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Boka demo med Volvo',
        description: 'Visa fleet management-prototyp',
        dueDate: nextWeek,
        priority: 'medium',
        dealId: deals[3].id,
        ownerId,
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Förbered presentation för Northvolt',
        description: 'PowerPoint + teknisk spec',
        dueDate: yesterday,
        priority: 'high',
        dealId: deals[4].id,
        ownerId,
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Uppföljning Spotify support',
        description: 'Kolla att allt fungerar',
        dueDate: tomorrow,
        priority: 'medium',
        dealId: deals[5].id,
        ownerId,
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fakturera Spotify CRM',
        description: 'Slutfaktura för projektet',
        dueDate: twoDaysAgo,
        priority: 'medium',
        dealId: deals[0].id,
        ownerId,
        completed: true,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Uppdatera dokumentation',
        description: 'Lägg till nya features i manualen',
        dueDate: nextWeek,
        priority: 'low',
        ownerId,
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Skicka kontrakt till Anders',
        description: 'Hemsideprojekt avtal',
        dueDate: today,
        priority: 'medium',
        dealId: deals[7].id,
        ownerId,
        completed: true,
      },
    }),
  ]);

  console.log(`✅ Skapade ${tasks.length} tasks`);

  // Skapa aktivitetslogg
  const activities = await Promise.all([
    prisma.activityLog.create({
      data: {
        action: 'created',
        entityType: 'deal',
        entityId: deals[0].id,
        entityName: deals[0].title,
        createdAt: new Date('2026-01-05'),
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'stage_changed',
        entityType: 'deal',
        entityId: deals[0].id,
        entityName: deals[0].title,
        oldValue: 'negotiation',
        newValue: 'won',
        createdAt: new Date('2026-01-15'),
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'created',
        entityType: 'customer',
        entityId: customers[0].id,
        entityName: customers[0].name || customers[0].email,
        createdAt: new Date('2026-01-03'),
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'completed',
        entityType: 'task',
        entityId: tasks[5].id,
        entityName: tasks[5].title,
        createdAt: new Date('2026-01-28'),
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'stage_changed',
        entityType: 'deal',
        entityId: deals[6].id,
        entityName: deals[6].title,
        oldValue: 'proposal',
        newValue: 'lost',
        createdAt: new Date('2026-01-10'),
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'created',
        entityType: 'deal',
        entityId: deals[1].id,
        entityName: deals[1].title,
        createdAt: new Date('2026-01-25'),
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'stage_changed',
        entityType: 'deal',
        entityId: deals[1].id,
        entityName: deals[1].title,
        oldValue: 'proposal',
        newValue: 'negotiation',
        createdAt: new Date('2026-01-30'),
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'completed',
        entityType: 'task',
        entityId: tasks[7].id,
        entityName: tasks[7].title,
        createdAt: new Date('2026-02-01'),
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'created',
        entityType: 'company',
        entityId: companies[0].id,
        entityName: companies[0].name,
        createdAt: new Date('2026-01-02'),
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'created',
        entityType: 'task',
        entityId: tasks[0].id,
        entityName: tasks[0].title,
        createdAt: new Date('2026-01-31'),
      },
    }),
  ]);

  console.log(`📋 Skapade ${activities.length} aktivitetsloggar`);

  console.log('✅ Seed klar!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
