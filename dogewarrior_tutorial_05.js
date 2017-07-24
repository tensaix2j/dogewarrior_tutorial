

function DogeWarrior() {

	
	this.init = function() {
		
		this.setting_walking_speed  		= 4;
		this.setting_walkcycle_interval 	= 3;
		this.setting_jump_height 			= 22.0;
		this.setting_gravity 				= 1.1;
		this.setting_jump_xdistance 		= 6.0;
	
		
		this.canvas = document.getElementById("cv");
		this.canvas.style.backgroundColor = "#777777";
		this.canvas.width  = 1000 ;
	    this.canvas.height = 600 ;
	    this.ctxt = this.canvas.getContext('2d');
		this.resource_loaded = 0;
		this.total_resource = 2;
		
		this.player = {};
		this.player.x 		= 0;
		this.player.y 		= 0;
		this.player.width 	= 120;
		this.player.height 	= 120;
		this.player.framex  = 0;
		this.player.framey  = 0;
		this.player.width_head = 40;
		this.player.height_head = 40;
		this.player.framex_head = 0;
		this.player.framey_head = 0;
		this.player.head_offsetx = 60;
		this.player.head_offsety = 37;
		this.player.control_direction 	= [0,0,0,0];
		this.player.tick = 0;
		this.player.falling = 0;
		this.player.walking = 0;
		this.player.direction = 0;


			

		this.camera = {};
		this.camera.x = -this.canvas.width / 2;
		this.camera.y = -this.canvas.height / 2;


		this.load_resources();
		this.bind_keyboard_events();	
	}






	this.bind_keyboard_events = function() {

		var dw = this;
		document.addEventListener("keydown" , function( evt ) {
			dw.on_keyDown( evt );
		}, false );	

		
		document.addEventListener("keyup"   , function( evt ) {
			dw.on_keyUp( evt );
		}, false );	
	}




	this.on_keyDown = function( evt ) {
		var keyCode = evt.which?evt.which:evt.keyCode; 
		keyCode = this.wasd_to_arrow(keyCode);
		
		if ( keyCode >= 37 && keyCode <= 40 ) {
			this.player.control_direction[ keyCode - 37 ] = 1 ;
		}	

	}	





	this.on_keyUp = function( evt ) {
		var keyCode = evt.which?evt.which:evt.keyCode; 
		keyCode = this.wasd_to_arrow(keyCode);
		if ( keyCode >= 37 && keyCode <= 40 ) {
			this.player.control_direction[ keyCode - 37 ] = 0 ;
		}
	}





	this.wasd_to_arrow = function( keyCode ) {

		var newKeyCode = keyCode ;
		if ( keyCode == 65 ) { newKeyCode = 37; }
    	if ( keyCode == 68 ) { newKeyCode = 39; }
    	if ( keyCode == 87 ) { newKeyCode = 38; }
    	if ( keyCode == 83 ) { newKeyCode = 40; }
		return newKeyCode;
	}	





	this.load_resources = function(){

		var dw = this;	
		this.sprite_mainchar_body = new Image();
		this.sprite_mainchar_body.src = 'images/dogewarrior_body.png';
		this.sprite_mainchar_body.addEventListener('load', function() {
			dw.on_load_completed();
		}, false);

		this.sprite_mainchar_head = new Image();
		this.sprite_mainchar_head.src = "images/dogewarrior_head.png";
		this.sprite_mainchar_head.addEventListener('load', function() {
			dw.on_load_completed();
		}, false);

		
			
	}







	this.on_load_completed = function() {

		var dw = this;
		this.resource_loaded += 1;
		this.update_loading_screen();
		
		if ( this.resource_loaded == this.total_resource ) {
			console.log("Loading Completed");
			dw.on_timer();
			
		} 
	}






	this.update_loading_screen = function() {

		var percent_complete = ( this.resource_loaded * 100.0 / this.total_resource).toFixed(2);
		this.ctxt.clearRect( 0,0, this.canvas.width , this.canvas.height );
		this.ctxt.fillStyle = "white";
		this.ctxt.font = "14px Comic Sans MS";
		var msg = "Loading Resources . " + percent_complete + "% loaded";
		this.ctxt.fillText( msg , this.canvas.width / 2 - msg.length * 6 / 2 , this.canvas.height /2 );
	}





	this.update_player_animation = function() {
		
		// Walking frames
		if ( this.player.walking > 0 ) {
			if ( this.player.direction == 0 ) {
				this.player.framey = 0;
				this.player.framey_head = 0;
				this.player.framex_head = 0;
				
				if ( this.player.tick >  this.setting_walkcycle_interval ) {
					this.player.framex  = (this.player.framex + 1 ) % 8 ;
					this.player.tick = 0;
				}
				// Bobbing the head
				this.player.head_offsetx = 61 + [  1, -2, -1, -2,  -1, -1 ,  0 ,-2  ][ this.player.framex ];
				this.player.head_offsety = 35 + [  3,  1, -2,  1,  5,  0 , -2,  2   ][ this.player.framex ];
			} else {
				this.player.framey = 1;
				this.player.framey_head = 1;
				this.player.framex_head = 3;	
				
				if ( this.player.tick > this.setting_walkcycle_interval ) {
					this.player.framex  = (this.player.framex + 7 ) % 8 ;
					this.player.tick = 0;
				}
				// Bobbing the head
				this.player.head_offsetx = 59 - [  1, -2, -1, -2,  -1, -1 ,  0 ,-2  ][ 7 - this.player.framex ];
				this.player.head_offsety = 35 + [  3,  1, -2,  1,  5,  0 ,  -2,  2   ][ 7 - this.player.framex ];
			}
		}

		// Jumping frames
		if ( this.player.falling > 0 ) {
			
			
			this.player.framey 		= 4 + this.player.direction;
			this.player.framey_head = this.player.direction;
			this.player.framex_head = this.player.direction == 1 ? 3 : 0;	

			if ( this.player.direction == 0 ) {
				this.player.head_offsetx = 59 ;
				if ( this.player.tick == 0 ) {
					this.player.framex  = 0;
				} else {
					if ( this.player.tick > this.setting_walkcycle_interval + 1 ) {
						this.player.framex += 1 ;
						if ( this.player.framex >= 3 ) {
							this.player.framex = 3;
						}
						this.player.tick = 1;
					}
				}
			} else if ( this.player.direction == 1 ) {

				this.player.head_offsetx = 64 ;
				if ( this.player.tick == 0 ) {
					this.player.framex  = 3;
				} else {
					if ( this.player.tick > this.setting_walkcycle_interval + 1 ) {
						this.player.framex -= 1 ;
						if ( this.player.framex < 0 ) {
							this.player.framex = 0;
						}
						this.player.tick = 1;
					}
				}
			}
			this.player.head_offsety = 33 ;
		}




		// Idling frames
		if ( this.player.walking == 0 && this.player.falling == 0 ) {

			this.player.framex = this.player.framex % 4;
			this.player.framey = 2  + this.player.direction ;
				
			if ( this.player.tick > 12 ) {

				if ( this.player.direction == 0 ) {
					this.player.framex  = (this.player.framex + 1 ) % 4 ;
				} else {
					this.player.framex  = ( this.player.framex + 3 ) % 4;
				}
				this.player.tick = 0;

			}

			if ( this.player.direction == 0 ) {
				this.player.head_offsetx = 61 + [ -1,  0,  0,  0   ][ this.player.framex] ;
				this.player.head_offsety = 34 + [  3,  2,  0,  2   ][ this.player.framex ];
			} else {
				this.player.head_offsetx = 59 + [  1,  0,  0,  0    ][ 3 - this.player.framex] ;
				this.player.head_offsety = 34 + [  3,  2,  0,  2    ][ 3 - this.player.framex ];
			}
			
		}
		this.player.tick += 1;	
	}


	//-----------
	this.update_player_action = function() {

		if ( this.player.falling > 0 ) {
			
			if ( this.player.y > 0 ) {
				this.player.y = 0;
				this.player.falling = 0;
				
			} else {
				this.player.fallingspeed += this.setting_gravity;
				this.player.y +=    this.player.fallingspeed  ;
			}
		}


		if ( this.player.control_direction[1] == 1 ) {
			if ( this.player.falling == 0 ) {
				
				// Initiate velocity
				this.player.fallingspeed = -1.0 * this.setting_jump_height ;
				this.player.falling 	= 1;
				this.player.tick 		= 0;
			}	
		}	

		this.player.walking = 0;
		if ( this.player.control_direction[0] == 1 ) {

			if ( this.player.falling > 0 ) {
				this.player.x -= this.setting_jump_xdistance;
			} else {			
				this.player.x -=  this.setting_walking_speed;;
				this.player.walking = 1;
			
			}
			this.player.direction = 0;
				

		} else if ( this.player.control_direction[2] == 1 ) {
			
			if ( this.player.falling > 0 ) {
				this.player.x += this.setting_jump_xdistance;
			} else {
				this.player.x += this.setting_walking_speed;
				this.player.walking = 1;
			}	
			this.player.direction = 1;
			
		} 
	}



	this.on_update = function() {

		this.update_player_action();
		this.update_player_animation();
		
	}






	this.on_timer = function() {
		
		this.on_update();
		this.on_draw();

		var dw = this;
		window.requestAnimationFrame( function() {
			dw.on_timer();
		});
	}






	this.on_draw = function() {

		this.ctxt.clearRect( 0,0, this.canvas.width , this.canvas.height );

		// Draw Main Characters
		this.ctxt.drawImage( this.sprite_mainchar_body , 
							   		this.player.width  * this.player.framex , 
							   		this.player.height * this.player.framey , 
							   		this.player.width , 
							   		this.player.height , 
							   this.player.x - this.camera.x - this.player.width / 2, 
							   this.player.y - this.camera.y - this.player.height / 2,  
							   this.player.width , 
							   this.player.height );
		
		this.ctxt.drawImage( this.sprite_mainchar_head , 
							   		this.player.width_head * this.player.framex_head,
							   		this.player.height_head * this.player.framey_head,
							   		this.player.width_head,
							   		this.player.height_head,
							   	this.player.x - this.camera.x + this.player.head_offsetx - this.player.width / 2  - this.player.width_head / 2 ,
							   	this.player.y - this.camera.y + this.player.head_offsety - this.player.height / 2 - this.player.height_head / 2 ,
							   	this.player.width_head,
							   	this.player.height_head,
							   	);
	}
		

	
}







document.addEventListener("DOMContentLoaded", function() {
	var dw = new DogeWarrior();
	dw.init();
});


