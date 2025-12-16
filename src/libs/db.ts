import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../generated/prisma/client.js'

const url = String(process.env.DATABASE_URL)
const params = url.match(
  /^mysql:\/\/(?<user>.+?):(?<password>.+?)@(?<host>.+?):(?<port>\d+)\/(?<database>.+?)$/
)?.groups || {}

const adapter = new PrismaPg({
  user: params.user,
  password: params.password,
  host: params.host,
  port: Number(params.port),
  database: params.database,
})
const prisma = new PrismaClient({adapter})

export default prisma