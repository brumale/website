'use strict';

document.documentElement.className = 'js';

document.addEventListener( 'DOMContentLoaded', function() {
	
	setTimeout( function() {
		
		document.documentElement.className += ' ready';
	
	}, 10 );
		
	document
	.querySelectorAll( '.slider' )
	.forEach( function( item ) {
				
		var slides = item.firstElementChild,
			slidescount = slides.dataset.slides,
			step = 100 / slidescount,
			slide = 1;
				
		item.addEventListener( 'click', function() {
			
			if ( slide == slidescount ) {
				
				slide = 1;
				
			}
			else {
				
				slide++;
				
			}
			
			if ( slide == slidescount ) {
				
				item.className += ' end';
				
			}
			else if ( slide == 1 ) {
				
				item.className = item.className.replace( ' end', '' );
				
			}
						
			slides.style.transform = 'translateX(-' + ( slide - 1 ) * step + '%)';
			
		} );
		
	} );
	
} );