const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Creating test user...')

    // Hash password
    const hashedPassword = await bcrypt.hash('testuser123', 12)

    // Create test user
    const user = await prisma.user.upsert({
      where: { email: 'test@avacasa.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test@avacasa.com',
        phone: '9876543210',
        password: hashedPassword,
        provider: 'email',
        verified: true,
        active: true
      }
    })

    console.log('Test user created:', {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    })

    // Create some sample activities for the test user
    await prisma.userActivity.createMany({
      data: [
        {
          userId: user.id,
          action: 'USER_REGISTER',
          metadata: JSON.stringify({ source: 'seed_script' }),
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script'
        },
        {
          userId: user.id,
          action: 'PAGE_VIEW',
          resource: '/',
          metadata: JSON.stringify({ title: 'Home Page' }),
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script'
        },
        {
          userId: user.id,
          action: 'PAGE_VIEW',
          resource: '/properties',
          metadata: JSON.stringify({ title: 'Properties Page' }),
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script'
        }
      ]
    })

    console.log('Sample activities created for test user')
    console.log('✅ Test user setup complete!')
    console.log('Login credentials:')
    console.log('Email: test@avacasa.com')
    console.log('Password: testuser123')

  } catch (error) {
    console.error('❌ Error creating test user:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 