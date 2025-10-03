import express from "express"
import "dotenv/config";
import cors from  "cors";
import http  from "http";
import { connect } from "http2";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app)

// initalize socket.io  server

export const io = new Server(server,{
  cors:{origin:"*"}
})

//store online users

export const userSocketMap={}; // {userId:socketId}


// socket.io connection handler
 io.on("connection" , (socket)=>{
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);

  if(userId)  userSocketMap[userId] =socket.id;

  //emit online users to all conectd clients
  
  io.emit("getOnlineUsers" ,Object.keys(userSocketMap));

  socket.on("disconnect" ,()=>{
    console.log("User Disconnected " ,userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers" ,Object.keys(userSocketMap))
  })
 })

app.use(express.json({limit :"4mb"}));
app.use(cors())

app.use("/api/status" , (req,res)=> res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages" ,messageRouter);

await connectDB()

if(process.env.NODE_ENV !== "production"){
  const PORT =process.env.PORT || 5000;
server.listen(PORT ,()=>  console.log("Server is running on Port " + PORT))
}


 export default server



