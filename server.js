//import libs
const io = require("socket.io")(8000, {cors: {origin: '*'}});
const { MongoClient } = require('mongodb');
const uri = "MONGODB CONNECTION LINK";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
const { v4: uuid } = require('uuid');
require("pidcrypt/seedrandom");
const pidCrypt = require("pidcrypt");
require("pidcrypt/aes_cbc");
const aes = new pidCrypt.AES.CBC();
const nodemailer = require('nodemailer');
const verCode = require("generate-sms-verification-code");
const fs = require('fs');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'EMAIL',
        pass: 'PASSWORD',
    },
});
//connect to mongodb
client.connect(err => {
    if (err) {
        console.log('Connection error: ', err);
        throw err;
    }
    else{
        console.log('Connected to the RNotes DB');
    }
    function insertOne(collection, data){
        try {
            collection.insertOne(data);
        } catch (error) {
            console.log(error);
        }
    }

    const db = client.db('rnotesdb');
    const users = db.collection('users');
    const keys = db.collection('keys');
    //client connection
    io.on('connection', (socket) => {
        //check uid
        socket.on('uid', (uid) => {
            users.findOne({uid: uid}, (err, user) => {
                if(user){
                    //send first name and last name
                    socket.emit('uidRes', `${user.firstName} ${user.lastName}`);
                    if(fs.existsSync(`./.usernotesdb/${uid}.txt`)){
                        //send saved notes
                        socket.emit('notes', JSON.parse(fs.readFileSync(`./.usernotesdb/${uid}.txt`)));
                    }
                }
            });
        });
        //handle new notes array
        socket.on('notes', notes => {
            fs.writeFileSync(`./.usernotesdb/${notes.uid}.txt`, JSON.stringify(notes.notes));
        });
        //delete note
        socket.on('delete', note => {
            let updatedNotes = JSON.parse(fs.readFileSync(`./.usernotesdb/${note.uid}.txt`));
            updatedNotes.splice(note.index, 1)
            fs.writeFileSync(`./.usernotesdb/${note.uid}.txt`, JSON.stringify(updatedNotes));
            socket.emit('notes', updatedNotes);
        });

        //handle login request
        socket.on('loginReq', userdata => {
            users.findOne({email: userdata.email}, data => {
                if(data){
                    keys.findOne({email: userdata.email}, key => {
                        if(userdata.password == aes.decryptText(data.password, key.key)){
                            socket.emit('loginRes', {body: 'success', uid: data.uid});
                        }
                        else{
                            socket.emit('loginRes', {body: 'passwordError'});
                        }
                    });
                }
                else{
                    socket.emit('loginRes', {body: 'emailError'});
                }
            });
        });

        //handle signup request
        socket.on('signUpReq', userdata => {
            let uid = uuid();
            let key = uuid();
            users.findOne({email: userdata.email}, data => {
                if(!data){
                    //send verification code
                    let verificationCode = verCode(5);
                    let sendVerificationCode = transporter.sendMail({
                        from: 'RNotes',
                        to: userdata.email,
                        subject: 'Verification code from RNotes',
                        text: '',
                        html: '<h3>Your verification code is:</h3><br/><br/><h1>'+String(verificationCode)+'</h1>',
                    });
                    console.log(sendVerificationCode);
                    socket.emit('checkVerificationCode');
                    socket.on('verificationCode', (code) => {
                        if(code == verificationCode){
                            //write user to the db
                            let encPassword = aes.encryptText(userdata.password, key);
                            insertOne(keys, {email: userdata.email, key: key});
                            insertOne(users, {email: userdata.email, firstName: userdata.firstName, lastName: userdata.lastName, password: encPassword, uid: uid});
                            socket.emit('signUpRes', {body: 'success', uid: uid, firstName: userdata.firstName, lastName: userdata.lastName});
                        }
                        else{
                            socket.emit('signUpRes', {body: 'verificationCodeError'});
                        }
                    });
                }
                else{
                    socket.emit('signUpRes', {body: 'emailError'});
                }
            });
        });
    });

});