$(document).ready(function(){
    let messageBox = document.getElementById('messages');

    let textarea = document.getElementById('message');
    
    //console.log(messageBox);
    
    messageBox.scrollTop = messageBox.scrollHeight;

    let noMessagesYet = true;
    
    
    textarea.addEventListener('keyup' , (e) => {
        //console.log(e);
    
        if( e.keyCode == 13 && e.shiftKey == false ) {
    
            let value = message.value.trim();
            
            if(value == '' ) {

            } else {
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

