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
		itemfraction = itemheight / 4.25;
				
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
				
				if ( window.initApokalisAnimation ) {
					
					window.initApokalisAnimation();
					
				}
				
				offawaiting();
				
				awaiting = awaiting.concat( Array.from( products.children ) );

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
	
	handleawaiting();
	
} );

// Apokalis tile animation

window.initApokalisAnimation = function() {

const canvas = document.getElementById('gl');
if ( ! canvas || canvas.dataset.apokalisAnimation === 'ready' ) return;
canvas.dataset.apokalisAnimation = 'ready';
const glOptions = {
  antialias: true,
  alpha: false,
  premultipliedAlpha: false,
  powerPreference: 'high-performance'
};
const gl = canvas.getContext('webgl', glOptions) || canvas.getContext('experimental-webgl', glOptions);

if (!gl) throw new Error('WebGL not supported');

gl.disable(gl.DEPTH_TEST);
gl.disable(gl.CULL_FACE);
gl.disable(gl.BLEND);

const vertexSrc = `attribute vec2 position;
varying vec2 vUv;
void main(){
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;


const simFragmentSrc = `precision highp float;
varying vec2 vUv;
uniform sampler2D uPrev;
uniform vec2 uSimRes;
uniform float uTime;

mat2 rot(float a){
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}
float hash(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 4; i++){
    v += a * noise(p);
    p = rot(0.47) * p * 1.88 + vec2(2.7, 4.1);
    a *= 0.56;
  }
  return v;
}
float pulseWindow(float x, float a, float b, float blur){
  return smoothstep(a - blur, a, x) * (1.0 - smoothstep(b, b + blur, x));
}

