import {Prisma, PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Pistonmaster',
    email: 'piston@socialtale.net',
    owningOrg: {
      create: [
        {
          name: 'Prisma',
          slug: 'prisma',
          members: {
            create: [
              {
                role: 'OWNER',
                member: {
                  connect: {
                    email: 'piston@socialtale.net'
                  }
                }
              },
              {
                role: 'ADMIN',
                member: {
                  create: {
                    name: 'Cat',
                    email: 'cat@socialtale.net'
                  }
                },
              },
              {
                role: 'MEMBER',
                member: {
                  create: {
                    name: 'Fox',
                    email: 'fox@socialtale.net'
                  }
                }
              }
            ]
          }
        }]
    }
  },
  {
    name: 'Win',
    email: 'win@socialtale.net',
  },
  {
    name: 'Qbasty',
    email: 'qbasty@socialtale.net',
  }
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })
