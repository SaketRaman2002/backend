const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const MongoClient = require('mongodb').MongoClient;
const { Server } = require('http');
const uri = "mongodb+srv://user:FD8TjL0CCmzL8ksN@cluster0.91ru3.mongodb.net/user_id?retryWrites=true&w=majority";
const client = new MongoClient(uri,{
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
});
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   console.log(collection);
//   client.close();
// });
const JWT_SECRET="addjsonwebtokensecretherelikeQuiscustodietipsoscustodes"
var stream = fs.createWriteStream("myfile.txt");

// stream.once('open', (fd) => {
//     stream.write("First line\n");
//     stream.write("Second line\n");

//     // Important to close the stream when you're ready
//     stream.end();
// });

global_res = null;
async function main(client){

    try {
        await client.connect();
        await listDatabases(client);
        //await addUser({name:"aniket",password:"password"}, client);
        //await checkUser("aniket","password", client);
    } catch (error) {
        console.log(error)
    }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

async function addUser(user, client){
    try {
        const payload = { user: user.phone.trim() };
        await client.db().collection('users').insertOne(user);
        const options = { expiresIn: '3600000s', issuer: 'https://scotch.io' };
        const token = jwt.sign(payload,JWT_SECRET,options);
        return token;
    } catch (error) {
        console.log(error)
    }
    // data = await client.db().collection('users').find({}).toArray();
    // console.log(data);
}

async function allUsers(user, client) {
    try{
        res = await client.db().collection('users').find({ phone: { $nin: [user]}}, {projection: {_id: 0, phone: 1, name: 1}}).toArray();
        console.log(res);
        return res;
    }
    catch(err){console.log(err)}
}

async function checkUser(user, client){
    user_found = await client.db().collection('users').findOne({phone: user.phone.trim()});
    if(!user_found){
        console.log("Wrong username");
        return;
    }
    if(await bcrypt.compare(user.password,user_found.password)){
        const payload = { user: user.phone.trim() };
        console.log("Successfull");
        const options = { expiresIn: '3600000s', issuer: 'https://scotch.io' };
        const token = jwt.sign(payload,JWT_SECRET,options);
        return token;
    }
    console.log("Wrong password")
}

app.use(express.json())

app.post('/users', async (req,res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { phone: req.body.phone, name: req.body.name, password: hashedPassword }
        // users.push(user)
        console.log(user);
        const token = await addUser(user,client)
        res.status(201).send({token: token});
    }
    catch{
        res.status(500).send()
    }
})
app.get('/allUsers', async (req, res) => {
    const token = req.headers.authorization
    console.log(token)
    const options = { expiresIn: '3600000s', issuer: 'https://scotch.io' };
    const result = jwt.verify(token,JWT_SECRET,options);
    console.log(result.user)
    users = await allUsers(result.user, client)
    res.status(200).send({users: users})
})
main(client).catch(console.error);
app.post('/users/login', async (req,res) => {
    const user = { phone: req.body.phone, password: req.body.password }
    console.log(user)
    const token = await checkUser(user,client)
    console.log(token)
    res.status(200).send({token: token});
    // const user = users.find(user => user.name == req.body.name)
    // if(user == null){
    //     return res.status(400).send("User does not exist")
    // }
    // try {
    //     if(await bcrypt.compare(req.body.password, user.password)){
    //         res.send('Signed In')
    //     }
    //     else{
    //         res.send("Incorrect Password")
    //     }
    // } catch {
    //     res.status(500).send()
    // }
})

app.get('/username',async(req, res) => {
    const token = req.headers.authorization
    console.log(token)
    const options = { expiresIn: '36000s', issuer: 'https://scotch.io' };
    const result = jwt.verify(token,JWT_SECRET,options);
    console.log(result.user)
    res.status(200).send({name:result.user})
})

app.post('/register', async(req, res) => {
    const token = req.headers.authorization
    const options = { expiresIn: '36000s', issuer: 'https://scotch.io' };
    const result = jwt.verify(token,JWT_SECRET,options);
    const userdata = { name:result.user, firstName: req.body.firstName, lastName: req.body.lastName, gender: req.body.gender, dateOfBirth: req.body.dateOfBirth, phoneNumber: req.body.phoneNumber }
    console.log(userdata)
    await client.db().collection('usersData').insertOne(userdata);
    res.status(200).send();
})

app.get('/profile', async(req, res) => {
    const token = req.headers.authorization
    const options = { expiresIn: '36000s', issuer: 'https://scotch.io' };
    const result = jwt.verify(token,JWT_SECRET,options);
    user_found_data = await client.db().collection('usersData').findOne({name: result.user });
    res.status(200).send(user_found_data);
})

// app.post('/sender', async(req, res) => {
//     req.body.message.push("Hii");
//     forwardMessage(req.body.message);
//     //res.status(200).send({status: "Success"})
// })

// function forwardMessage(message){
//     console.log(message)
//     global_res.status(200).send({message: message})
// }

// app.get('/reciver', async(req, res) => {
//     console.log("Yo")
//     global_res = res;
//     //res.status(200).send({message: ["Hey"]});
// })

server.listen(3000)


// io.on('connection', socket => {
//     console.log("Joined")
//     const id = String(socket.handshake.query.email)
//     console.log(id)
//     socket.join(id);
//     socket.on('username', username => {
//         console.log(username)
//         socket.username = username;
//         console.log(id)
//         socket.in(id).emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
//     });

//     socket.on('disconnect', function(username) {
//         io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
//     })

//     socket.on('chat_message', function(message) {
//         io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
//     });

// });
