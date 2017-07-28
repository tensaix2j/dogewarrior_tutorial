

function DogeWarrior() {

	
	this.init = function( level ) {
		
		this.level = level;

		this.setting_walking_speed  		= 4;
		this.setting_walkcycle_interval 	= 3;
		this.setting_jump_height 			= 22.0;
		this.setting_gravity 				= 1.1;
		this.setting_jump_xdistance 		= 6.0;
		this.setting_minblocksize 			= 40;
		
		this.canvas = document.getElementById("cv");
		this.canvas.style.backgroundColor = "#000000";
		this.canvas.width  = 1000 ;
	    this.canvas.height = 600 ;
	    this.ctxt = this.canvas.getContext('2d');
		this.resource_loaded = 0;
		this.total_resources = 4;
		
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

		this.player.box_collider = {}
		this.player.box_collider.width = 34;
		this.player.box_collider.height = 75;


		this.camera = {};
		this.camera.x = -this.canvas.width / 2;
		this.camera.y = -this.canvas.height / 2;


		this.load_resources();
		this.bind_keyboard_events();	
	}


	this.update_box_collider = function() {

		this.player.box_collider.x = this.player.x - 16;
		this.player.box_collider.y = this.player.y - 22;
		
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

		console.log( this.level );

		this.loadJSON("maps/level" + this.level + ".json?",function( map ) {
			dw.map = map;
			dw.load_map_resources();
			dw.on_load_completed();
		}, false); 
	
			
	}

	



	this.loadJSON = function( path, success, error ) {
	    
	    var xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = function() {
	        if (xhr.readyState === XMLHttpRequest.DONE) {
	            if (xhr.status === 200) {
	                if (success)
	                    success(JSON.parse(xhr.responseText));
	            } else {
	                if (error)
	                    error(xhr);
	            }
	        }
	    };
	    xhr.open("GET", path, true);
	    xhr.send();
	}

	







	// Each map has different png for bgtiles, objtiles and monsters .. load based on map
	this.load_map_resources = function() {
	
		var dw = this;
		var imagePath = "images";

		for ( var i = 0 ; i <  this.map.tilesets.length ; i++ ) {
			if ( this.map.tilesets[i].name == "bgtiles" ) {

				// Tiles
				this.sprite_bgtiles = new Image();
				this.sprite_bgtiles.src = imagePath + "/" + this.baseName( this.map.tilesets[i].image  );
				this.sprite_bgtiles.addEventListener('load', function() {
					dw.on_load_completed();
				},false);
			} 
		}

		// Create a map of layer name to layer index for easy lookup
		this.layer_id = {};
		for ( var i = 0 ; i < this.map.layers.length ; i++ ) {
			this.layer_id[ this.map.layers[i].name ] = i;
		}

		// Get how many tile items per row
		this.setting_minblocksize  	= this.map.tilesets[ this.layer_id["background"] ].tilewidth;
		this.setting_bgtiles_x 		= this.map.tilesets[ this.layer_id["background"] ].imagewidth /  this.setting_minblocksize;

	}








	// Util functions
	this.baseName = function(str) {
		var base = new String(str).substring(str.lastIndexOf('/') + 1); 
		return base;
	}

	this.rand = function( x ) {

		return Math.random() * x >> 0;

	}

	this.clone = function(obj) {

	    if(obj == null || typeof(obj) != 'object')
	        return obj;

	    var temp = {};// changed

	    for(var key in obj) {
	        if(obj.hasOwnProperty(key)) {
	            
	            if ( key == "properties" ) {
	            	temp[key] = {}
	            	for ( var property in obj[key] ) {
	            		temp[key][property] = obj[key][property];
	            	}
	            } else {
	            	temp[key] = obj[key];
	        	}
	        }
	    }
	    return temp;
	}
	



	


	this.collide_with_wall = function( box_collider , direction, delta  ) {

		for ( var j = 0 ; j < 3 ; j++ ) {

			var pof_x = null;
			var pof_y = null;

			if ( direction == 3 ) {

				pof_x = box_collider.x + j * ( box_collider.width - 1) / 2 ;
				pof_y = box_collider.y +     box_collider.height  + delta ;

			} else if ( direction == 1 ) {
			
				pof_x = box_collider.x + j * ( box_collider.width - 1) / 2 ;
				pof_y = box_collider.y + delta ;


			} else if (direction == 0 ) {
				
				pof_x = box_collider.x + delta ;
				pof_y = box_collider.y + j * ( box_collider.height - 1) / 2  ;


			} else if ( direction == 2 ) {

				pof_x = box_collider.x +  box_collider.width + delta ;
				pof_y = box_collider.y + j * ( box_collider.height - 1) / 2 ;
			}		




			if ( pof_x != null && pof_y != null  &&  this.map.layers ) {
				
				var pof_tile_y = pof_y / this.setting_minblocksize >> 0;
		    	var pof_tile_x = pof_x / this.setting_minblocksize >> 0;

		    	// Static foreground
				for ( var k = pof_tile_y - 2 ; k <  pof_tile_y + 2 ; k++ ) {
					for ( var l = pof_tile_x  - 2 ; l < pof_tile_x + 2 ; l++ ) {

			
						var data = this.map.layers[ this.layer_id["foreground"] ].data[ k * this.map.layers[ this.layer_id["foreground"] ].width + l ];

						if ( data > 0 ) {

							if ( pof_x >= l * this.setting_minblocksize  && pof_x <= (l + 1) * this.setting_minblocksize  && 
								 pof_y >= k * this.setting_minblocksize  && pof_y <= (k + 1) * this.setting_minblocksize  ) {

								if ( direction == 3  ) {
									return pof_y - k * this.setting_minblocksize ;

								} else if ( direction == 1 ) {

									return ( k + 1 ) * this.setting_minblocksize - pof_y ;
								
								} else if ( direction == 0  || direction == 2) {

									return l;
									
								} 

							}
						}
					}
				}

			}


		}
		
		return 0;	
	}	





	this.on_load_completed = function() {

		this.resource_loaded += 1;
		this.update_loading_screen();
		
		if ( this.resource_loaded == this.total_resources ) {
			
			console.log("Loading Completed");
			this.reinit_game();
			this.on_timer();
			
		} 
	}



	this.reinit_game = function() {

		this.triggers  = [];
		for ( var i = 0 ; i <  this.map.layers[  this.layer_id["trigger"] ]["objects"].length ; i++ ) {
			
			var obj =  this.clone( this.map.layers[  this.layer_id["trigger"] ]["objects"][i] );
			this.triggers.push( obj );

			if ( obj.properties.isLevelStartPosition == 1 ) {
				this.player.x = obj.x ;
				this.player.y = obj.y ;
			}
		}

		this.camera.x = this.player.x - this.canvas.width / 2 ;
		this.camera.y = this.player.y - this.canvas.height / 2;
			
	}


	this.update_loading_screen = function() {

		var percent_complete = ( this.resource_loaded * 100.0 / this.total_resources).toFixed(2);
		this.ctxt.clearRect( 0,0, this.canvas.width , this.canvas.height );
		this.ctxt.fillStyle = "white";
		this.ctxt.font = "14px Comic Sans MS";
		var msg = "Loading Resources . " + percent_complete + "% loaded";
		this.ctxt.fillText( msg , this.canvas.width / 2 - msg.length * 6 / 2 , this.canvas.height /2 );
	}















	this.update_player_action = function() {

		this.update_box_collider();

		if ( this.player.falling > 0 ) {
			
			if ( this.player.fallingspeed > 0 ) {
				// Is falling down
				var excess 	= this.collide_with_wall( this.player.box_collider , 3 , this.player.fallingspeed  ) ;
				if ( excess > 0 ) {
					this.player.y += this.player.fallingspeed - excess ;
					this.player.fallingspeed = 0;
					this.player.falling = 0;
					
				} else {
					this.player.fallingspeed 	+= this.setting_gravity;

					// Terminal velocity
					if ( this.player.upwardspeed > this.setting_minblocksize - 1.0 ) {
						this.player.upwardspeed = this.setting_minblocksize - 1.0 ;
					}

					this.player.y 				+= this.player.fallingspeed  ;
				}
			} else {
				// Jumping up
				var excess 	= this.collide_with_wall( this.player.box_collider , 1 , this.player.fallingspeed  ) ;
				if ( excess > 0 ) {
					// Knocking head
					this.player.fallingspeed = this.setting_gravity;
					this.player.y +=    this.player.fallingspeed - excess ;
					
				} else {
					this.player.fallingspeed 	+= this.setting_gravity;
					this.player.y 				+= this.player.fallingspeed  ;
				}
			}
		
		} else {
			
			// Not falling, check is there any floor holding the player beneath
			var excess 	= this.collide_with_wall( this.player.box_collider , 3 , 0.8  ) ;
			if ( excess == 0  ) {
				this.player.falling 		= 1 ;
				this.player.fallingspeed 	= 0.8;
				this.player.tick 			= 10;	
			} 	
		}


		// Jumping
		if ( this.player.control_direction[1] == 1 ) {
			if ( this.player.falling == 0 ) {
				
				// Initiate velocity
				this.player.fallingspeed = -1.0 * this.setting_jump_height ;
				this.player.falling 	= 1;
				this.player.y 			-= 1;
				this.player.tick 		= 0;
			}	
		}	






		// Walking
		this.player.walking = 0;
		if ( this.player.control_direction[0] == 1 ) {

			var excess = this.collide_with_wall( this.player.box_collider, 0 , this.player.falling > 0 ? - this.setting_jump_xdistance : - this.setting_walking_speed  ) ;
			
			if ( excess <= 0 ) {
				if ( this.player.falling > 0 ) {

					this.player.x -= this.setting_jump_xdistance;
				} else {			
					this.player.x -=  this.setting_walking_speed;;
					this.player.walking = 1;
				
				}
			}
			this.player.direction = 0;
				

		} else if ( this.player.control_direction[2] == 1 ) {
			
			var excess = this.collide_with_wall( this.player.box_collider , 2 , this.player.falling > 0 ?  this.setting_jump_xdistance :  this.setting_walking_speed  ) ;
			if ( excess <= 0 ) {
				if ( this.player.falling > 0 ) {
					this.player.x += this.setting_jump_xdistance;
				} else {
					this.player.x += this.setting_walking_speed;
					this.player.walking = 1;
				}	
			}
			this.player.direction = 1;
			
		} 
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

		// Jumping/falling frames
		if ( this.player.falling > 0 ) {
			
			
			this.player.framey 		= 4 + this.player.direction;
			this.player.framey_head = this.player.direction;
			this.player.framex_head = this.player.direction == 1 ? 3 : 0;	

			if ( this.player.direction == 0 ) {
				this.player.head_offsetx = 59 ;
				if ( this.player.tick == 0 ) {
					this.player.framex  = 0;
				} else if ( this.player.tick > 5 ) {
					this.player.framex = 3;

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

				} else if ( this.player.tick > 5 ) {
					this.player.framex = 0;
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
			this.player.framey_head = this.player.direction;
			this.player.framex_head = this.player.direction == 1 ? 3 : 0;	
	
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








	this.update_camera_position = function() {
		
		//this.camera.x = this.player.x - this.canvas.width / 2 ;
		//this.camera.y = this.player.y - this.canvas.height / 2;

		
		var camera_target_x = this.player.x - this.canvas.width / 2  ;
		this.camera.x += (( camera_target_x - this.camera.x ) / 10 >> 0 );

		var camera_target_y = this.player.y - this.canvas.height / 2 ;
		this.camera.y +=  (( camera_target_y - this.camera.y ) / 10 >> 0 ); 
				
	}


	this.on_update = function() {

		this.update_player_action();
		this.update_player_animation();
		this.update_camera_position();
		
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



		// Draw tiles
		
		var cam_tile_y = this.camera.y / this.setting_minblocksize >> 0;
		var cam_tile_x = this.camera.x / this.setting_minblocksize >> 0;
		var tilex_count = this.canvas.width / this.setting_minblocksize >> 0 ;
		var tiley_count = this.canvas.height / this.setting_minblocksize >> 0 ;

		if ( this.map.layers ) {
			for ( var layer = 0 ; layer < 2 ; layer += 1 ) {

				for ( var i = cam_tile_y - 1; i < cam_tile_y + tiley_count + 2 ; i++ ) {
					for ( var j = cam_tile_x - 1; j < cam_tile_x + tilex_count + 2 ; j++ ) {

						var data =0;
						if ( i >= 0 && j >= 0 && i < this.map.layers[layer].height && j < this.map.layers[layer].width   ) {

							var data = this.map.layers[layer].data[ i * this.map.layers[layer].width + j ];
							
							var tile_framex = ( data % this.setting_bgtiles_x ) - 1;
							var tile_framey = ( data / this.setting_bgtiles_x ) >> 0 ;
							var sprite = this.sprite_bgtiles;

							if ( tile_framex >= 0 && tile_framey >= 0 ) {

								this.ctxt.drawImage( sprite , 
												this.setting_minblocksize * tile_framex,
												this.setting_minblocksize * tile_framey,
												this.setting_minblocksize,
												this.setting_minblocksize,
										(j * this.setting_minblocksize - this.camera.x ) >> 0, 
										(i * this.setting_minblocksize - this.camera.y ) >> 0,
										this.setting_minblocksize,
										this.setting_minblocksize 
											);
							}
					
						}	
					}
				}
			}
		}



		// Draw Main Character
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








