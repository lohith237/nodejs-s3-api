import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config({
    path:".env.staging"
})
import { UserRoute } from "./routes"
const App=express()
App.use(cors())
App.use(express.json())
App.get("/",(req,res)=>{
      res.send("Hello world")
})
App.use("/api/users",UserRoute)
App.listen(process.env.PORT||3000,()=>{
    console.log(`Server running at http://localhost:${process.env.PORT||3000}`);
})