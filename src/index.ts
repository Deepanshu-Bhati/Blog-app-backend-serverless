import { Hono } from 'hono'
import { decode,sign,verify} from 'hono/jwt'
import  zod  from 'zod'
import { cors } from 'hono/cors'

const app = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string
  } 
}>()
app.use(cors())
// import { PrismaClient } from '@prisma/client/edge.js'
// import {withAccelerate} from '@prisma/extension-accelerate'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'


app.route("/api/v1/user",userRouter)
app.route("/api/v1/blog",blogRouter)

export default app
