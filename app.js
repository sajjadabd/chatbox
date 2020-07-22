const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;

const app = express();

app.use(express.static(path.join(__dirname,'public')));


users = [];

const server = app.listen(port , () => {
    console.log(`listening at port ${port}`);
});


const io = require('socket.io')(server);

io.on('connection' , (socket) => {
    console.log(`user connected with id : ${socket.id}`);

    users.push(socket.id);
    console.log(users.length);


    io.emit('numberOfUsers' , { numberOfUsers : users.length });

    socket.emit('status' , { status : 'connected' });

    socket.on('messageToServer' , (data) => {
        //console.log(data);
        socket.broadcast.emit('messageToClient' , { message : data.message , id : socket.id});
    });


    socket.on('disconnect' , () => {
        users = users.filter( (value) => {
            return value != socket.id;
        });

        io.emit('numberOfUsers' , { numberOfUsers : users.length });
    });
    
});