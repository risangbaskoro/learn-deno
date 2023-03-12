import { PrismaClient } from './generated/client/deno/edge.ts'
import { config } from 'https://deno.land/x/dotenv@v3.2.2/mod.ts'
import { Application, Router } from 'https://deno.land/x/oak@v12.1.0/mod.ts'

const envVars = await config()

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: envVars.DATABASE_URL
    }
  }
})

const app = new Application()
const router = new Router()

router
  .get('/', async (ctx) => {
    ctx.response.body = 'Hello World!'
  })
  .get('/users', async (ctx) => {
    const users = await prisma.user.findMany()
    ctx.response.body = users
  })
  .get('/users/:id', async (ctx) => {
    const id = ctx.params.id
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    })
    ctx.response.body = user
  })
  .post('/users', async (ctx) => {
    const { username, email, name } = await ctx.request.body().value
    ctx.response.body = await prisma.user.create({
      data: {
        username,
        email,
        name,
      }
    })
  })

app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port: 5433 })