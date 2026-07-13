import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config({
    path:".env.staging"
})
import { UserRoute } from "./routes"
import { connectMasterDB } from "../config/ConnectDB"
import { errorMiddleware,requestTimer } from "./middlewares"
const App=express()
App.use(cors({
  origin: [/\.lohithdev\.site$/, "http://localhost:5173"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "subdomain"],
}));
App.use(express.json())
App.use(requestTimer)
App.get("/",(req,res)=>{
      res.send("Hello world")
})
App.use("/api/users",UserRoute)
App.use(errorMiddleware)
connectMasterDB().then(() => {
    App.listen(process.env.PORT || 3000, () => {
        console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
    })
})