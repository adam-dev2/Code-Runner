const {writeFile, unlink} = require('fs/promises')
const {exec} = require('child_process')
const path = require('path')
const {v4:uuid} = require('uuid')


const executeCpp = async(code)=>{
    const jobId = uuid();
    const filePath = path.join(__dirname,`../temp/${jobId}.cpp`);
    const outPath = path.join(__dirname,`../temp/${jobId}.out`);

    await writeFile(filePath,code);

    return new Promise((resolve,reject) => {
        exec(`g++ ${filePath} -o ${outPath}.out`,(compileErr,_,compilerStderr)=>{
            if(compileErr){
                return reject({error: compilerStderr});
            }

            exec(`${outPath}`,{timeout:5000}, async(execErr,stdout,stderr)=>{
                await unlink(filePath);
                await unlink(outPath).catch(()=>{});


                if(execErr){
                    return reject({error: stderr||execErr.message});
                }

                resolve({output: stdout});
                
            })
        })
    })
}

module.exports = executeCpp;