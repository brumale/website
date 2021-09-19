'use strict';

document.documentElement.className = 'js';

document.addEventListener( 'DOMContentLoaded', function() {
	
	setTimeout( function() {
		
		document.documentElement.className += ' ready';
	
	}, 10 );
	
	var slider = document.querySelector( '.slider' ),
		slidescount = slider.dataset.slides - 1,
		translator = slider.firstElementChild.firstElementChild,
		slide = 0;
	
	slider.addEventListener( 'click', function() {
		
		if ( slide == slidescount ) {
			
			slide = 0;
			
		}
		else {
			
			slide++;
			
		}
		
		if ( slide == slidescount ) {
			
			slider.className += ' end';
			
		}
		else if ( ! slide ) {
			
			slider.className = slider.className.replace( ' end', '' );
			
		}
							
		translator.style.transform = 'translateX(-' + slide + '00%)';
		
	} );
	
} );

window.addEventListener( 'load', function() {
	
	document.documentElement.className += ' loaded';
	
} );