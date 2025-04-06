const express=require('express');
require('dotenv').config();
const axios=require('axios');
const cors=require('cors');
const http=require('http');
const { Server } = require('socket.io'); 


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://roast-my-spend.vercel.app"],
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: ["http://localhost:5173", "https://roast-my-spend.vercel.app"],
  }));
const port=process.env.PORT;

app.get("/",(req,res)=>{
    res.send("Hello!");
})

function classifyCategory(cat){
    const data={
        "ZOMATO":"food",
        "BLINKIT":"food",
        "SWIGGY":"food",
        "NETFLIX":"entertainment",
    }

    const res=data[cat] || "other";
    return res;
}

app.post('/sms-data',(req,res)=>{
    console.log(req.body);
    const{message,time}=req.body;

    if(!message || typeof message!="string"){
        res.status(404).json({error:"Invalid Data!"});
    }

    const amount=message.match(/Rs. (\d+)/i)?.[1] || '0';
    const merchant=message.match(/to ([A-Z]+)/i)?.[1] || 'Unknown';

    const category=classifyCategory(merchant);
    const money=parseInt(amount);


    console.log("Amount:",amount);
    console.log("Merchant:",merchant);
    console.log("Category:",category);

    const data={
        "money":money,
        "category":category
    }

    io.emit('updateUI',data);
    res.json(data).status(200);
})




server.listen(port,(req,res)=>{
    console.log(`Server listening on port ${port}`);
})