$(document).ready(function(){

    let socket = io();

    let messageBox = document.getElementById('messages');

    let textarea = document.getElementById('message');

    let status = document.getElementById('status');
    
    //console.log(messageBox);
    
    messageBox.scrollTop = messageBox.scrollHeight;

    let noMessagesYet = true;


    socket.on('status' , (data) => {
        status.innerText = data.status;
    });

    socket.on('messageToClient' , (data) => {
        //console.log(data);

        let newMessage = `
        <div class="left">
            <span>${data.message}</span>
        </div>
        `;

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

