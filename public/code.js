$(document).ready(function(){

    let socket = io();

    socket.emit('new-user', { room : room } );

    let messageBox = document.getElementById('messages');

    let textarea = document.getElementById('message');

    let status = document.getElementById('status');

    let sendIcon = document.getElementById('sendIcon');

    //let numberOfUsers = document.getElementById('numberOfUsers');

    let mute = document.getElementById('mute');

    let send = new Audio('./audio/send.mp3');
    let recieve = new Audio('./audio/recieve.mp3');


    sendIcon.addEventListener('click' , () => {
        sendMessage();
    });

    let searchInput = document.getElementById('search');

    let searchLowRes = document.getElementById('searchLowRes');


    let alreadySearched = false;
    searchInput.addEventListener('keyup' , (e) => {
        doTheSearchJob(e);
    });

    searchLowRes.addEventListener('keyup' , (e) => {
        doTheSearchJob(e);
    });


    doTheSearchJob = (e) => {
        if(alreadySearched == false) {
            setTimeout( ()=> {
                socket.emit('searchUsers' ,  {
                    username : room ,
                    searchInput : e.target.value
                });
                alreadySearched = false;
            } , 1000);
        }
        
        alreadySearched = true;
    }

    socket.on('searchResults' , (data) => {

        if(data[0] == null) {
            return;
        }

        console.log(data[0]);

        let result = contacts.findIndex( (value) => {
            return value.username == data[0].username;
        });

        console.log(result);

        if(result < 0) {
            contacts.push({ 
                username : data[0].username, 
                messages : []
            });

            toUser = $('#toUser').text();
            updateContactList(toUser);
            
        } else {
            
        }

        console.log(contacts);
        
    });

    let muteSound = false;

    let toUser = '';

    $(document).on('click' , 'div.contact', function() {

        console.log('click');
        toUser = $(this).attr('data-user');
        console.log(toUser);
        $('#toUser').text(toUser);

        let fetchMessages = ``;

        let index = contacts.findIndex( (value) => {
            return toUser == value.username;
        });


        if( contacts[index] == undefined ) {
            $('#messages').html(fetchMessages);
            return;
        }

        console.log(contacts);

        contacts[index].counter = 0;

        
        updateContactList(toUser);


        contacts[index].messages.map( (value) => {
            if(value.source == 'to') {
                fetchMessages += `
                <div class="right">
                    <span>${value.value}</span>
                </div>
                `;
            } else {
                fetchMessages += `
                <div class="left">
                    <span>${value.value}</span>
                </div>
                `;
            }
        });

        $('#messages').html(fetchMessages);

        messageBox.scrollTop = messageBox.scrollHeight;

        noMessagesYet = false;

        $('#search').val('');
        updateTotalCounter();
        
    });



    mute.addEventListener('change' , (e) => {
        muteSound = e.target.checked;
    });
    
    
    messageBox.scrollTop = messageBox.scrollHeight;

    let noMessagesYet = true;


    socket.on('status' , (data) => {
        status.innerText = data.status;
    });

    /*
    socket.on('numberOfUsers' , (data) => {
        console.log(data);
        if( data.numberOfUsers > 1 ) {
            numberOfUsers.innerText = `${data.numberOfUsers} users`;
        } else {
            numberOfUsers.innerText = `${data.numberOfUsers} user`;
        }
    });
    */

    let contacts = [];


    resetTotalCounter = () => {
        let totalCounter = 0;
        if ( totalCounter > 0 ) {
            $('#totalCounter').addClass('totalCounter');
            $('#totalCounter').first().html(totalCounter);
        } else {
            $('#totalCounter').removeClass('totalCounter');
            $('#totalCounter').first().html('');
        }
    }

    updateTotalCounter = () => {
        let totalCounter = 0;

        contacts.map( (value , index) => {
            totalCounter += value.counter;
        });

        if ( totalCounter > 0 ) {
            $('#totalCounter').addClass('totalCounter');
            $('#totalCounter').first().html(totalCounter);
        } else {
            $('#totalCounter').removeClass('totalCounter');
            $('#totalCounter').first().html('');
        }
    }

    updateContactList = (toUser) => {
        let contactsList = ``;
        
        
        contacts.map( (value , index) => {
            contactsList += `
            <div class="contact ${value.username == toUser ? `activeContact` : ``}" data-user="${value.username}">
                <div class="avatar">
                    <i class="fa fa-user-circle" aria-hidden="true"></i>
                </div>
                <div class="userInfo">
                    <div class="contactUsername">${value.username}</div>
                    <div class="lastMessage">
                    <span>
                    ${ value.messages.length > 0 ? (value.messages[value.messages.length-1].source  == 'to' ? 'You: ' : '') : '' }
                    </span>
                    ${ value.messages.length > 0 ? value.messages[value.messages.length-1].value : ''}
                    </div>
                </div>
                <div class="${value.counter > 0 ? `counter` : ``}">
                    <span>
                        ${value.counter > 0 ? value.counter : ``}
                    </span>
                </div>
            </div>
            `;

        });

        $('#contacts').html(contactsList);
        $('#contactsLowRes').html(contactsList);
    }

    addToMessages = (data) => {
        let result = contacts.findIndex( (value, index) => {
            return value.username == data.username;
        });

        if(result < 0) {
            contacts.push({ 
                username : data.username, 
                counter : 1,
                messages : [{ value : data.message , source : data.source }]
            });
        } else {
            let oldMessages = contacts[result].messages;

            if($('#toUser').text() == data.username) { 

            } else {
                contacts[result].counter += data.increment;
            }
            
            contacts[result].messages = oldMessages.concat([
                { value : data.message , source : data.source }
            ]);
        }

        console.log(contacts);
    }


    socket.on('messageToClient' , (data) => {
        console.log(data);

        addToMessages({ 
            username : data.username , 
            message : data.message , 
            source : 'from',
            increment : 1,
        });

        let newMessage = `
        <div class="left">
            <span>${data.message}</span>
        </div>
        `;

        try {
            if(!muteSound) {
                recieve.play();
            }
        } catch(e) {

        }
        
        if ( $(document).width() < 500 ) {
            updateTotalCounter();
            updateContactList($('#toUser').text());
        } else {
            updateContactList($('#toUser').text());
        }


        
        if($('#toUser').text() == data.username) { 
            if( noMessagesYet == true ) {
                $('#messages').html(newMessage);
                noMessagesYet = false;
            } else {
                $('#messages').append(newMessage);
            }
        }

        messageBox.scrollTop = messageBox.scrollHeight;

        
    });


    $('#search').on('click' , function() {
        $(this).removeClass('danger');
    });

    
    sendMessage = () => {
        let value = message.value.trim();

        let toUser = $('#toUser').text().trim();
        
        if( value == '' ) {
            message.value = '';
        } else if ( toUser == '...' ) {
            $('#search').addClass('danger');
            message.value = '';
        } else {

            addToMessages({ 
                username : toUser , 
                message : value , 
                source : 'to',
                increment : 0,
            });

            socket.emit('messageToServer' , { room : toUser , username : room , message : value });

            let newMessage = `
            <div class="right">
                <span>${value}</span>
            </div>
            `;

            try {
                if(!muteSound) {
                    send.play();
                }
            } catch(e) {

            }
            
            
            if( noMessagesYet == true ) {
                $('#messages').html(newMessage);
                noMessagesYet = false;
            } else {
                $('#messages').append(newMessage);
            }
            

            message.value = '';
            messageBox.scrollTop = messageBox.scrollHeight;

            if ( $(document).width() < 500 ) {
                updateTotalCounter();
                updateContactList($('#toUser').text());
            } else {
                updateContactList($('#toUser').text());
            }

        }
    }
    

    textarea.addEventListener('keyup' , (e) => {
    
        if( e.keyCode == 13 && e.shiftKey == false ) {
            
            sendMessage();
            
        }
    });

    let usersForLowRes = document.getElementById('usersForLowRes');
    let mask = document.getElementById('mask');
    let contactsLowRes = document.getElementById('contactsLowRes');

    contactsLowRes.addEventListener('click' , () => {
        toggleSearch($('#nav-icon4'), true);
    });

    mask.addEventListener('click' , () => {
        toggleSearch($('#nav-icon4'), true);
    });

    open = false;

	$('#nav-icon4').click( function(){
		toggleSearch($('#nav-icon4'), true);
    });

    toggleSearch = (el, toggleClassOrNot) => {
        el.toggleClass('open');
        toggleLowResContacts();
    }

    toggleLowResContacts = () => {
        if( open == false ) {
            usersForLowRes.style.display = 'block';
            mask.style.display = 'block';
        } else {
            usersForLowRes.style.display = 'none';
            mask.style.display = 'none';
        }

        open = !open;
    }

});

