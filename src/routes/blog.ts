import { Hono } from 'hono'
import { decode,sign,verify} from 'hono/jwt'
import  zod  from 'zod'
export const blogRouter = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string,
  },
  Variables:{
    userId:string;
  } 
}>()
import { PrismaClient } from '@prisma/client/edge.js'
import {withAccelerate} from '@prisma/extension-accelerate'


// export const blogRouter=new Hono()


blogRouter.use('/*',async (c ,next)=>{
    const header=await c.req.header("authorization") || "";
    try{
  
      
      const responce = await verify(header,c.env.JWT_SECRET)
      console.log("mis matched        ")
      if(responce){

        // @ts-ignore
        c.set("userId",responce.id);
        
       await next()
      }else{
        c.status(403)
        return c.json({error:"unauthorized"})
      }
    }catch(err){
        console.log(err)
      return c.json({
        messasge:"token is not matched"
      })
    }
  
  })
  


blogRouter.post('/',async (c) => {
    const body=await c.req.json()
    const prisma=new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    const data= await prisma.post.create({
  
      data:{
        title:body.title,
        content:body.content,
        authorid:c.get("userId")
      }
    })
    return c.json({
        id: data.id
    })
  })
  
  blogRouter.put('/',async(c) => {

    const body=await c.req.json()
    const prisma=new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate())
    const data= await prisma.post.update({
        where:{
            id:body.id
        },
      data:{
        title:body.title,
        content:body.content,
      }
    })
    return c.json({
        is:data.id
    })
  })
  
  
  
  
  
    blogRouter.get('/bulk',async (c)=>{
      const prisma=new PrismaClient({
          datasourceUrl:c.env.DATABASE_URL
        }).$extends(withAccelerate())
        const data=await prisma.post.findMany({
          select:{
            content:true,
            title:true,
            id:true,
            author:{
              select:{
                name:true
              }
            }
          }
        });
      return c.json({
          msg:data
      })
    })
  blogRouter.get('/get/:id',async (c) => {
    try{

        const body=await c.req.param("id")
        const prisma=new PrismaClient({
          datasourceUrl:c.env.DATABASE_URL
        }).$extends(withAccelerate())
        const data= await prisma.post.findFirst({
            where:{
                id:Number(body)
            },
            select:{
              id:true,
              title:true,
              content:true,
              author:{
                select:{
                  name:true
                }
              }
            }
        })
        return c.json({
            id:data
        })
    }catch(err){
        return c.json({
            err:err
        })
    }
  })

