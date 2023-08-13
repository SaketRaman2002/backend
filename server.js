const express = require('express')
const { exec } = require('child_process')
const app = express()
const fs = require('fs')
const multer = require('multer')
const bodyParser = require('body-parser')
server = require('http').createServer(app)

var upload= multer()
app.use(upload.array())
app.use(express.static('public'))

global.extension = ''
global.content = ''
global.answer = ''


// app.use(bodyParser.json())
server.listen('3000')

console.log('Server Started')

// app.get('/saket',async(req,res)=>{
//     console.log('s')
//     res.status('200').send({name :'saket'})
// })
app.post('/login', async (req, res) => {
    let x = req.body.fileType
    let y = req.body.code
    extension = x
    content = y
    console.log(req.body)

    console.log(x)
    console.log(y)


    fileCreation()
    fileExecute()

    console.log(answer)

    res.status('200').send(answer)

})

const fileStorage = multer.diskStorage({
    // Destination to store image     
    destination: 'files', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
            // file.fieldname is name of the field (image)
            // path.extname get the uploaded file extension
    }
});


async function fileCreation() {
    console.log(extension)
    let p = "temp"+extension
    fs.writeFile(p, content, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    })
}


async function fileExecute() {
    
    exec('g++ -o a test.cpp', (err, output) => {
        console.log(answer)

        if (err) {
            // log and return if we encounter an error
            console.error("could not execute command: ", err)
            return
        }
       answer=output
        console.log("Output: \n", output)
    })
}




