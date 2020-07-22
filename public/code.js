$(document).ready(function(){

    let socket = io();

    let messageBox = document.getElementById('messages');

    let textarea = document.getElementById('message');

    let status = document.getElementById('status');

    let numberOfUsers = document.getElementById('numberOfUsers');

    let mute = document.getElementById('mute');

    let send = new Audio('./audio/send.mp3');
    let recieve = new Audio('./audio/recieve.mp3');

    let muteSound = false;

    mute.addEventListener('change' , (e) => {
        muteSound = e.target.checked;
    });
    
    //console.log(messageBox);
    
    messageBox.scrollTop = messageBox.scrollHeight;

    let noMessagesYet = true;


    socket.on('status' , (data) => {
        status.innerText = data.status;
    });

    socket.on('numberOfUsers' , (data) => {
        if( data.numberOfUsers > 1 ) {
            numberOfUsers.innerText = `${data.numberOfUsers} users`;
        } else {
            numberOfUsers.innerText = `${data.numberOfUsers} user`;
        }
    });

    socket.on('messageToClient' , (data) => {
        //console.log(data);

        let newMessage = `
        <div class="left">
            <span>${data.message}</span>
        </div>
        `;

        if(!muteSound) {
            recieve.play();
        }
        

        if( noMessagesYet == true ) {
            $('#messages').html(newMessage);
            noMessagesYet = false;
        } else {
            $('#messages').append(newMessage);
        }
        
        messageBox.scrollTop = messageBox.scrollHeight;
    });
    
    
    textarea.addEventListener('keyup' , (e) => {
        //console.log(e);
    
        if( e.keyCode == 13 && e.shiftKey == false ) {
    
            let value = message.value.trim();
            
            if(value == '' ) {

            } else {
                socket.emit('messageToServer' , { message : value });

                let newMessage = `
                <div class="right">
                    <span>${value}</span>
                </div>
                `;

                if(!muteSound) {
                    send.play();
                }
                
                if( noMessagesYet == true ) {
                    $('#messages').html(newMessage);
                    noMessagesYet = false;
                } else {
                    $('#messages').append(newMessage);
                }
                
        
                message.value = '';
                messageBox.scrollTop = messageBox.scrollHeight;

            }
            

        }
    });
});

