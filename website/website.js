'use strict';

function delay( then, item, time ) {
				
	setTimeout( function() {
		
		then( item );
				
	}, time );
	
}

function write( item, text ) {
		
	for ( var index = 0; index < text.length; index++ ) {
			
		delay( function( index ) {
												
			item.textContent += text.charAt( index );
			
			if ( index == text.length - 1 ) {
													
				item.style.minHeight = null;
				
			}
			
		}, index, index * 40 );

	}
	
}

function offawaiting() {
	
	window.removeEventListener( 'scroll', handleawaiting );
	
	window.removeEventListener( 'load', handleawaiting );
	
	window.removeEventListener( 'resize', handleawaiting );
	
}

function revealawaiting() {
		
	var toreveal = [],
		toreveallength,
		item,
		wintop,
		itemtop,
		itemheight,
		itemfraction;
	
	for ( var index = awaiting.length - 1; index >= 0; index-- ) {
								
		item = awaiting[ index ],
		wintop = Math.max( 0, window.pageYOffset ),
		itemtop = item.getBoundingClientRect().top + wintop,
		itemheight = item.offsetHeight,
		itemfraction = itemheight / 4;
				
		if ( itemtop + itemfraction < wintop + window.innerHeight && itemtop + itemheight - itemfraction > wintop ) {
			
			toreveal.push( item );
			
			awaiting.splice( index, 1 );

		}

	}
	
	toreveallength = toreveal.length;
	
	if ( toreveallength ) {
		
		toreveal.reverse();
		
		for ( var index = 0; index < toreveallength; index++ ) {
			
			delay( function( awaiting ) {
				
				awaiting.classList.remove( 'awaiting' );
									
				if ( awaiting.classList.contains( 'typing' ) ) {
					
					setTimeout( function() {
						
						write( awaiting, awaiting.dataset.text );
						
					}, 500 );

				}
				else if ( awaiting.classList.contains( 'slider' ) ) {
					
					setTimeout( skip, 1000 );
					
				}
				
			}, toreveal[ index ], index * 300 );
			
		}
	
	}

	if ( ! awaiting.length ) {
				
		offawaiting();
		
	}
	
}

function handleawaiting() {
		
	if ( revealtime ) {
				
		window.cancelAnimationFrame( revealtime );
		
	}
	
	revealtime = window.requestAnimationFrame( revealawaiting );
		
}

function checkawaiting() {
	
	window.addEventListener( 'scroll', handleawaiting );

	window.addEventListener( 'load', handleawaiting );

	window.addEventListener( 'resize', handleawaiting );
		
	revealawaiting();
		
}

var awaiting,
	revealtime;

document.addEventListener( 'DOMContentLoaded', function() {
	
	awaiting = Array.from( document.querySelectorAll( '.awaiting' ) );

	setTimeout( function() {
		
		document.documentElement.classList.add( 'ready' );
		
		checkawaiting();
		
	}, 10 );
		
	var products = document.querySelector( '.products' );

	if ( products ) {
		
		var request = new XMLHttpRequest(),
			x,
			y,
			ry,
			rx;

		request.onload = function() {
			
			setTimeout( function() {
				
				products.innerHTML = request.responseText;

				awaiting = awaiting.concat( Array.from( products.children ) );
						
				offawaiting();
				
				checkawaiting();
								
				products
				.querySelectorAll( 'div' )
				.forEach( function( item ) {
					
					var parent = item.parentNode;
							
					parent.addEventListener( 'mousemove', function( event ) {
						
						x = Math.max( 0, window.pageXOffset ) + event.clientX - parent.offsetLeft;
						y = Math.max( 0, window.pageYOffset ) + event.clientY - parent.offsetTop;
						ry = - ( parent.offsetWidth / 2 - x ) / 33,
						rx = ( parent.offsetHeight / 2 - y ) / 33;
								  
						item.style.transform = 'rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
					
					} );
					
					parent.addEventListener( 'mouseleave', function () {
					
						item.style.transform = 'rotateY(0) rotateX(0)';
					
					} );
						
				} );
			
			}, 10 );
			
		};
		
		request.open( 'GET', '/website/products.html' );
		
		request.send();
		
	}
	
	document
	.querySelectorAll( '.typing' )
	.forEach( function( item ) {
				
		item.style.minHeight = item.offsetHeight + 'px';
		
		item.dataset.text = item.textContent;
					
		item.textContent = '';
			
	} );
	
} );

window.addEventListener( 'load', function() {
	
	document.documentElement.classList.add( 'loaded' );
	
} );