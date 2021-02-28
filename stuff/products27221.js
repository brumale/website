'use strict';

document.addEventListener( 'DOMContentLoaded', function() {
	
	var after = document.querySelector( '.home' ),
		x,
		y,
		ry,
		rx;
	
	if ( ! after ) {
		
		after = document.querySelector( '.slider + .content' );
	
	}	
	
	if ( after ) {
		
		var request = new XMLHttpRequest();
		
		request.onreadystatechange = function() {
		
			if ( request.readyState === 4 ) {
				
				after.insertAdjacentHTML( 'afterEnd', request.responseText );
				
				document
				.querySelectorAll( '.products img' )
				.forEach( function( item ) {
					
					var parent = item.parentNode;
							
					parent.addEventListener( 'mousemove', function( event ) {
						
						x = Math.max( 0, window.pageXOffset ) + event.clientX - parent.offsetLeft;
						y = Math.max( 0, window.pageYOffset ) + event.clientY - parent.offsetTop;
						ry = - ( parent.offsetWidth / 2 - x ) / 40,
						rx = ( parent.offsetHeight / 2 - y ) / 40;
								  
						item.style.transform = 'rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
					
					} );
					
					parent.addEventListener( 'mouseleave', function () {
					
						item.style.transform = 'rotateY(0) rotateX(0)';
					
					} );
						
				} );
				
			}
		
		};
		
		request.open( 'GET', '/stuff/products.html' );
		
		request.send();
		
	}
	
} );