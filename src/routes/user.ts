import { Hono } from 'hono'
import { decode,sign,verify} from 'hono/jwt'
import { signup,signin,updateblog,createblog } from 'human-common'



export const userRouter = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string
  } 
}>()
import { PrismaClient } from '@prisma/client/edge.js'
import {withAccelerate} from '@prisma/extension-accelerate'



// export const userRouter=new Hono();


userRouter.post('/signup',async (c) => {
    const prisma =new PrismaClient({
      
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const body= await c.req.json()
    const {success}=signup.safeParse(body)
    if(!success){
        c.status(403)
        return c.json({
            msg:"invalid fields"
        })
    }

    console.log(body)
    const user=await prisma.user.create({
      data:{
        email:body.email,
        password:body.password,
        name :body.name
      }
    })

    const token =await sign({id:user.id},c.env.JWT_SECRET)
    const decoded=await decode(token)
    console.log(decoded.payload.id)

    return c.json({
      token:token
    })
  })
  
  userRouter.post('/signin',async (c) => {
  
    const prisma=new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body= await c.req.json()
  
    const user=await prisma.user.findUnique({
      where:{
        email:body.email,
        password:body.password
      }
    })
    if(!user){
      c.status(403);
      return c.json({
        error:"user is not found"
      })
    }
    const token=await sign({email:body.email},c.env.DATABASE_URL)
    const decoded= await decode(token)
    const email= await decoded.payload.email
    return c.text("user is found with "+email+token)
  })