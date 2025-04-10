const express = require('express')
const http = require('http')
const {Server} = require('socket.io')
const cors = require('cors');
const bodyParser = require('body-parser');
const executeCpp = require('./utils/executeCpp')

const app = express();

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:'*',
    }
});

app.use(cors());
app.use(bodyParser.json());

app.get('/api',(req,res) => {
    res.status(200).json({message: "API is Running"})
})

//              COMMENTED CUZ THIS IS VERSION 1 CODE WHICH DOES NOT INCLUDE ACCEPTING RUNTIME INPUT 
// app.post('/api/run',async(req,res)=>{
//     const code = req.body.code;
//     console.log(code);
//     if(!code) {
//         return res.status(404).json({message: "Code Not found"});
//     }
//     try {
//         executeCpp(code);
//         res.status(200).json({message: `Your code: ${code}`});
//     }catch(err) {
//         return res.status(500).json({message: `Serevr side Error: ${err}`});
//     }
// })

io.on('connection',(socket)=>{
    console.log('Connected to front-end',socket.id);

    socket.on('run-code',async({code})=>{
        executeCpp(code,socket);
    });

    socket.on('disconnect',()=>{
        console.log('Disconnected with the front-end',socket.id)
    })
})

server.listen(4000,()=>{
    console.log("listening on port 4000");
})