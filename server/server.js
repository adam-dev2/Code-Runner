const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const executeCpp = require('./utils/executeCpp')

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api',(req,res) => {
    res.status(200).json({message: "API hit"})
})

app.post('/api/run',async(req,res)=>{
    const code = req.body.code;
    console.log(code);
    if(!code) {
        return res.status(404).json({message: "Code Not found"});
    }
    try {
        executeCpp(code);
        res.status(200).json({message: `Your code: ${code}`});
    }catch(err) {
        return res.status(500).json({message: `Serevr side Error: ${err}`});
    }
})

app.listen(4000,()=>{
    console.log("listening on port 4000");
})