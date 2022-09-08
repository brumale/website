'use strict';

function skip() {
		
	if ( slide == slides ) {
		
		slide = 0;
		
	}
	else {
		
		slide++;
		
	}
	
	if ( slide == slides ) {
		
		slider.classList.add( 'end' );
		
	}
	else if ( ! slide ) {
		
		slider.classList.remove( 'end' );
		
	}
						
	translator.style.transform = 'translateX(-' + slide + '00%)';
	
	clearTimeout( slidertime );
	
	slidertime = setTimeout( skip, 10000 );
	
}

var slide = 0,
	slider,
	slides,
	translator,
	slidertime;

document.addEventListener( 'DOMContentLoaded', function() {
	
	function writetype( family, text, noreset ) {
		
		type.style.fontFamily = family || null;
			
		type.textContent = '';
			
		write( type, text || font );
				
		if ( ! noreset ) {
									
			setTimeout( function() {
				
				loading = false;
				
			}, 40 * ( text || font ).length );
		
		}
		
	}
	
	function loadfont() {
		
		loading = true;
		
		var isitalic = italic.classList.contains( 'isitalic' ),
			currentfont = font + '-';
		
		if ( ! isitalic || style.textContent != 'Regular' ) {
		
			currentfont += style.textContent.replaceAll( ' ', '' );
		
		}
				
		if ( ! isitalic && currentfont == font + '-Regular' ) {
			
			writetype();
						
			return;
			
		}

		if ( isitalic ) {
			
			currentfont += 'Italic';
			
		}
						
		if ( loadedfonts.indexOf( currentfont ) > -1 ) {
			
			writetype( currentfont );
			
		}
		else {
						
			test.classList.add( 'loading' );
						
			type.classList.remove( 'font' );
			
			writetype( null, 'Loading', true );
						
			var fontload = new FontFace( currentfont, 'url(/website/fonts/' + currentfont  + '.woff2)' );
							
			fontload
			.load()
			.then( function() {
				
				document.fonts.add( fontload );
				
				loadedfonts.push( currentfont );
										
				setTimeout( function() {
										
					test.classList.remove( 'loading' );
										
					type.classList.add( 'font' );
					
					writetype( currentfont );
									
				}, 280 );
				
			} );
			
		}
		
	}
		
	var font = document.querySelector( 'header h1' ).textContent,
		test = document.querySelector( '.test' ),
		overlay = test.querySelector( '.overlay' ),
		style = test.querySelector( '.style' ),
		italic = test.querySelector( '.italic' ),
		type = test.querySelector( '.type' ),
		typewrap = type.parentNode,
		themes = test.querySelectorAll( '.theme div' ),
		currenttheme = themes[ 0 ],
		words = document.querySelector( '.language .font' ),
		loadedfonts = [],
		loading,
		nextword;
	
	slider = document.querySelector( '.slider' ),
	slides = slider.dataset.slides - 1,
	translator = slider.firstElementChild.firstElementChild;
	
	slider.addEventListener( 'click', skip );
	
	for ( var index = words.children.length; index >= 0; index-- ) {
				
		words.appendChild( words.children[ Math.random() * index | 0 ] );
	
	}
	
	nextword = words.children[ 0 ];
	
	nextword.classList.add( 'current' );

	if ( overlay ) {
		
		var currentstyle = overlay.querySelector( '.styles .current' );
		
		overlay.addEventListener( 'click', function( item ) {
				
			document.documentElement.classList.remove( 'overlayon' );
			
			var target = item.target;
	
			if ( target == currentstyle || ! target.parentNode.classList.contains( 'styles' ) ) {
								
				return;
			
			}
				
			currentstyle.classList.remove( 'current' );
			
			currentstyle = target;
			
			currentstyle.classList.add( 'current' );
			
			style.textContent = currentstyle.textContent;
			
			loadfont();
			
		} );
		
		style.addEventListener( 'click', function() {
			
			if ( ! loading ) {
			
				document.documentElement.classList.add( 'overlayon' );
			
			}
				
		} );
		
	}
		
	italic.addEventListener( 'click', function() {
		
		if ( ! loading ) {
			
			italic.classList.toggle( 'isitalic' )
		
			loadfont();
		
		}

	} );
	
	type.addEventListener( 'blur', function() {
		
		if ( ! type.textContent.trim() ) {
		
			writetype();
			
		}

	} );
	
	themes.forEach( function( item ) {

		item.addEventListener( 'click', function() {
			
			if ( loading || item == currenttheme ) {
				
				return;
				
			}
							
			currenttheme = item;
						
			typewrap.className = item.className;
					
		} );
		
	} );
	
	setInterval( function() {
				
		nextword.classList.remove( 'current' );
		
		nextword = nextword.nextElementSibling;
		
		if ( ! nextword ) {
			
			nextword = words.children[ 0 ];
			
		}
				
		nextword.classList.add( 'current' );
		
	}, 3000 );
	
} );