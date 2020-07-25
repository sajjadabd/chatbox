$(document).ready(function(){

    let socket = io();

    //let username = document.getElementById('username').innerText.trim();

    socket.emit('new-user', { room : room } );

    let messageBox = document.getElementById('messages');

    let textarea = document.getElementById('message');

    let status = document.getElementById('status');

    let numberOfUsers = document.getElementById('numberOfUsers');

    let mute = document.getElementById('mute');

    let send = new Audio('./audio/send.mp3');
    let recieve = new Audio('./audio/recieve.mp3');

    let searchInput = document.getElementById('search');


    let alreadySearched = false;
    searchInput.addEventListener('keyup' , (e) => {
        //console.log(e.target.value);

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
    });


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
        
        /*
        let searchResult = ``;

        data.map( (value) => {
            searchResult += `
            <div class="contact" data-user="${value.username}">
                <div>${value.username}</div>
                <div class=""><span></span></div>
            </div>
            `
            ;
        });

        $('#contacts').append(searchResult);

        */
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

        //console.log(index);
        //console.log(contacts[index]);

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

        noMessagesYet = false;


        /*
            close contacts on 500px
        */
        if ( $(document).width() < 500 ) {
            toggleSearch($('#nav-icon4'));
        }

        $('#search').val('');

        //$('div.contact').addClass('active');
        //console.log($(this));
        //$(this).addClass('activeContact');
        //$(this).css('background-color', 'dodgerblue');
        //$(this).css('color', 'white');
        
    });



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
        console.log(data);
        if( data.numberOfUsers > 1 ) {
            numberOfUsers.innerText = `${data.numberOfUsers} users`;
        } else {
            numberOfUsers.innerText = `${data.numberOfUsers} user`;
        }
    });
    
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
                <div>${value.username}</div>
                <div class="${value.counter > 0 ? `counter` : ``}">
                <span>
                ${value.counter > 0 ? value.counter : ``}
                </span>
                </div>
            </div>
            `;

        });

        $('#contacts').html(contactsList);
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
    
    
    textarea.addEventListener('keyup' , (e) => {
        //console.log(e);
    
        if( e.keyCode == 13 && e.shiftKey == false ) {
    
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

            }
        }
    });







    open = false;

	$('#nav-icon4').click(function(){
		
		toggleSearch($('#nav-icon4'));
		
    });

    toggleSearch = (el) => {
        el.toggleClass('open');

        if(open == false) {
			$('div.mainBox').css('grid-template-columns' , '0px 6fr');
			$('div.text').hide();
            $('div.users').show();
            updateContactList();
            resetTotalCounter();
		} else {
			$('div.mainBox').css('grid-template-columns' , '6fr 0px');
			$('div.text').show();
			$('div.users').hide();
		}

		open = !open;
    }
    

});