void main(){
  vec2 uv = vUv;
  vec2 px = 1.0 / uSimRes;
  float t = uTime;
  vec2 p = (uv - 0.5) * vec2(uSimRes.x / uSimRes.y, 1.0);

  float l = texture2D(uPrev, uv - vec2(px.x, 0.0)).r;
  float r = texture2D(uPrev, uv + vec2(px.x, 0.0)).r;
  float b = texture2D(uPrev, uv - vec2(0.0, px.y)).r;
  float u = texture2D(uPrev, uv + vec2(0.0, px.y)).r;
  vec2 grad = vec2(r - l, u - b);

  float baseA = fbm(p * 1.55 + vec2(t * 0.040, -t * 0.026));
  float baseB = fbm(rot(0.7) * p * 2.45 + vec2(-t * 0.030, t * 0.045));
  vec2 flow = vec2(baseA - 0.5, baseB - 0.5) * 0.013 - grad * 0.040;

  float swirlPeriod = 79.0;
  float swirlIndex = floor(t / swirlPeriod);
  float swirlCycle = fract(t / swirlPeriod);
  float swirlChance = step(0.46, hash(vec2(swirlIndex, 701.3)));
  float swirlStart = mix(0.12, 0.72, hash(vec2(swirlIndex, 705.8)));
  float swirlSpan = mix(0.22, 0.42, hash(vec2(swirlIndex, 709.4)));
  float swirlLife = pulseWindow(swirlCycle, swirlStart, swirlStart + swirlSpan, 0.08) * swirlChance;
  vec2 swirlPos = vec2(
    mix(-0.58, 0.58, hash(vec2(swirlIndex, 714.1))),
    mix(-0.24, 0.24, hash(vec2(swirlIndex, 718.6)))
  );
  vec2 sr = p - swirlPos;
  vec2 swirl = vec2(-sr.y, sr.x) / (dot(sr, sr) + 0.08);
  flow += swirl * swirlLife * 0.010;

  float burstPeriod = 34.0;
  float burstIndex = floor(t / burstPeriod);
  float burstCycle = fract(t / burstPeriod);
  float burstChance = step(0.62, hash(vec2(burstIndex, 617.2)));
  float burstStart = mix(0.08, 0.86, hash(vec2(burstIndex, 621.7)));
  float burstSpan = mix(0.040, 0.085, hash(vec2(burstIndex, 626.4)));
  float burstLife = pulseWindow(burstCycle, burstStart, burstStart + burstSpan, 0.014) * burstChance;
  float burstLocal = clamp((burstCycle - burstStart) / max(0.001, burstSpan), 0.0, 1.0);
  vec2 burstBasePos = vec2(
    mix(-0.72, 0.72, hash(vec2(burstIndex, 631.8))),
    mix(-0.34, 0.34, hash(vec2(burstIndex, 636.1)))
  );
  vec2 burstDrift = vec2(
    sin(burstIndex * 1.37 + burstLocal * 6.4 + hash(vec2(burstIndex, 640.7)) * 6.2831853),
    cos(burstIndex * 1.81 - burstLocal * 5.2 + hash(vec2(burstIndex, 644.9)) * 6.2831853)
  ) * vec2(
    mix(0.02, 0.12, hash(vec2(burstIndex, 649.3))),
    mix(0.01, 0.08, hash(vec2(burstIndex, 653.6)))
  );
  vec2 burstPos = burstBasePos + burstDrift * smoothstep(0.06, 0.90, burstLocal);
  vec2 burstRel = p - burstPos;
  float burstAngle = hash(vec2(burstIndex, 657.2)) * 6.2831853;
  vec2 burstDomain = rot(burstAngle) * burstRel;
  float burstStretch = mix(0.78, 1.38, hash(vec2(burstIndex, 661.7)));
  burstDomain *= vec2(burstStretch, 1.0 / burstStretch);
  float burstFalloff = 1.0 - smoothstep(0.04, 0.82, length(burstDomain));
  float burstNoise = fbm(burstDomain * 6.2 + vec2(t * 0.26, -t * 0.18));
  float burst = burstLife * burstFalloff * smoothstep(0.22, 0.96, burstNoise);

  vec3 adv = texture2D(uPrev, uv - flow).rgb;

  float injection = fbm(p * 1.18 + vec2(t * 0.018, -t * 0.014));
  float wave = sin(dot(p, normalize(vec2(0.88, -0.34))) * 5.2 + t * 0.22 + adv.g * 1.4) * 0.5 + 0.5;
  float softSource = mix(injection, wave, 0.28);

  float newPressure = adv.r * 0.985 + softSource * 0.020 + burst * 0.48 + swirlLife * smoothstep(0.34, 0.0, length(sr)) * 0.08;
  float newCurlish = adv.g * 0.982 + (length(grad) * 4.5 + abs(baseA - baseB)) * 0.035 + burst * 0.38;
  float newMemory = adv.b * 0.992 + newPressure * 0.030 + newCurlish * 0.018;

  vec3 state = clamp(vec3(newPressure, newCurlish, newMemory), 0.0, 1.0);
  gl_FragColor = vec4(state, 1.0);
}
`;


const fragmentSrc = `precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform sampler2D uFluid;
mat2 rot(float a){
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}
float hash(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 5; i++){
    v += a * noise(p);
    p = rot(0.42) * p * 1.92 + vec2(3.7, 2.1);
    a *= 0.56;
  }
  return v;
}
vec3 palette(float t){
  vec3 c0 = vec3(0.0006, 0.0006, 0.0007);
  vec3 c1 = vec3(0.0038, 0.0038, 0.0042);
  vec3 c2 = vec3(0.0200, 0.0200, 0.0220);
  vec3 c3 = vec3(0.1750, 0.1750, 0.1800);
  vec3 c4 = vec3(0.0410, 0.0410, 0.0440);
  vec3 c5 = vec3(0.0860, 0.0860, 0.0910);
  vec3 col = mix(c0, c1, smoothstep(0.02, 0.26, t));
  col = mix(col, c2, smoothstep(0.15, 0.52, t) * 0.98);
  col = mix(col, c3, smoothstep(0.54, 0.92, t) * 0.54);
  col = mix(col, c4, smoothstep(0.58, 0.92, t) * 0.12);
  col = mix(col, c5, smoothstep(0.76, 0.995, t) * 0.18);
  return col;
}
float pulseWindow(float x, float a, float b, float blur){
  return smoothstep(a - blur, a, x) * (1.0 - smoothstep(b, b + blur, x));
}
float bandMask(float coord, float center, float width, float softness){
  float w = max(width, 0.0012);
  float edge = min(max(0.0006, w * softness), w * 0.72);
  return 1.0 - smoothstep(edge, w, abs(coord - center));
}
vec3 spectrum(float x){
  vec3 rgb = clamp(abs(fract(x + vec3(0.00, 0.67, 0.33)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
  rgb = rgb * rgb * (3.0 - 2.0 * rgb);
  rgb.g *= 0.34;
  float grey = dot(rgb, vec3(0.30, 0.59, 0.11));
  return mix(vec3(grey), rgb, 0.58);
}
float splashMask(vec2 p, vec2 pos, vec2 stretch, float size, float t, float seed){
  vec2 d = (p - pos) * stretch;
  float radial = pow(max(0.0, 1.0 - length(d) / size), 1.55);
  float ripple = sin(length(d) * (7.0 + seed * 0.18) - t * (0.58 + seed * 0.03) + seed) * 0.5 + 0.5;
  float smear  = sin(d.x * (2.6 + seed * 0.08) - d.y * (1.9 + seed * 0.06) + t * (0.36 + seed * 0.02)) * 0.5 + 0.5;
  return radial * (0.62 + 0.38 * smoothstep(0.42, 1.0, ripple)) * (0.68 + 0.32 * smoothstep(0.36, 1.0, smear));
}
float torchlightMask(vec2 p, vec2 origin, vec2 dir, float len, float spread, float t, float seed){
  vec2 axis = normalize(dir);
  vec2 perp = vec2(-axis.y, axis.x);
  vec2 rel = p - origin;
  float along = dot(rel, axis);
  float across = dot(rel, perp);
  float gate = smoothstep(-0.04, 0.14, along) * (1.0 - smoothstep(len * 0.88, len, along));
  float widthNear = spread * 0.14;
  float widthFar  = spread * 0.84;
  float coneWidth = mix(widthNear, widthFar, smoothstep(0.0, len, along));
  float cone = 1.0 - smoothstep(coneWidth * 0.82, coneWidth + 0.10, abs(across));
  float body = gate * cone;
  float hot = 1.0 - smoothstep(0.0, spread * 0.72, length(rel - axis * 0.18));
  float core = 1.0 - smoothstep(coneWidth * 0.18, coneWidth * 0.42, abs(across));
  float noiseA = fbm(rel * 1.0 + vec2(seed, -seed) + vec2(t * 0.05, -t * 0.03));
  float noiseB = fbm(rot(0.55) * rel * 1.55 + vec2(-seed * 1.4, seed * 0.8) + vec2(-t * 0.02, t * 0.04));
  float breakup = 0.76 + 0.24 * smoothstep(0.26, 0.96, noiseA * 0.58 + noiseB * 0.42);
  return body * breakup * (0.66 + 0.34 * core) + hot * 0.14;
}
float thunderboltMask(vec2 p, vec2 origin, vec2 dir, float len, float width, float seed, float branchReach, float branchDensity){
  vec2 axis = normalize(dir);
  vec2 perp = vec2(-axis.y, axis.x);
  vec2 rel = p - origin;
  float along = dot(rel, axis);
  float across = dot(rel, perp);
  float travel = clamp(along / max(len, 0.001), 0.0, 1.0);
  float live = smoothstep(-0.06, 0.04, along) * (1.0 - smoothstep(len * 0.98, len * 1.05, along));

  float bend = mix(0.030, 0.145, branchReach);
  float rough = mix(0.70, 1.45, branchDensity);
  float mainPath =
      sin(along * mix(2.7, 5.2, rough) + seed * 0.83) * bend * 0.78 +
      sin(along * mix(7.0, 13.0, rough) + seed * 1.71 + sin(along * 1.4 + seed)) * bend * 0.38 +
      sin(along * mix(15.0, 28.0, rough) + seed * 2.44) * bend * 0.13 +
      (noise(vec2(along * mix(2.2, 5.8, rough), seed * 0.19)) - 0.5) * bend * 0.30;
  mainPath *= smoothstep(0.0, 0.12, travel) * (1.0 - smoothstep(0.96, 1.0, travel));

  float mainWidth = width * mix(1.18, 0.34, smoothstep(0.0, 1.0, travel));
  float feather = max(0.0038, width * mix(0.42, 0.70, branchReach));
  float trunk = 1.0 - smoothstep(mainWidth, mainWidth + feather, abs(across - mainPath));
  trunk *= live;

  float splitA = smoothstep(0.08, 0.38, travel);
  float splitB = smoothstep(0.20, 0.62, travel);
  float splitC = smoothstep(0.42, 0.82, travel);
  float spread = mix(0.035, 0.240, branchReach);

  float branchWidth = width * mix(0.16, 0.58, branchDensity);
  float branchFeather = max(0.0032, width * 0.64);

  float branchGate1 = smoothstep(0.09, 0.16, travel) * (1.0 - smoothstep(mix(0.46, 0.95, branchReach), mix(0.58, 1.08, branchReach), travel));
  float branchPath1 = mainPath + spread * splitA + sin(along * 6.2 * rough + seed * 2.0) * bend * 0.36 + sin(along * 18.0 * rough + seed * 1.4) * bend * 0.09;
  float branch1 = 1.0 - smoothstep(branchWidth, branchWidth + branchFeather, abs(across - branchPath1));
  branch1 *= branchGate1;

  float branchGate2 = smoothstep(0.18, 0.28, travel) * (1.0 - smoothstep(mix(0.62, 1.00, branchReach), 1.12, travel));
  float branchPath2 = mainPath - spread * 0.84 * splitB + sin(along * 7.4 * rough + seed * 3.1) * bend * 0.32 + sin(along * 22.0 * rough + seed * 2.2) * bend * 0.08;
  float branch2 = 1.0 - smoothstep(branchWidth * 0.82, branchWidth * 0.82 + branchFeather, abs(across - branchPath2));
  branch2 *= branchGate2;

  float branchGate3 = smoothstep(0.38, 0.52, travel) * (1.0 - smoothstep(mix(0.76, 1.02, branchReach), 1.16, travel));
  float branchPath3 = mainPath + spread * 0.62 * splitC + sin(along * 9.8 * rough + seed * 4.2) * bend * 0.24;
  float branch3 = 1.0 - smoothstep(branchWidth * 0.64, branchWidth * 0.64 + branchFeather * 0.90, abs(across - branchPath3));
  branch3 *= branchGate3 * branchDensity;

  float filamentPath = mainPath + sin(along * mix(32.0, 62.0, rough) + seed * 5.1) * bend * 0.030;
  float filamentWidth = max(0.0019, width * 0.22);
  float filament = 1.0 - smoothstep(filamentWidth, filamentWidth + max(0.0022, width * 0.38), abs(across - filamentPath));
  filament *= live * smoothstep(0.04, 0.16, travel);

  return max(max(trunk, filament * 0.58), max(branch1 * 0.82, max(branch2 * 0.70, branch3 * 0.55)));
}
float mandalaMask(vec2 p, float t){
  float r = length(p * 0.92);
  float a = atan(p.y, p.x);
  float family = floor(mod(floor(t / 132.0), 4.0));
  float twistA = sin(r * 4.2 - t * 0.34) * 0.18;
  float twistB = sin(r * 7.4 + t * 0.22) * 0.08;
  float aa = a + twistA + twistB;
  float petalsA = sin(aa * 8.0  + r * 5.0  - t * 1.18) * 0.5 + 0.5;
  float petalsB = sin(aa * 13.0 - r * 8.0  + t * 1.04) * 0.5 + 0.5;
  float petalsC = sin(aa * 21.0 + r * 11.0 - t * 0.82) * 0.5 + 0.5;
  float ringsA = sin(r * 18.0 + sin(aa * 5.0)  * 1.4 - t * 0.92) * 0.5 + 0.5;
  float ringsB = sin(r * 31.0 + sin(aa * 9.0)  * 1.1 + t * 0.62) * 0.5 + 0.5;
  float ringsC = sin(r * 45.0 + cos(aa * 12.0) * 0.8 - t * 0.44) * 0.5 + 0.5;
  float chordA = sin(dot(p, vec2(9.0,  4.2)) + sin(aa * 6.0) * 1.2 - t * 0.76) * 0.5 + 0.5;
  float chordB = sin(dot(p, vec2(-5.4, 8.5)) + cos(aa * 7.0) * 1.1 + t * 0.66) * 0.5 + 0.5;
  float chordC = sin(dot(p, vec2(7.2, -7.8)) + sin(r * 9.0)  * 1.0 - t * 0.52) * 0.5 + 0.5;
  float cellA = sin((p.x + sin(aa * 4.0) * 0.06) * 18.0 + sin(p.y * 13.0 + t * 0.42)) * 0.5 + 0.5;
  float cellB = sin((p.y + cos(aa * 5.0) * 0.06) * 16.0 + cos(p.x * 15.0 - t * 0.38)) * 0.5 + 0.5;
  float cellular = smoothstep(0.42, 0.92, cellA * cellB);
  float lace = smoothstep(0.58, 0.96, petalsA * ringsA + petalsC * ringsB * 0.72);
  float woven = smoothstep(0.56, 0.94, chordA * chordB * 0.72 + ringsB * 0.28);
  float rosette = smoothstep(0.54, 0.94, petalsB * petalsC * 0.70 + ringsC * 0.30);
  float filigree = smoothstep(0.50, 0.92, cellular * 0.60 + chordC * ringsA * 0.40);
  float family0 = max(lace, rosette * 0.54);
  float family1 = max(woven, filigree * 0.62);
  float family2 = max(rosette, cellular * ringsB * 0.70);
  float family3 = max(max(lace * 0.72, woven * 0.72), max(rosette * 0.58, filigree * 0.70));
  float pattern =
      family0 * (1.0 - step(0.5, family)) +
      family1 * (step(0.5, family) * (1.0 - step(1.5, family))) +
      family2 * (step(1.5, family) * (1.0 - step(2.5, family))) +
      family3 * step(2.5, family);
  float inner = smoothstep(0.04, 0.16, r);
  float outer = 1.0 - smoothstep(0.98, 1.28, r);
  float ringGateA = smoothstep(0.10, 0.18, r) * (1.0 - smoothstep(0.34, 0.48, r));
  float ringGateB = smoothstep(0.30, 0.42, r) * (1.0 - smoothstep(0.68, 0.82, r));
  float ringGateC = smoothstep(0.62, 0.76, r) * (1.0 - smoothstep(1.02, 1.18, r));
  float depthGate = max(ringGateA * 0.84, max(ringGateB, ringGateC * 0.92));
  float rimLace = smoothstep(0.66, 0.98, ringsC * petalsA * chordB);
  float mask = pattern * outer * inner * (0.46 + 0.54 * depthGate);
  mask += rimLace * outer * inner * 0.32;
  return clamp(mask, 0.0, 1.0);
}
vec2 blackHoleMask(vec2 p, vec2 pos, float radius, float collapse){
  vec2 d = p - pos;
  float r = length(d);
  float rr = radius * collapse;
  float core = 1.0 - smoothstep(rr * 0.16, rr * 0.54, r);
  float innerShadow = 1.0 - smoothstep(rr * 0.06, rr * 0.22, r);
  core = max(core, innerShadow);
  return vec2(core, 0.0);
}
void main(){
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float t = uTime;
  float travelPhase = sin(t * 0.18);
  float travelBlend = smoothstep(0.18, 0.88, sin(t * 0.10) * 0.5 + 0.5);
  float sweepSection = t / 88.0;
  float sweepIndex = floor(sweepSection);
  float sweepBlend = smoothstep(0.0, 1.0, fract(sweepSection));
  float sweepBias = mix(
    hash(vec2(sweepIndex, 383.6)),
    hash(vec2(sweepIndex + 1.0, 383.6)),
    sweepBlend
  ) * 2.0 - 1.0;
  vec2 sweepDir = normalize(vec2(
    0.58 * sweepBias + sin(t * 0.045 + sweepBias * 2.2) * 0.34,
    cos(t * 0.055 - sweepBias * 1.7) * 0.26
  ));
  vec2 sweep = sweepDir * (travelPhase * 0.46);
  vec2 domain = p * 1.08;
  domain += sweep;
  domain += vec2(sin(t * 0.11), cos(t * 0.09)) * 0.08;
  float frontA = sin(dot(p, normalize(vec2(1.0, 0.18))) * 2.5 - t * 0.74 + sin(t * 0.16) * 1.1);
  float frontB = sin(dot(p, normalize(vec2(-0.82, 0.31))) * 2.0 + t * 0.54 + cos(t * 0.13) * 1.0);
  float crossWave = smoothstep(0.22, 0.92, frontA * 0.5 + 0.5);
  float reboundWave = smoothstep(0.28, 0.90, frontB * 0.5 + 0.5);
  vec2 bulkFlow = sweepDir * (0.42 * crossWave + 0.24 * reboundWave);
  vec2 sideSlip = vec2(-sweepDir.y, sweepDir.x) * (frontB * 0.12);
  vec2 waveDomain = domain + bulkFlow * 0.60 + sideSlip;
  vec2 q = vec2(
    fbm(waveDomain + vec2(0.0, t * 0.030)),
    fbm(waveDomain + vec2(4.7, -t * 0.033))
  );
  vec2 r = vec2(
    fbm(waveDomain + q * 1.15 + vec2(1.7, 9.2) + t * 0.020),
    fbm(waveDomain + q * 1.28 + vec2(8.3, 2.8) - t * 0.018)
  );
  vec2 warp = q * 0.62 + r * 0.48 + bulkFlow * 0.52;

  vec3 fluidState = texture2D(uFluid, uv).rgb;
  vec2 fluidVector = (fluidState.rg - 0.5) * 2.0;
  float fluidPressure = fluidState.r;
  float fluidMemory = fluidState.b;
  waveDomain += fluidVector * 0.125 + sweepDir * (fluidMemory - 0.5) * 0.070;
  warp += fluidVector * 0.185 + vec2(fluidMemory - 0.5, fluidPressure - 0.5) * 0.075;

  float layerA = fbm(waveDomain + warp * 0.78);
  float layerB = fbm(rot(0.45) * (waveDomain * 1.42 - warp * 0.34) - t * 0.015 + bulkFlow * 0.40);
  float layerC = fbm(rot(-0.28) * (waveDomain * 1.95 + warp * 0.18) + t * 0.012 + sideSlip * 0.40);
  float rippleBands = sin(length(waveDomain * 1.28 + warp * 0.34) * 6.8 - t * 1.05 + frontA * 1.2) * 0.5 + 0.5;
  float rippleDetail = smoothstep(0.52, 0.96, rippleBands) * (0.28 + 0.72 * travelBlend);
  float highRipplePulse =
      pulseWindow(fract(t / 29.0), 0.18, 0.32, 0.05) +
      pulseWindow(fract(t / 37.0), 0.62, 0.74, 0.05);
  float highRippleBandsA = sin(length(waveDomain * 2.20 + warp * 0.56) * 15.8 - t * 1.82 + frontB * 1.8) * 0.5 + 0.5;
  float highRippleBandsB = sin(dot(waveDomain * 3.1 + warp * 0.8, vec2(1.2, -0.9)) * 5.4 - t * 1.34 + layerB * 2.0) * 0.5 + 0.5;
  float highRippleSharp = smoothstep(0.74, 0.992, highRippleBandsA * 0.66 + highRippleBandsB * 0.34);
  highRippleSharp *= highRipplePulse * (0.34 + 0.66 * travelBlend);
  float ultraRipplePulse =
      pulseWindow(fract(t / 46.0), 0.18, 0.38, 0.095) * step(0.78, hash(vec2(floor(t / 46.0), 141.2))) +
      pulseWindow(fract(t / 63.0), 0.52, 0.72, 0.095) * step(0.82, hash(vec2(floor(t / 63.0), 149.6)));
  float ultraRippleBandsA = sin(length(waveDomain * 3.10 + warp * 0.82) * 24.0 - t * 2.28 + frontA * 2.6) * 0.5 + 0.5;
  float ultraRippleBandsB = sin(dot(waveDomain * 4.2 + warp * 1.0, vec2(1.6, -1.2)) * 6.8 - t * 1.86 + layerC * 3.0) * 0.5 + 0.5;
  float ultraRippleSharp = smoothstep(0.82, 0.998, ultraRippleBandsA * 0.70 + ultraRippleBandsB * 0.30);
  ultraRippleSharp *= ultraRipplePulse * (0.30 + 0.70 * travelBlend);

  float burstPeriod = 34.0;
  float burstIndex = floor(t / burstPeriod);
  float burstCycle = fract(t / burstPeriod);
  float burstChance = step(0.62, hash(vec2(burstIndex, 617.2)));
  float burstStart = mix(0.08, 0.86, hash(vec2(burstIndex, 621.7)));
  float burstSpan = mix(0.040, 0.085, hash(vec2(burstIndex, 626.4)));
  float burstPulse = pulseWindow(burstCycle, burstStart, burstStart + burstSpan, 0.014) * burstChance;
  float burstLocal = clamp((burstCycle - burstStart) / max(0.001, burstSpan), 0.0, 1.0);
  vec2 burstBaseOrigin = vec2(
    mix(-0.72, 0.72, hash(vec2(burstIndex, 631.8))),
    mix(-0.34, 0.34, hash(vec2(burstIndex, 636.1)))
  );
  vec2 burstDrift = vec2(
    sin(burstIndex * 1.37 + burstLocal * 6.4 + hash(vec2(burstIndex, 640.7)) * 6.2831853),
    cos(burstIndex * 1.81 - burstLocal * 5.2 + hash(vec2(burstIndex, 644.9)) * 6.2831853)
  ) * vec2(
    mix(0.02, 0.12, hash(vec2(burstIndex, 649.3))),
    mix(0.01, 0.08, hash(vec2(burstIndex, 653.6)))
  );
  vec2 burstOrigin = burstBaseOrigin + burstDrift * smoothstep(0.06, 0.90, burstLocal);
  vec2 burstP = waveDomain - burstOrigin;
  float burstAngle = hash(vec2(burstIndex, 657.2)) * 6.2831853;
  vec2 burstPr = rot(burstAngle) * burstP;
  float burstStretch = mix(0.78, 1.38, hash(vec2(burstIndex, 661.7)));
  burstPr *= vec2(burstStretch, 1.0 / burstStretch);
  float burstWaveA = sin(length(burstPr * vec2(1.35, 0.92)) * 42.0 - burstLocal * 15.0 + layerA * 5.0) * 0.5 + 0.5;
  float burstWaveB = sin(dot(burstPr * 7.0 + warp * 1.5, vec2(1.1, -1.7)) + burstLocal * 18.0 + layerC * 4.0) * 0.5 + 0.5;
  float burstGrain = fbm(burstPr * 7.5 + warp * 1.8 + vec2(t * 0.18, -t * 0.13));
  float burstSharp = smoothstep(0.66, 0.995, burstWaveA * 0.48 + burstWaveB * 0.34 + burstGrain * 0.18);
  float burstFalloff = 1.0 - smoothstep(0.10, 1.25, length(burstPr));
  float burstTurbulence = burstSharp * burstFalloff * burstPulse;
  float centerRipplePeriod = 68.0;
  float centerRippleIndex = floor(t / centerRipplePeriod);
  float centerRippleCycle = fract(t / centerRipplePeriod);
  float centerRippleChance = step(0.64, hash(vec2(centerRippleIndex, 77.2)));
  float centerRippleStart = mix(0.16, 0.54, hash(vec2(centerRippleIndex, 81.9)));
  float centerRippleSpan = mix(0.20, 0.30, hash(vec2(centerRippleIndex, 83.7)));
  float centerRipplePulse = pulseWindow(centerRippleCycle, centerRippleStart, centerRippleStart + centerRippleSpan, 0.10) * centerRippleChance;
  float centerRippleLocal = clamp((centerRippleCycle - centerRippleStart) / max(0.001, centerRippleSpan), 0.0, 1.0);
  float centerAngle = atan(p.y, p.x);
  float centerWarp =
      sin(centerAngle * 3.0 + centerRippleLocal * 4.2 + layerA * 1.1) * 0.018 +
      sin(centerAngle * 6.0 - centerRippleLocal * 2.8 + layerB * 1.0) * 0.010 +
      (fbm(p * 1.7 + warp * 0.18 + centerRippleLocal * 0.55) - 0.5) * 0.026;
  vec2 centerOrigin = vec2(
    mix(-0.10, 0.10, hash(vec2(centerRippleIndex, 421.7))),
    mix(-0.08, 0.08, hash(vec2(centerRippleIndex, 427.3)))
  );
  vec2 centerP = p - centerOrigin * (1.0 - smoothstep(0.0, 0.62, centerRippleLocal));
  float centerRadius = length(centerP * vec2(
    1.0 + 0.025 * sin(centerRippleLocal * 2.4 + layerB),
    1.0 + 0.020 * cos(centerRippleLocal * 2.1 + layerC)
  )) + centerWarp;
  float centerRippleFront = 1.0 - smoothstep(
    centerRippleLocal * 2.06 + 0.06,
    centerRippleLocal * 2.06 + 0.44,
    centerRadius
  );
  float centerThickness =
      0.050 +
      0.026 * (sin(centerAngle * 4.0 + centerRippleLocal * 4.8) * 0.5 + 0.5) +
      0.026 * fbm(p * 2.5 + vec2(centerRippleLocal * 0.8, -centerRippleLocal * 0.6));
  float centerFreq = mix(18.5, 23.5, fbm(p * 1.1 + warp * 0.08));
  float centerWavePhase = centerRadius * centerFreq - centerRippleLocal * 5.2;
  float centerWave = sin(centerWavePhase);
  float centerRingIndex = floor((centerWavePhase + 6.2831853) / 6.2831853);
  float centerRingRandom = hash(vec2(centerRingIndex, centerRippleIndex + 501.7));
  float centerRingIntensity = mix(0.46, 1.0, centerRingRandom);
  centerRingIntensity *= 0.78 + 0.22 * sin(centerRingIndex * 1.7 + centerRippleLocal * 3.0);
  float centerRippleBands = 1.0 - smoothstep(
    1.0 - centerThickness,
    1.0,
    centerWave * 0.5 + 0.5
  );
  float centerBreakup = smoothstep(0.12, 0.84, fbm(p * 3.0 + warp * 0.18 + centerRippleLocal * 1.1));
  float centerEventFade =
      smoothstep(0.00, 0.16, centerRippleLocal) *
      (1.0 - smoothstep(0.72, 1.00, centerRippleLocal));
  float ringTailFade = 1.0 - smoothstep(1.35, 2.55, centerRadius - centerRippleLocal * 1.35);
  float centerRipple = centerRippleBands * centerRippleFront * centerRipplePulse;
  centerRipple *= centerEventFade * ringTailFade * centerRingIntensity * (0.72 + 0.28 * centerBreakup);
  float liquid = layerA * 0.54 + layerB * 0.29 + layerC * 0.17;
  liquid = smoothstep(0.16, 0.90, liquid);
  float pools = smoothstep(0.24, 0.84, fbm(waveDomain * 0.92 - warp * 0.46 + sweepDir * 2.0));
  float swells = smoothstep(0.18, 0.92, fbm(rot(0.18) * (waveDomain * 0.70 + bulkFlow * 0.50 + warp * 0.32) - 4.0));
  float field = mix(liquid, pools, 0.34);
  field = mix(field, swells, 0.26);
  field = mix(field, fluidMemory, 0.13 + 0.11 * smoothstep(0.34, 0.92, fluidPressure));
  float rippleWeight = (0.10 + 0.12 * travelBlend) * (1.0 - centerRipplePulse * 0.92);
  float sharpRippleWeight = (0.08 + 0.18 * highRipplePulse) * (1.0 - centerRipplePulse * 0.96);
  float ultraRippleWeight = (0.06 + 0.22 * ultraRipplePulse) * (1.0 - centerRipplePulse * 0.98);
  field = mix(field, rippleDetail, rippleWeight);
  field = mix(field, highRippleSharp, sharpRippleWeight);
  field = mix(field, ultraRippleSharp, ultraRippleWeight);
  field = mix(field, burstTurbulence, 0.42 * burstPulse);
  field = mix(field, centerRipple, 0.22 * centerRipplePulse);
  field = mix(field, crossWave, 0.06);
  vec3 col = palette(field);
  float ribbon = sin(dot(waveDomain, vec2(1.18, -0.62)) + warp.x * 2.0 + t * 0.17);
  ribbon = smoothstep(0.42, 0.95, ribbon * 0.5 + 0.5);
  float softSpec = smoothstep(0.56, 0.95, field) * 0.82 + ribbon * 0.38 + crossWave * 0.15;
  float flowRidgeA = sin(dot(waveDomain + fluidVector * 0.72, vec2(2.6, -1.4)) * 4.7 + layerA * 3.1 - t * 0.34) * 0.5 + 0.5;
  float flowRidgeB = sin(length(waveDomain * vec2(1.18, 0.82) + warp * 0.42 + fluidVector * 0.55) * 10.8 - t * 0.74 + layerC * 2.2) * 0.5 + 0.5;
  float definitionRidge = smoothstep(0.68, 0.98, flowRidgeA * 0.52 + flowRidgeB * 0.48);
  definitionRidge *= smoothstep(0.22, 0.92, field) * (0.42 + 0.58 * smoothstep(0.34, 0.96, fluidPressure));
  float definitionShadow = smoothstep(0.58, 0.96, 1.0 - flowRidgeB) * smoothstep(0.16, 0.82, field) * 0.36;
  softSpec += definitionRidge * 0.18;
  col += vec3(0.92) * softSpec * 0.66;
  col += vec3(0.22) * definitionRidge * (0.28 + 0.72 * softSpec);
  col -= vec3(0.070) * definitionShadow * (0.50 + 0.50 * smoothstep(0.10, 0.94, field));
  col += vec3(0.56) * smoothstep(0.52, 0.98, fluidPressure) * smoothstep(0.30, 0.95, fluidMemory) * 0.22;
  col += vec3(0.72) * burstTurbulence * burstPulse * (0.42 + 0.58 * softSpec);
  col -= vec3(0.18) * burstPulse * burstFalloff * (1.0 - burstSharp) * 0.22;
  float coolMask = smoothstep(0.50, 0.88, layerB) * smoothstep(0.26, 0.76, swells);
  float warmMask = smoothstep(0.58, 0.94, layerC) * smoothstep(0.34, 0.82, pools);
  col += vec3(0.055, 0.055, 0.058) * coolMask * 0.16;
  col += vec3(0.050, 0.050, 0.050) * warmMask * 0.10;
  float contrastField = smoothstep(0.004, 0.996, field);
  float contourField  = smoothstep(0.05, 0.96, field);
  float peakField     = smoothstep(0.52, 0.990, field);
  float troughField   = 1.0 - smoothstep(0.20, 0.58, field);
  contrastField = mix(contrastField, contourField, 0.90);
  col *= mix(0.025, 2.18, contrastField);
  col = mix(col * 0.055, col, pow(contrastField, 0.46));
  col -= vec3(0.125) * pow(max(troughField, 0.0), 1.28) * 1.22;
  col += vec3(0.255) * pow(max(peakField, 0.0), 1.04) * 1.04;
  col += vec3(0.055) * definitionRidge * pow(max(peakField, 0.0), 0.72);
  col = max(col, vec3(0.0));
  float cycle = fract(t / 24.0);
  float pulseBlue   = pulseWindow(cycle, 0.00, 0.20, 0.07);
  float pulsePurple = pulseWindow(cycle, 0.18, 0.40, 0.07);
  float pulseRed    = pulseWindow(cycle, 0.38, 0.53, 0.06);
  float pulseOrange = pulseWindow(cycle, 0.51, 0.66, 0.06);
  float pulseWhite  = pulseWindow(cycle, 0.64, 0.78, 0.06);
  float pulseBlack  = pulseWindow(cycle, 0.78, 0.92, 0.06);

  float rainbowPeriod = 118.0;
  float rainbowIndex = floor(t / rainbowPeriod);
  float rainbowCycle = fract(t / rainbowPeriod);
  float rainbowChance = step(0.54, hash(vec2(rainbowIndex, 811.4)));
  float rainbowStart = mix(0.16, 0.64, hash(vec2(rainbowIndex, 817.9)));
  float rainbowSpan = mix(0.22, 0.42, hash(vec2(rainbowIndex, 823.2)));
  float rainbowPulse = pulseWindow(rainbowCycle, rainbowStart, rainbowStart + rainbowSpan, 0.09) * rainbowChance;
  vec3 rainbowColorA = spectrum(p.x * 0.34 + p.y * 0.22 + layerA * 0.28 + t * 0.030);
  vec3 rainbowColorB = spectrum(atan(p.y, p.x) * 0.159 + length(p) * 0.42 + layerC * 0.24 - t * 0.022);
  vec3 rainbowColor = mix(rainbowColorA, rainbowColorB, 0.46 + 0.24 * sin(t * 0.07 + layerB));

  float mandalaPeriod = 132.0;
  float mandalaIndex = floor(t / mandalaPeriod);
  float mandalaCycle = fract(t / mandalaPeriod);
  float mandalaStart = mix(0.46, 0.66, hash(vec2(mandalaIndex, 551.2)));
  float mandalaSpan = mix(0.34, 0.60, hash(vec2(mandalaIndex, 557.8)));
  float mandalaFadeIn = mix(0.045, 0.180, pow(hash(vec2(mandalaIndex, 563.4)), 0.72));
  float mandalaFadeOut = mix(0.090, 0.240, hash(vec2(mandalaIndex, 569.1)));
  float mandalaLocal = clamp((mandalaCycle - mandalaStart) / max(0.001, mandalaSpan), 0.0, 1.0);
  float mandalaPulse =
    smoothstep(0.0, mandalaFadeIn, mandalaLocal) *
    (1.0 - smoothstep(1.0 - mandalaFadeOut, 1.0, mandalaLocal));
  mandalaPulse *= 0.84 + 0.16 * smoothstep(0.12, 0.76, mandalaLocal);
  float strobePeriod = 56.0;
  float strobeIndex = floor(t / strobePeriod);
  float strobeCycle = fract(t / strobePeriod);
  float strobeChance = step(0.28, hash(vec2(strobeIndex, 203.7)));
  float strobeStart = mix(0.08, 0.34, hash(vec2(strobeIndex, 211.4)));
  float strobeSpan = mix(0.08, 0.28, pow(hash(vec2(strobeIndex, 214.9)), 1.04));
  float strobeFade = mix(0.010, 0.028, hash(vec2(strobeIndex, 216.6)));
  float strobeLocal = clamp((strobeCycle - strobeStart) / max(0.001, strobeSpan), 0.0, 1.0);
  float strobeActive = pulseWindow(strobeCycle, strobeStart, strobeStart + strobeSpan, strobeFade) * strobeChance;
  float strobeMotionA = 0.5 + 0.5 * sin(strobeLocal * mix(1.05, 1.70, hash(vec2(strobeIndex, 218.3))) * 6.2831853 + hash(vec2(strobeIndex, 232.2)) * 6.2831853);
  float strobeMotionB = 0.5 + 0.5 * sin(strobeLocal * mix(0.92, 1.55, hash(vec2(strobeIndex, 221.1))) * 6.2831853 + hash(vec2(strobeIndex, 235.6)) * 6.2831853);
  float strobeMotionC = 0.5 + 0.5 * sin(strobeLocal * mix(1.18, 2.00, hash(vec2(strobeIndex, 224.7))) * 6.2831853 + hash(vec2(strobeIndex, 239.0)) * 6.2831853);
  float strobeMotionD = 0.5 + 0.5 * sin(strobeLocal * mix(0.86, 1.62, hash(vec2(strobeIndex, 228.4))) * 6.2831853 + hash(vec2(strobeIndex, 242.4)) * 6.2831853);
  float strobeVariation = hash(vec2(strobeIndex, 246.8));
  float useFourFloor = 1.0 - step(0.125, strobeVariation);
  float useHouse     = step(0.125, strobeVariation) * (1.0 - step(0.250, strobeVariation));
  float useGallop    = step(0.250, strobeVariation) * (1.0 - step(0.375, strobeVariation));
  float useBroken    = step(0.375, strobeVariation) * (1.0 - step(0.500, strobeVariation));
  float useRolling   = step(0.500, strobeVariation) * (1.0 - step(0.625, strobeVariation));
  float useBurst     = step(0.625, strobeVariation) * (1.0 - step(0.750, strobeVariation));
  float useRatchet   = step(0.750, strobeVariation) * (1.0 - step(0.875, strobeVariation));
  float useFast      = step(0.875, strobeVariation);
  float fourA = pulseWindow(strobeLocal, 0.00, 0.07, 0.010);
  float fourB = pulseWindow(strobeLocal, 0.24, 0.31, 0.010);
  float fourC = pulseWindow(strobeLocal, 0.50, 0.57, 0.010);
  float fourD = pulseWindow(strobeLocal, 0.74, 0.81, 0.010);
  float fourAccent = pulseWindow(strobeLocal, 0.12, 0.16, 0.008) + pulseWindow(strobeLocal, 0.62, 0.66, 0.008);
  float strobeFourFloor = max(max(fourA, fourB), max(fourC, max(fourD, fourAccent * 0.35)));

  float houseKickA = pulseWindow(strobeLocal, 0.00, 0.070, 0.010);
  float houseKickB = pulseWindow(strobeLocal, 0.25, 0.320, 0.010);
  float houseKickC = pulseWindow(strobeLocal, 0.50, 0.570, 0.010);
  float houseKickD = pulseWindow(strobeLocal, 0.75, 0.820, 0.010);
  float houseOffA = pulseWindow(strobeLocal, 0.125, 0.170, 0.008);
  float houseOffB = pulseWindow(strobeLocal, 0.375, 0.420, 0.008);
  float houseOffC = pulseWindow(strobeLocal, 0.625, 0.670, 0.008);
  float houseOffD = pulseWindow(strobeLocal, 0.875, 0.920, 0.008);
  float strobeHouse = max(max(max(houseKickA, houseKickB), max(houseKickC, houseKickD)), max(max(houseOffA, houseOffB), max(houseOffC, houseOffD)) * 0.28);

  float gallopA = pulseWindow(strobeLocal, 0.00, 0.09, 0.012);
  float gallopB = pulseWindow(strobeLocal, 0.13, 0.17, 0.008);
  float gallopC = pulseWindow(strobeLocal, 0.34, 0.43, 0.012);
  float gallopD = pulseWindow(strobeLocal, 0.48, 0.53, 0.008);
  float gallopE = pulseWindow(strobeLocal, 0.72, 0.82, 0.012);
  float strobeGallop = max(gallopA, max(gallopC, gallopE));

  float brokenA = pulseWindow(strobeLocal, 0.00, 0.060, 0.010);
  float brokenB = pulseWindow(strobeLocal, 0.18, 0.235, 0.008);
  float brokenC = pulseWindow(strobeLocal, 0.31, 0.355, 0.007);
  float brokenD = pulseWindow(strobeLocal, 0.52, 0.600, 0.011);
  float brokenE = pulseWindow(strobeLocal, 0.66, 0.705, 0.007);
  float brokenF = pulseWindow(strobeLocal, 0.89, 0.955, 0.010);
  float strobeBroken = max(max(brokenA, brokenC), brokenE);

  float roll1 = pulseWindow(strobeLocal, 0.00, 0.04, 0.007);
  float roll2 = pulseWindow(strobeLocal, 0.08, 0.12, 0.007);
  float roll3 = pulseWindow(strobeLocal, 0.16, 0.20, 0.007);
  float roll4 = pulseWindow(strobeLocal, 0.24, 0.28, 0.007);
  float roll5 = pulseWindow(strobeLocal, 0.40, 0.44, 0.007);
  float roll6 = pulseWindow(strobeLocal, 0.48, 0.52, 0.007);
  float roll7 = pulseWindow(strobeLocal, 0.56, 0.60, 0.007);
  float roll8 = pulseWindow(strobeLocal, 0.64, 0.68, 0.007);
  float roll9 = pulseWindow(strobeLocal, 0.80, 0.84, 0.007);
  float roll10 = pulseWindow(strobeLocal, 0.88, 0.92, 0.007);
  float strobeRolling = max(max(roll1, roll3), max(max(roll5, roll7), roll9));
  float burst1 = pulseWindow(strobeLocal, 0.00, 0.05, 0.008);
  float burst2 = pulseWindow(strobeLocal, 0.06, 0.11, 0.008);
  float burst3 = pulseWindow(strobeLocal, 0.12, 0.17, 0.008);
  float burst4 = pulseWindow(strobeLocal, 0.42, 0.48, 0.008);
  float burst5 = pulseWindow(strobeLocal, 0.49, 0.55, 0.008);
  float burst6 = pulseWindow(strobeLocal, 0.76, 0.83, 0.010);
  float burst7 = pulseWindow(strobeLocal, 0.84, 0.90, 0.010);
  float strobeBurst = max(max(burst1, burst3), max(burst5, burst7));

  float ratchetCycleA = fract(strobeLocal * 4.5 + hash(vec2(strobeIndex, 431.5)) * 0.33);
  float ratchetCycleB = fract(strobeLocal * 6.5 + hash(vec2(strobeIndex, 435.9)) * 0.41);
  float ratchetGateA = pulseWindow(strobeLocal, 0.02, 0.24, 0.040);
  float ratchetGateB = pulseWindow(strobeLocal, 0.39, 0.58, 0.040);
  float ratchetGateC = pulseWindow(strobeLocal, 0.72, 0.96, 0.040);
  float ratchetA = pulseWindow(ratchetCycleA, 0.00, 0.135, 0.020) * max(ratchetGateA, ratchetGateC);
  float ratchetB = pulseWindow(ratchetCycleB, 0.00, 0.100, 0.016) * max(ratchetGateB, ratchetGateC * 0.72);
  float ratchetDrop = pulseWindow(strobeLocal, 0.585, 0.675, 0.014);
  float strobeRatchet = max(max(ratchetA, ratchetB), ratchetDrop) * 0.72;

  float fastCycleA = fract(strobeLocal * 6.0 + hash(vec2(strobeIndex, 462.4)) * 0.20);
  float fastCycleB = fract(strobeLocal * 8.5 + hash(vec2(strobeIndex, 466.8)) * 0.30);
  float fastCycleC = fract(strobeLocal * 11.5 + hash(vec2(strobeIndex, 470.2)) * 0.40);
  float fastA = pulseWindow(fastCycleA, 0.00, 0.18, 0.030);
  float fastB = pulseWindow(fastCycleB, 0.00, 0.12, 0.020);
  float fastC = pulseWindow(fastCycleC, 0.00, 0.075, 0.012);
  float fastCluster = pulseWindow(strobeLocal, 0.10, 0.32, 0.040) + pulseWindow(strobeLocal, 0.64, 0.82, 0.040);
  float strobeFast = max(max(fastA * 0.82, fastB * 0.88), fastC * 0.96) * clamp(fastCluster, 0.0, 1.0) * 0.64;

  float fastOverlayGate = step(0.82, hash(vec2(strobeIndex, 474.6)));
  float fastOverlay = max(fastB * 0.18, fastC * 0.14) * fastOverlayGate;

  float strobeBasePulse =
    strobeFourFloor * useFourFloor +
    strobeHouse * useHouse +
    strobeGallop * useGallop +
    strobeBroken * useBroken +
    strobeRolling * useRolling +
    strobeBurst * useBurst +
    strobeRatchet * useRatchet +
    strobeFast * useFast;
  float strobeMasterPulse = max(strobeBasePulse, fastOverlay) * strobeActive;
  float strobeAccentA = pulseWindow(strobeLocal, 0.00, 0.10, 0.012);
  float strobeAccentB = pulseWindow(strobeLocal, 0.24, 0.34, 0.012);
  float strobeAccentC = pulseWindow(strobeLocal, 0.10, 0.18, 0.010);
  float strobeAccentD = pulseWindow(strobeLocal, 0.36, 0.46, 0.012);
  float strobeIntricate = max(strobeBroken * useBroken, max(strobeRatchet * useRatchet, strobeFast * useFast)) * 0.72;
  float strobePulseA = max(strobeMasterPulse * (0.80 + 0.20 * strobeAccentA), strobeIntricate * 0.24);
  float strobePulseB = max(strobeMasterPulse * (0.78 + 0.22 * strobeAccentB), strobeIntricate * 0.34);
  float strobePulseC = max(strobeMasterPulse * (0.74 + 0.26 * strobeAccentC), strobeIntricate * 0.42);
  float strobePulseD = max(strobeMasterPulse * (0.76 + 0.24 * strobeAccentD), strobeIntricate * 0.30);
  float strobeColorMode = step(0.85, hash(vec2(strobeIndex, 253.9)));
  float strobeColorPick = hash(vec2(strobeIndex, 259.3));
  float strobeSunrayMode = step(0.84, hash(vec2(strobeIndex, 397.4)));
  float beamSection = t / 64.0;
  float beamIndex = floor(beamSection);
  float beamBlend = smoothstep(0.0, 1.0, fract(beamSection));
  float beamFlipA = mix(hash(vec2(beamIndex, 371.1)), hash(vec2(beamIndex + 1.0, 371.1)), beamBlend);
  float beamFlipB = mix(hash(vec2(beamIndex, 373.7)), hash(vec2(beamIndex + 1.0, 373.7)), beamBlend);
  float thunderPeriod = 48.0;
  float thunderIndex = floor(t / thunderPeriod);
  float thunderCycle = fract(t / thunderPeriod);
  float thunderChance = step(0.34, hash(vec2(thunderIndex, 38.4)));
  float thunderStart = mix(0.10, 0.72, hash(vec2(thunderIndex, 39.2)));
  float thunderSpan = mix(0.070, 0.190, hash(vec2(thunderIndex, 40.6)));
  float thunderFade = mix(0.018, 0.046, hash(vec2(thunderIndex, 41.1)));
  float thunderLocal = clamp((thunderCycle - thunderStart) / max(0.001, thunderSpan), 0.0, 1.0);
  float thunderNoStrobe = 1.0 - step(0.001, strobeActive);
  float thunderActive = pulseWindow(thunderCycle, thunderStart, thunderStart + thunderSpan, thunderFade) * thunderChance * thunderNoStrobe;
  float thunderSecondChance = step(0.68, hash(vec2(thunderIndex, 43.7)));
  float thunderHitA = pulseWindow(thunderLocal, 0.00, mix(0.08, 0.18, hash(vec2(thunderIndex, 45.1))), 0.022);
  float thunderHitB = pulseWindow(thunderLocal, mix(0.20, 0.38, hash(vec2(thunderIndex, 46.4))), mix(0.30, 0.58, hash(vec2(thunderIndex, 46.9))), 0.024) * thunderSecondChance;
  float thunderTail = 1.0 - smoothstep(mix(0.54, 0.79, hash(vec2(thunderIndex, 51.4))), 1.0, thunderLocal);
  float thunderPulse = max(thunderHitA, thunderHitB) * thunderTail * thunderActive;
  vec2 bluePos   = vec2(-0.84 + 0.24 * sin(t * 0.17),  0.20 + 0.16 * cos(t * 0.20));
  vec2 purplePos = vec2( 0.12 + 0.30 * sin(t * 0.15),  0.16 + 0.22 * cos(t * 0.12));
  vec2 redPos    = vec2( 0.74 + 0.16 * cos(t * 0.16), -0.16 + 0.18 * sin(t * 0.13));
  vec2 orangePos = vec2(-0.12 + 0.38 * sin(t * 0.10),  0.46 - 0.14 * cos(t * 0.14));
  vec2 whitePos  = vec2( 0.00 + 0.24 * sin(t * 0.19), -0.02 + 0.14 * cos(t * 0.17));
  float blueBeam = torchlightMask(
    p,
    mix(vec2(-1.42, -0.12 + 0.20 * sin(t * 0.14)), vec2(1.42, -0.12 + 0.20 * sin(t * 0.14)), beamFlipA),
    mix(vec2(0.94, 0.26 + 0.10 * cos(t * 0.11)), vec2(-0.94, 0.26 + 0.10 * cos(t * 0.11)), beamFlipA),
    3.05,
    1.30,
    t,
    2.0
  );
  float purpleBeam = torchlightMask(
    p,
    mix(vec2(1.34, -0.24 + 0.16 * cos(t * 0.12)), vec2(-1.34, -0.24 + 0.16 * cos(t * 0.12)), beamFlipB),
    mix(vec2(-0.88, 0.34 + 0.08 * sin(t * 0.09)), vec2(0.88, 0.34 + 0.08 * sin(t * 0.09)), beamFlipB),
    2.95,
    1.24,
    t,
    4.0
  );
  float redBeam = torchlightMask(
    p,
    mix(vec2(-1.18, 0.84 + 0.12 * sin(t * 0.10)), vec2(1.18, 0.84 + 0.12 * sin(t * 0.10)), 1.0 - beamFlipA),
    mix(vec2(0.76, -0.56 + 0.10 * cos(t * 0.08)), vec2(-0.76, -0.56 + 0.10 * cos(t * 0.08)), 1.0 - beamFlipA),
    3.18,
    1.22,
    t,
    6.0
  );
  float orangeBeam = torchlightMask(
    p,
    mix(vec2(1.46, 0.70 + 0.10 * cos(t * 0.13)), vec2(-1.46, 0.70 + 0.10 * cos(t * 0.13)), 1.0 - beamFlipB),
    mix(vec2(-0.92, -0.28 + 0.10 * sin(t * 0.07)), vec2(0.92, -0.28 + 0.10 * sin(t * 0.07)), 1.0 - beamFlipB),
    3.12,
    1.26,
    t,
    8.0
  );
  float whiteBeam = torchlightMask(
    p,
    vec2(-0.10, -1.02 + 0.10 * sin(t * 0.10)),
    vec2(0.08, 1.00),
    2.92,
    1.14,
    t,
    10.0
  );
  float blueSplash   = splashMask(p + bulkFlow * 0.10, bluePos,   vec2(0.70, 0.86), 1.32, t, 2.0);
  float purpleSplash = splashMask(p + bulkFlow * 0.08, purplePos, vec2(0.74, 0.88), 1.22, t, 4.0);
  float redSplash    = splashMask(p + bulkFlow * 0.06, redPos,    vec2(0.80, 0.92), 1.15, t, 6.0);
  float orangeSplash = splashMask(p + bulkFlow * 0.06, orangePos, vec2(0.76, 0.98), 1.08, t, 8.0);
  float whiteSplash  = splashMask(p + bulkFlow * 0.10, whitePos,  vec2(0.78, 0.80), 1.10, t, 10.0);
  float mandala = mandalaMask(p, t);
  float thunderAngle = mix(0.14, 1.44, hash(vec2(thunderIndex, 4.2)));
  thunderAngle = clamp(thunderAngle + mix(-0.20, 0.20, hash(vec2(thunderIndex, 5.6))), 0.08, 1.50);
  float thunderSign = step(0.5, hash(vec2(thunderIndex, 8.7))) * 2.0 - 1.0;
  float thunderVerticalSign = mix(-1.0, 1.0, step(0.78, hash(vec2(thunderIndex, 11.6))));
  vec2 thunderDir = normalize(vec2(thunderSign * cos(thunderAngle), thunderVerticalSign * sin(thunderAngle)));
  vec2 thunderPerp = vec2(-thunderDir.y, thunderDir.x);
  vec2 thunderOrigin = -thunderDir * mix(1.20, 2.80, hash(vec2(thunderIndex, 14.9))) + thunderPerp * mix(-1.08, 1.08, hash(vec2(thunderIndex, 12.3)));

  float thunderVariant = hash(vec2(thunderIndex, 19.6));
  float thunderWide = smoothstep(0.60, 0.84, thunderVariant) * (1.0 - step(0.90, thunderVariant));
  float thunderHeavy = step(0.88, thunderVariant);
  float thunderBranchReach = mix(0.34, 1.20, hash(vec2(thunderIndex, 16.2)));
  float thunderBranchDensity = mix(0.34, 0.88, hash(vec2(thunderIndex, 17.7)));
  thunderBranchReach = mix(thunderBranchReach, mix(1.10, 1.72, hash(vec2(thunderIndex, 20.9))), thunderWide);
  thunderBranchDensity = mix(thunderBranchDensity, mix(0.62, 0.96, hash(vec2(thunderIndex, 21.2))), thunderWide);

  float thunderLen = mix(3.10, 8.40, hash(vec2(thunderIndex, 18.4)));
  thunderLen = mix(thunderLen, mix(6.80, 10.60, hash(vec2(thunderIndex, 19.2))), thunderWide);
  thunderLen = mix(thunderLen, mix(2.30, 4.20, hash(vec2(thunderIndex, 18.9))), thunderHeavy);

  float thunderCoreWidth = mix(0.0015, 0.014, pow(hash(vec2(thunderIndex, 21.6)), 1.65));
  thunderCoreWidth = mix(thunderCoreWidth, mix(0.0010, 0.0046, hash(vec2(thunderIndex, 23.8))), thunderWide);
  thunderCoreWidth = mix(thunderCoreWidth, mix(0.014, 0.034, hash(vec2(thunderIndex, 24.6))), thunderHeavy);
  float thunderGlowWidth = thunderCoreWidth + mix(0.010, 0.040, hash(vec2(thunderIndex, 24.1)));
  float thunderSeed = 30.0 + thunderIndex * 2.37;
  float thunderBoltCore = thunderboltMask(
    p,
    thunderOrigin,
    thunderDir,
    thunderLen,
    thunderCoreWidth,
    thunderSeed,
    thunderBranchReach,
    thunderBranchDensity
  ) * thunderPulse;
  float thunderBoltGlow = thunderboltMask(
    p,
    thunderOrigin,
    thunderDir,
    thunderLen + mix(0.22, 0.96, thunderBranchReach),
    thunderGlowWidth,
    thunderSeed + 1.7,
    thunderBranchReach,
    thunderBranchDensity
  ) * thunderPulse;
  float blackHolePeriod = 82.0;
  float blackHoleIndex = floor(t / blackHolePeriod);
  float blackHoleTravel = fract(t / blackHolePeriod);
  float blackHoleChance = step(0.52, hash(vec2(blackHoleIndex, 91.2)));
  float blackHoleStart = mix(0.16, 0.32, hash(vec2(blackHoleIndex, 102.4)));
  float blackHoleSpan = mix(0.34, 0.48, hash(vec2(blackHoleIndex, 108.8)));
  float blackHoleLocal = clamp((blackHoleTravel - blackHoleStart) / max(0.001, blackHoleSpan), 0.0, 1.0);
  float blackHoleLife =
    smoothstep(0.00, 0.18, blackHoleLocal) *
    (1.0 - smoothstep(0.76, 1.00, blackHoleLocal)) *
    blackHoleChance;
  float blackHoleCollapse = mix(1.0, 0.16, smoothstep(0.72, 1.00, blackHoleLocal));
  float blackHoleOrbitDir = mix(-1.0, 1.0, step(0.5, hash(vec2(blackHoleIndex, 127.4))));
  float blackHolePhase = hash(vec2(blackHoleIndex, 131.8)) * 6.2831853;
  float blackHoleTheta = blackHolePhase + blackHoleOrbitDir * mix(-1.05, 1.15, blackHoleLocal) * 3.14159265;
  vec2 blackHoleCenter = vec2(
    mix(-0.26, 0.26, hash(vec2(blackHoleIndex, 136.2))),
    mix(-0.16, 0.16, hash(vec2(blackHoleIndex, 139.7)))
  );
  vec2 blackHoleRadii = vec2(
    mix(0.32, 0.72, hash(vec2(blackHoleIndex, 144.1))),
    mix(0.12, 0.34, hash(vec2(blackHoleIndex, 148.6)))
  );
  float blackHoleTilt = mix(-0.95, 0.95, hash(vec2(blackHoleIndex, 152.9)));
  vec2 blackHoleOrbit = rot(blackHoleTilt) * vec2(cos(blackHoleTheta) * blackHoleRadii.x, sin(blackHoleTheta) * blackHoleRadii.y);
  vec2 blackHolePos = blackHoleCenter + blackHoleOrbit;
  float blackHoleRadius = mix(0.16, 0.34, pow(hash(vec2(blackHoleIndex, 157.6)), 0.72));
  vec2 blackHoleA = blackHoleMask(p, blackHolePos, blackHoleRadius, blackHoleCollapse);

  vec2 strobeDirA = normalize(vec2(0.86, -0.22));
  vec2 strobeDirB = normalize(vec2(-0.28, 0.96));
  vec2 strobeDirC = normalize(vec2(0.60, 0.80));
  vec2 strobeDirD = normalize(vec2(-0.90, -0.10));
  float strobeTravelA = (mix(strobeMotionA, 1.0 - strobeMotionA, step(0.5, hash(vec2(strobeIndex, 351.1)))) - 0.5);
  float strobeTravelB = (mix(strobeMotionB, 1.0 - strobeMotionB, step(0.5, hash(vec2(strobeIndex, 353.7)))) - 0.5);
  float strobeTravelC = (mix(strobeMotionC, 1.0 - strobeMotionC, step(0.5, hash(vec2(strobeIndex, 359.2)))) - 0.5);
  float strobeTravelD = (mix(strobeMotionD, 1.0 - strobeMotionD, step(0.5, hash(vec2(strobeIndex, 361.4)))) - 0.5);

  float strobeBasePosA = mix(-0.72, 0.72, hash(vec2(strobeIndex, 261.1)));
  float strobeBasePosB = mix(-0.68, 0.68, hash(vec2(strobeIndex, 263.7)));
  float strobeBasePosC = mix(-0.62, 0.62, hash(vec2(strobeIndex, 269.2)));
  float strobeBasePosD = mix(-0.64, 0.64, hash(vec2(strobeIndex, 281.4)));

  float strobeBandPosA = strobeBasePosA + strobeTravelA * mix(0.08, 0.22, hash(vec2(strobeIndex, 271.1)));
  float strobeBandPosB = strobeBasePosB + strobeTravelB * mix(0.06, 0.18, hash(vec2(strobeIndex, 273.7)));
  float strobeBandPosC = strobeBasePosC + strobeTravelC * mix(0.05, 0.16, hash(vec2(strobeIndex, 279.2)));
  float strobeBandPosD = strobeBasePosD + strobeTravelD * mix(0.07, 0.20, hash(vec2(strobeIndex, 283.8)));

  float strobeWidthA = mix(0.0060, 0.082, pow(hash(vec2(strobeIndex, 291.1)), 0.96));
  float strobeWidthB = mix(0.0050, 0.074, pow(hash(vec2(strobeIndex, 293.7)), 1.00));
  float strobeWidthC = mix(0.0042, 0.066, pow(hash(vec2(strobeIndex, 299.2)), 1.06));
  float strobeWidthD = mix(0.0056, 0.078, pow(hash(vec2(strobeIndex, 301.6)), 0.94));

  float strobeSectionScale = mix(0.94, 1.46, hash(vec2(strobeIndex, floor(strobeLocal * 7.0) + 331.7)));
  strobeWidthA *= strobeSectionScale;
  strobeWidthB *= mix(0.82, 1.42, hash(vec2(strobeIndex, floor(strobeLocal * 7.0) + 337.3)));
  strobeWidthC *= mix(0.76, 1.46, hash(vec2(strobeIndex, floor(strobeLocal * 9.0) + 341.9)));
  strobeWidthD *= mix(0.84, 1.40, hash(vec2(strobeIndex, floor(strobeLocal * 6.0) + 347.5)));

  float strobeHeroPick = hash(vec2(strobeIndex, 362.1));
  float strobeHeroScale = mix(1.18, 1.82, hash(vec2(strobeIndex, 364.7)));
  float strobeHeroA = 1.0 - step(0.25, strobeHeroPick);
  float strobeHeroB = step(0.25, strobeHeroPick) * (1.0 - step(0.50, strobeHeroPick));
  float strobeHeroC = step(0.50, strobeHeroPick) * (1.0 - step(0.75, strobeHeroPick));
  float strobeHeroD = step(0.75, strobeHeroPick);
  strobeWidthA = max(strobeWidthA, mix(0.052, 0.116, hash(vec2(strobeIndex, 366.4))) * strobeHeroScale * strobeHeroA);
  strobeWidthB = max(strobeWidthB, mix(0.048, 0.106, hash(vec2(strobeIndex, 367.1))) * strobeHeroScale * strobeHeroB);
  strobeWidthC = max(strobeWidthC, mix(0.044, 0.096, hash(vec2(strobeIndex, 367.8))) * strobeHeroScale * strobeHeroC);
  strobeWidthD = max(strobeWidthD, mix(0.050, 0.110, hash(vec2(strobeIndex, 368.5))) * strobeHeroScale * strobeHeroD);

  float strobeThinManyMode = step(0.965, hash(vec2(strobeIndex, 369.2)));
  float strobeThinManyScale = mix(0.26, 0.46, hash(vec2(strobeIndex, 370.6)));
  strobeWidthA *= mix(1.0, strobeThinManyScale, (1.0 - strobeHeroA) * strobeThinManyMode);
  strobeWidthB *= mix(1.0, strobeThinManyScale, (1.0 - strobeHeroB) * strobeThinManyMode);
  strobeWidthC *= mix(1.0, strobeThinManyScale, (1.0 - strobeHeroC) * strobeThinManyMode);
  strobeWidthD *= mix(1.0, strobeThinManyScale, (1.0 - strobeHeroD) * strobeThinManyMode);

  float strobeAngleE = mix(-1.25, 1.25, hash(vec2(strobeIndex, 371.8)));
  float strobeAngleF = mix(-1.25, 1.25, hash(vec2(strobeIndex, 372.5)));
  float strobeAngleG = mix(-1.25, 1.25, hash(vec2(strobeIndex, 373.2)));
  float strobeAngleH = mix(-1.25, 1.25, hash(vec2(strobeIndex, 373.9)));
  vec2 strobeDirE = normalize(vec2(cos(strobeAngleE), sin(strobeAngleE)));
  vec2 strobeDirF = normalize(vec2(cos(strobeAngleF), sin(strobeAngleF)));
  vec2 strobeDirG = normalize(vec2(cos(strobeAngleG), sin(strobeAngleG)));
  vec2 strobeDirH = normalize(vec2(cos(strobeAngleH), sin(strobeAngleH)));
  float strobeWidthE = mix(0.0010, 0.0088, hash(vec2(strobeIndex, 374.6))) * strobeThinManyMode;
  float strobeWidthF = mix(0.0012, 0.0102, hash(vec2(strobeIndex, 375.3))) * strobeThinManyMode;
  float strobeWidthG = mix(0.0011, 0.0096, hash(vec2(strobeIndex, 376.0))) * strobeThinManyMode;
  float strobeWidthH = mix(0.0009, 0.0080, hash(vec2(strobeIndex, 376.7))) * strobeThinManyMode;
  float strobeBandPosE = mix(-1.02, 1.02, hash(vec2(strobeIndex, 377.4))) + (fract(strobeLocal * mix(0.8, 2.2, hash(vec2(strobeIndex, 378.1))) + hash(vec2(strobeIndex, 378.8))) - 0.5) * mix(0.40, 2.10, hash(vec2(strobeIndex, 379.5)));
  float strobeBandPosF = mix(-1.02, 1.02, hash(vec2(strobeIndex, 380.2))) + (fract(strobeLocal * mix(0.9, 2.4, hash(vec2(strobeIndex, 380.9))) + hash(vec2(strobeIndex, 381.6))) - 0.5) * mix(0.36, 2.00, hash(vec2(strobeIndex, 382.3)));
  float strobeBandPosG = mix(-1.02, 1.02, hash(vec2(strobeIndex, 383.0))) + (fract(strobeLocal * mix(0.7, 2.6, hash(vec2(strobeIndex, 383.7))) + hash(vec2(strobeIndex, 384.4))) - 0.5) * mix(0.42, 2.20, hash(vec2(strobeIndex, 385.1)));
  float strobeBandPosH = mix(-1.02, 1.02, hash(vec2(strobeIndex, 385.8))) + (fract(strobeLocal * mix(1.0, 2.8, hash(vec2(strobeIndex, 386.5))) + hash(vec2(strobeIndex, 387.2))) - 0.5) * mix(0.34, 1.90, hash(vec2(strobeIndex, 387.9)));

  float strobeBandA = bandMask(dot(p, strobeDirA), strobeBandPosA, strobeWidthA, 0.18);
  float strobeBandB = bandMask(dot(p, strobeDirB), strobeBandPosB, strobeWidthB, 0.18);
  float strobeBandC = bandMask(dot(p, strobeDirC), strobeBandPosC, strobeWidthC, 0.16);
  float strobeBandD = bandMask(dot(p, strobeDirD), strobeBandPosD, strobeWidthD, 0.18);
  float strobeBandE = bandMask(dot(p, strobeDirE), strobeBandPosE, strobeWidthE, 0.14) * strobeThinManyMode;
  float strobeBandF = bandMask(dot(p, strobeDirF), strobeBandPosF, strobeWidthF, 0.14) * strobeThinManyMode;
  float strobeBandG = bandMask(dot(p, strobeDirG), strobeBandPosG, strobeWidthG, 0.14) * strobeThinManyMode;
  float strobeBandH = bandMask(dot(p, strobeDirH), strobeBandPosH, strobeWidthH, 0.14) * strobeThinManyMode;
  vec3 strobeColor = vec3(1.12, 1.12, 1.14);
  vec3 strobeAccentColor = mix(vec3(1.0), rainbowColor * vec3(0.88, 0.82, 1.02), strobeColorMode * 0.20);
  strobeColor *= strobeAccentColor;
  if(strobeColorMode > 0.5){
    if(strobeColorPick < 0.34){
      strobeColor = vec3(0.10, 0.44, 1.24);
    }else if(strobeColorPick < 0.68){
      strobeColor = vec3(0.82, 0.20, 1.20);
    }else if(strobeColorPick < 0.84){
      strobeColor = vec3(1.18, 0.16, 0.06);
    }else{
      strobeColor = vec3(1.20, 0.44, 0.00);
    }
  }
  strobeColor = mix(strobeColor, rainbowColor * 1.04 + vec3(0.04), rainbowPulse * 0.70);
  float strobeHeroActive = max(max(strobeHeroA, strobeHeroB), max(strobeHeroC, strobeHeroD));
  float strobeBandMax = max(max(max(strobeBandA, strobeBandB), max(strobeBandC, strobeBandD)), max(max(strobeBandE, strobeBandF), max(strobeBandG, strobeBandH)));
  float strobeBroadGlow = strobeBandMax * strobeMasterPulse * (0.30 + 0.74 * strobeHeroActive);
  vec3 strobeBandContribution =
      strobeColor * strobeBandA * strobePulseA * 0.98 +
      strobeColor * strobeBandB * strobePulseB * 0.94 +
      strobeColor * strobeBandC * strobePulseC * 0.88 +
      strobeColor * strobeBandD * strobePulseD * 0.90 +
      strobeColor * strobeBandE * max(strobePulseA, strobePulseC) * 0.54 +
      strobeColor * strobeBandF * max(strobePulseB, strobePulseD) * 0.52 +
      strobeColor * strobeBandG * max(strobePulseA, strobePulseD) * 0.48 +
      strobeColor * strobeBandH * max(strobePulseB, strobePulseC) * 0.46 +
      strobeColor * strobeBroadGlow * 0.36;
  vec2 sunOrigin = vec2(0.0, 1.04);
  vec2 sunRel = p - sunOrigin;
  float sunDown = smoothstep(0.02, 0.18, -sunRel.y) * (1.0 - smoothstep(1.60, 2.10, -sunRel.y));
  float sunAngle = atan(sunRel.x, -sunRel.y);
  float sunRadius = length(sunRel);
  float sunrayBigMode = step(0.66, hash(vec2(strobeIndex, 402.8)));
  float sunrayWide = mix(0.86, 1.34, sunrayBigMode);
  float sunFan = 1.0 - smoothstep(0.82, 1.16, abs(sunAngle) / sunrayWide);
  float sunRaysA = pow(sin(abs(sunAngle) * 11.0 + sunRadius * 1.4 - t * 0.22) * 0.5 + 0.5, mix(7.0, 4.8, sunrayBigMode));
  float sunRaysB = pow(sin(abs(sunAngle) * 18.0 - sunRadius * 0.9 + t * 0.16) * 0.5 + 0.5, mix(10.0, 6.0, sunrayBigMode));
  float sunRaysC = pow(sin(abs(sunAngle) * 7.0 + sin(sunRadius * 4.0 + t * 0.20)) * 0.5 + 0.5, mix(5.0, 3.7, sunrayBigMode));
  float sunrayComb = max(sunRaysA * mix(0.92, 1.20, sunrayBigMode), max(sunRaysB * mix(1.08, 1.28, sunrayBigMode), sunRaysC * mix(0.70, 0.92, sunrayBigMode)));
  float sunrayCore = 1.0 - smoothstep(0.012, mix(0.064, 0.110, sunrayBigMode), abs(sunAngle));
  float sunrayMask = max(sunrayComb * sunFan, sunrayCore * mix(0.96, 1.18, sunrayBigMode)) * sunDown;
  float sunrayFade = (1.0 - smoothstep(0.14, mix(2.04, 2.42, sunrayBigMode), sunRadius)) * (0.84 + 0.36 * fbm(p * 2.6 + vec2(t * 0.03, -t * 0.02)));

  // In sunray mode, the rays stay present through the section, with stronger rhythmic hits on top.
  float strobeSunrayHold = strobeActive * (0.22 + 0.78 * smoothstep(0.08, 0.16, strobeLocal) * (1.0 - smoothstep(0.46, 0.68, strobeLocal)));
  float strobeSunrayPulse = max(strobeSunrayHold, max(strobeMasterPulse * 1.18, strobeFast * useFast * strobeActive * 1.18));
  vec3 strobeSunrayContribution = strobeColor * sunrayMask * sunrayFade * strobeSunrayPulse * mix(1.86, 2.50, sunrayBigMode);
  vec3 strobeContribution = mix(strobeBandContribution, strobeSunrayContribution, strobeSunrayMode);
  float reflectMask = (0.24 + 0.76 * softSpec) * smoothstep(0.25, 0.95, field);
  reflectMask *= 0.82 + 0.18 * rippleDetail;
  col += vec3(0.02, 0.38, 1.14) * (blueSplash * 0.92 + blueBeam * 1.24) * pulseBlue * reflectMask * 1.34;
  col += vec3(0.74, 0.10, 1.08) * (purpleSplash * 0.90 + purpleBeam * 1.20) * pulsePurple * reflectMask * 1.18;
  col += vec3(1.06, 0.06, 0.02) * (redSplash * 0.88 + redBeam * 1.20) * pulseRed * reflectMask * 1.06;
  col += vec3(1.18, 0.42, 0.00) * (orangeSplash * 0.86 + orangeBeam * 1.18) * pulseOrange * reflectMask * 1.04;
  col += vec3(1.12, 1.12, 1.12) * (whiteSplash * 0.88 + whiteBeam * 1.28) * pulseWhite * reflectMask * 0.94;

  float rainbowHighlightMask =
      blueSplash * 0.48 + purpleSplash * 0.46 + redSplash * 0.42 + orangeSplash * 0.40 + whiteSplash * 0.34 +
      blueBeam * 0.72 + purpleBeam * 0.70 + redBeam * 0.62 + orangeBeam * 0.60 + whiteBeam * 0.58;
  col += rainbowColor * rainbowHighlightMask * rainbowPulse * reflectMask * 1.16;

  float blackThunder = step(0.72, hash(vec2(thunderIndex, 52.4)));
  float whiteThunder = 1.0 - blackThunder;
  vec3 thunderColor = vec3(1.0, 1.0, 1.0);
  float thunderReflect = 0.52 + 0.48 * reflectMask;
  col += thunderColor * thunderBoltGlow * whiteThunder * thunderReflect * 1.18;
  col += vec3(1.18, 1.18, 1.20) * thunderBoltCore * whiteThunder * thunderReflect * 0.70;
  col -= vec3(0.50, 0.50, 0.52) * thunderBoltGlow * blackThunder * thunderReflect * 0.96;
  col -= vec3(0.92, 0.92, 0.96) * thunderBoltCore * blackThunder * thunderReflect * 0.63;
  col += strobeContribution * (0.62 + 0.78 * reflectMask) * 0.98;
  float blackHoleEventGlow = 0.82 + 0.18 * smoothstep(0.10, 0.46, blackHoleLocal) * (1.0 - smoothstep(0.70, 1.0, blackHoleLocal));
  float blackHoleCore = blackHoleA.x * blackHoleLife;
  col -= vec3(1.12, 1.12, 1.16) * blackHoleCore * blackHoleEventGlow * (0.96 + reflectMask * 0.40);

  vec3 mandalaColor =
      vec3(0.06, 0.30, 1.00) * pulseBlue +
      vec3(0.68, 0.10, 1.00) * pulsePurple +
      vec3(1.00, 0.05, 0.02) * pulseRed +
      vec3(1.12, 0.40, 0.00) * pulseOrange +
      vec3(1.00, 1.00, 1.00) * pulseWhite;
  mandalaColor = mix(mandalaColor, rainbowColor * 1.02 + vec3(0.035), rainbowPulse * 0.72);
  col += mandalaColor * mandala * mandalaPulse * (0.54 + 0.74 * reflectMask) * 1.92;
  col -= vec3(0.24, 0.24, 0.24) * mandala * mandalaPulse * pulseBlack * 0.52;
  float sheen = sin(waveDomain.x * 0.86 + waveDomain.y * 0.32 + t * 0.12 + warp.y * 1.85) * 0.5 + 0.5;
  sheen = pow(smoothstep(0.64, 1.0, sheen), 2.0);
  col += vec3(0.62) * sheen * 0.54;
  col = pow(max(col, vec3(0.0)), vec3(1.08));
  float vignette = 1.0 - smoothstep(0.26, 1.22, length((uv - 0.5) * vec2(1.22, 1.0)));
  col *= 0.84 + 0.16 * vignette;
  gl_FragColor = vec4(col, 1.0);
}
`;

function makeShader(type, source){
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Shader compilation failed';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function makeProgram(fragmentSource){
  const vertexShader = makeShader(gl.VERTEX_SHADER, vertexSrc);
  const fragmentShader = makeShader(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Program linking failed';
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error(message);
  }

  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

const simProgram = makeProgram(simFragmentSrc);
const renderProgram = makeProgram(fragmentSrc);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
   1,  1
]), gl.STATIC_DRAW);

function bindQuad(program){
  const position = gl.getAttribLocation(program, 'position');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
}

const simUPrev = gl.getUniformLocation(simProgram, 'uPrev');
const simUSimRes = gl.getUniformLocation(simProgram, 'uSimRes');
const simUTime = gl.getUniformLocation(simProgram, 'uTime');

const uRes = gl.getUniformLocation(renderProgram, 'uRes');
const uTime = gl.getUniformLocation(renderProgram, 'uTime');
const uFluid = gl.getUniformLocation(renderProgram, 'uFluid');

const SIM_W = 512;
const SIM_H = 148;

function rand01(){
  if (window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  }
  return Math.random();
}

const sessionSeed = rand01() * 1000.0;
const startTimeOffset = rand01() * 360.0;
const prewarmSteps = 10 + Math.floor(rand01() * 28.0);
const prewarmStepSize = 0.041 + rand01() * 0.035;
const fluidSeedA = 11.0 + sessionSeed * 0.73;
const fluidSeedB = 37.0 + sessionSeed * 1.91;

function makeFluidTexture(seed){
  const data = new Uint8Array(SIM_W * SIM_H * 4);
  for (let y = 0; y < SIM_H; y++) {
    for (let x = 0; x < SIM_W; x++) {
      const i = (y * SIM_W + x) * 4;
      const raw = Math.sin((x + seed) * 12.9898 + (y - seed) * 78.233) * 43758.5453;
      const n = raw - Math.floor(raw);
      const v = Math.floor((0.42 + 0.16 * n) * 255);
      data[i + 0] = v;
      data[i + 1] = 128;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM_W, SIM_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  return tex;
}

function makeFramebuffer(tex){
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return fb;
}

const fluidTex = [makeFluidTexture(fluidSeedA), makeFluidTexture(fluidSeedB)];
const fluidFbo = [makeFramebuffer(fluidTex[0]), makeFramebuffer(fluidTex[1])];

gl.bindFramebuffer(gl.FRAMEBUFFER, fluidFbo[0]);
const fluidFbo0OK = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
gl.bindFramebuffer(gl.FRAMEBUFFER, fluidFbo[1]);
const fluidFbo1OK = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;

let fluidRead = 0;
let fluidWrite = 1;
const fluidEnabled = fluidFbo0OK && fluidFbo1OK;
gl.bindFramebuffer(gl.FRAMEBUFFER, null);

function resize(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2.25);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

resize();
window.addEventListener('resize', resize, { passive: true });

const start = performance.now();

function stepFluid(t){
  if (!fluidEnabled) return;

  gl.useProgram(simProgram);
  bindQuad(simProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fluidFbo[fluidWrite]);
  gl.viewport(0, 0, SIM_W, SIM_H);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, fluidTex[fluidRead]);
  gl.uniform1i(simUPrev, 0);
  gl.uniform2f(simUSimRes, SIM_W, SIM_H);
  gl.uniform1f(simUTime, t);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const tmp = fluidRead;
  fluidRead = fluidWrite;
  fluidWrite = tmp;
}

if (fluidEnabled) {
  for (let i = 0; i < prewarmSteps; i++) {
    stepFluid(startTimeOffset + i * prewarmStepSize);
  }
}

function render(now){
  const t = startTimeOffset + (now - start) * 0.0030;

  stepFluid(t);

  gl.useProgram(renderProgram);
  bindQuad(renderProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, fluidTex[fluidRead]);
  gl.uniform1i(uFluid, 0);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform1f(uTime, t);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  logoAnimationFrameId = requestAnimationFrame(render);
}

let logoAnimationFrameId = requestAnimationFrame(render);
let logoAnimationStopped = false;

function stopLogoAnimation(){
  if (logoAnimationStopped) return;
  logoAnimationStopped = true;
  cancelAnimationFrame(logoAnimationFrameId);
  window.removeEventListener('resize', resize);
  fluidTex.forEach(texture => gl.deleteTexture(texture));
  fluidFbo.forEach(framebuffer => gl.deleteFramebuffer(framebuffer));
  gl.deleteBuffer(buffer);
  gl.deleteProgram(simProgram);
  gl.deleteProgram(renderProgram);
}

};

function initialiseApokalisAnimationWhenReady() {
	
	if ( ! document.getElementById( 'gl' ) ) return false;
	
	window.initApokalisAnimation();
	
	return true;
	
}

if ( ! initialiseApokalisAnimationWhenReady() ) {
	
	var apokalisAnimationObserver = new MutationObserver( function() {
		
		if ( initialiseApokalisAnimationWhenReady() ) {
			
			apokalisAnimationObserver.disconnect();
			
		}
		
	} );
	
	apokalisAnimationObserver.observe( document.documentElement, {
		childList: true,
		subtree: true
	} );
	
}
