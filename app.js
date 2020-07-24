const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended : true }));

const server = app.listen(port , () => {
    console.log(`listening at port ${port}`);
});


const io = require('socket.io')(server);



let users = [];


app.get('/' , (req,res) => {
    res.render('login');
});

thereIsSuchUser = (username) => {
    let result = users.findIndex( (value,index) => {
        return username == value.username;
    })
    console.log(result);
    if( result >= 0 ) {
        return true;
    } else {
        return false;
    }
}

app.post('/enter' , (req,res) => {
    //console.log(req.body);
    //res.json({ username : req.body.username });
    if(thereIsSuchUser(req.body.username)){
        res.redirect('/');
    } else {
        //users.push( req.body.username );
        //console.log(users);
        res.redirect(req.body.username);
    }

});


app.get('/:user' , (req,res) => {

    if(req.params.user == 'socket.io.js.map') {
        return;
    }

    res.render('user' , { username : req.params.user });
    //console.log(req.params);
});



io.on('connection' , (socket) => {

    //console.log(`user connected with id : ${socket.id}`);
    
    socket.on('new-user' , (data) => {
        socket.join(data.room);
        console.log(data);
        users.push( { id : socket.id , username : data.room } );
        console.log(users);
        io.emit('numberOfUsers' , { numberOfUsers : users.length } );
        socket.emit('status' , { status : 'connected' });
    })

    
    

    socket.on('messageToServer' , (data) => {
        //console.log(data);
        socket.to(data.room).broadcast.emit('messageToClient' , 
            { message : data.message , id : socket.id , username : data.username });
    });



    socket.on('disconnect' , () => {
        users = users.filter( (value) => {
            return value.id != socket.id;
        });

        console.log(users);
        io.emit('numberOfUsers' , { numberOfUsers : users.length });
        socket.emit('status' , { status : 'disconnected' });
    });

    socket.on('searchUsers' , (data) => {
        //console.log(value);
        let result = users.filter( (value) => {
            return value.username == data.searchInput && 
            value.username != data.username;
        });

        socket.emit('searchResults' , result );
    });
    
});

