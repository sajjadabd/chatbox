let inputbox = document.querySelectorAll('div.inputbox');

let input = document.querySelectorAll('input');

let placeholder = document.querySelectorAll('div.placeholder');

for(let i=0;i<inputbox.length;i++) {
	inputbox[i].addEventListener('click' , () => {
		input[i].focus();
		placeholder[i].classList.add("littleholder");
	});
}

for(let i=0;i<input.length;i++) {
	input[i].addEventListener( "blur" , () => {
		if( input[i].value == '' ) {
			placeholder[i].classList.remove("littleholder");
		}   
	});

	input[i].addEventListener( "keyup" , () => {
		//console.log(email.value);
		if( input[i].value == '' ) {
			placeholder[i].classList.remove("littleholder");
		} else {
			placeholder[i].classList.add("littleholder");
		}
	});
}
