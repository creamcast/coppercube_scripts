// This is a coppercube behavior which lets an object behave as in a third person shooter mode:
// Rotates the character to where the mouse is, moves with cursor keys. Camera follows automatically if set.
// Attach this behavior to a character and set the camera in the behavior for it to work.
//
// The following embedded xml is for the editor and describes how the behavior can be edited:
// Supported types are: int, float, string, bool, color, vect3d, scenenode, texture, action
/*
	<behavior jsname="behavior_thirdPersonShooter" description="Third person shooter player">
		<property name="Camera" type="scenenode" />
		<property name="Speed" type="float" default="0.03" />
		<property name="JumpSpeed" type="float" default="0.1" />
		<property name="JumpLengthMs" type="int" default="200" />
		<property name="JumpSpeedForward" type="float" default="0.1" />
		<property name="RotateSpeed" type="float" default="300" />		
		<property name="StandAnimation" type="string" default="stand" />
		<property name="WalkAnimation" type="string" default="walk" />
		<property name="JumpAnimation" type="string" default="jump" />
	</behavior>
*/

Matrixhelper = function(bMakeIdentity)
{
	if (bMakeIdentity == null)
		bMakeIdentity = true;
		
	this.m00 = 0;
	this.m01 = 0;
	this.m02 = 0;
	this.m03 = 0;
	this.m04 = 0;
	this.m05 = 0;
	this.m06 = 0;
	this.m07 = 0;
	this.m08 = 0;
	this.m09 = 0;
	this.m10 = 0;
	this.m11 = 0;
	this.m12 = 0;
	this.m13 = 0;
	this.m14 = 0;
	this.m15 = 0;
	
	this.bIsIdentity=false;
	
	if (bMakeIdentity)
	{
		this.m00 = 1;
		this.m05 = 1;
		this.m10 = 1;
		this.m15 = 1;
		this.bIsIdentity = true;
	}
}

Matrixhelper.prototype.rotateVect = function(v)
{
	var tmp = new vector3d(v.x, v.y, v.z);
	v.x = tmp.x*this.m00 + tmp.y*this.m04 + tmp.z*this.m08;
	v.y = tmp.x*this.m01 + tmp.y*this.m05 + tmp.z*this.m09;
	v.z = tmp.x*this.m02 + tmp.y*this.m06 + tmp.z*this.m10;
}

Matrixhelper.prototype.setRotationDegrees = function(v)
{
	var c = 3.14159265359 / 180.0;
	v.x *= c;
	v.y *= c;
	v.z *= c;
	this.setRotationRadians(v);
}

Matrixhelper.prototype.setRotationRadians = function(rotation)
{
	var cr = Math.cos( rotation.x );
	var sr = Math.sin( rotation.x );
	var cp = Math.cos( rotation.y );
	var sp = Math.sin( rotation.y );
	var cy = Math.cos( rotation.z );
	var sy = Math.sin( rotation.z );

	this.m00 = ( cp*cy );
	this.m01 = ( cp*sy );
	this.m02 = ( -sp );

	var srsp = sr*sp;
	var crsp = cr*sp;

	this.m04 = ( srsp*cy-cr*sy );
	this.m05 = ( srsp*sy+cr*cy );
	this.m06 = ( sr*cp );

	this.m08 = ( crsp*cy+sr*sy );
	this.m09 = ( crsp*sy-sr*cy );
	this.m10 = ( cr*cp );
	
	this.bIsIdentity = false;
}


behavior_thirdPersonShooter = function()
{
	this.ForwardKeyDown = false;
	this.BackKeyDown = false;
	this.PressedJump = false;
	this.LastTime = null;
	this.LastTimeCamera = null;
	this.JumpForce = 0;
	this.JumpLengthMs = 1000;
	
	this.leftKeyDown = false;
	this.rightKeyDown = false;
	this.jumpKeyDown = false;
	this.downKeyDown = false;
	this.upKeyDown = false;
	
	this.loopJumpAnimation = false;
	
	this.CameraDelta = new vector3d(0,0,0);
	this.CamStartPosY = 0;
};

behavior_thirdPersonShooter.prototype.doCameraMovement = function(camera, node, timeMs)
{
	// get the time since the last frame
	
	if (this.LastTimeCamera == null)
	{
		this.LastTimeCamera = timeMs;
		var camPos = ccbGetSceneNodeProperty(camera, 'Position');
		var objPos = ccbGetSceneNodeProperty(node, 'Position');
		this.CameraDelta =  camPos.substract(objPos);
		this.CamStartPosY = camPos.y;
		return;
	}
	
	// calculate time delta
	
	var delta = timeMs - this.LastTimeCamera;
	this.LastTimeCamera = timeMs;
	if (delta > 200) delta = 200;
	
	// follow object
	
	var objPos = ccbGetSceneNodeProperty(node, 'Position');
	var newPos = objPos.add(this.CameraDelta);
	newPos.y = this.CamStartPosY;
	
	ccbSetSceneNodeProperty(camera, 'Position', newPos);
	ccbSetSceneNodeProperty(camera, 'Target', objPos);
}

behavior_thirdPersonShooter.prototype.dotProduct = function(a, b)
{
	return a.x*b.x + a.y*b.y + a.z*b.z;
}

behavior_thirdPersonShooter.prototype.getPlaneIntersection = function(planey, linepoint, linevect)
{
	var planenormal = new vector3d(0,1,0);	
	var planed = - planey*planenormal.y;
	
	var t2 = this.dotProduct(planenormal, linevect);
	if (t2==0)
		return null;
		
	var t = - (this.dotProduct(planenormal, linepoint) + planed) / t2;
	var linev2 = new vector3d(linevect.x * t, linevect.y * t, linevect.z * t);	
	return linepoint.add(linev2);
}

// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// Returns 'true' if something changed, and 'false' if not.
behavior_thirdPersonShooter.prototype.onAnimate = function(currentnode, timeMs)
{
	this.doCameraMovement(this.Camera, currentnode, timeMs);
	
	// get the time since the last frame
	
	if (this.LastTime == null)
	{
		this.LastTime = timeMs; // we were never called before, so store the time and cancel
		return false;
	}
		
	var node = currentnode;
	var camera = this.Camera;	
	
	var timeDiff = timeMs - this.LastTime;
	this.LastTime = timeMs;
	if (timeDiff > 200) timeDiff = 200;
	
	
	// calculate collision with mouse
	
	var mouseX = ccbGetMousePosX();
	var mouseY = ccbGetMousePosY();
	var camerapos = ccbGetSceneNodeProperty(camera, 'Position');
	var playerpos = ccbGetSceneNodeProperty(node, 'Position');
	var clickpos = ccbGet3DPosFrom2DPos(mouseX, mouseY);
	var mouseposonground = this.getPlaneIntersection(playerpos.y, camerapos, 
		new vector3d(clickpos.x - camerapos.x,clickpos.y - camerapos.y,clickpos.z - camerapos.z));
		
	// rotate player to mouse pos on ground
	
	if (mouseposonground != null)
	{
		var directionForward = mouseposonground.substract(playerpos);
		directionForward.y = 0.0;
		var lengthToGo = directionForward.getLength();
		var bMovingForward = lengthToGo > 1;
						
		if (bMovingForward)
		{
			var angley = Math.atan2(directionForward.x, directionForward.z) * (180.0 / 3.14159265358);

			if (angley < 0.0) angley += 360.0;
			if (angley >= 360.0) angley -= 360.0;
				
			currentRot = new vector3d(0.0, angley, 0.0);
		}
	}
	
	ccbSetSceneNodeProperty(node, 'Rotation', currentRot);	
	
	// rotate player
	
	/*
	var currentRot = ccbGetSceneNodeProperty(node, 'Rotation');	

	if (this.leftKeyDown)
	{
		currentRot.y -= timeDiff * this.RotateSpeed * 0.001;
	}

	if (this.rightKeyDown)
	{
		currentRot.y += timeDiff * this.RotateSpeed * 0.001;
	}
	
	ccbSetSceneNodeProperty(node, 'Rotation', currentRot);	
	*/
	

	// move forward/backward

	var pos = ccbGetSceneNodeProperty(node, 'Position');

	var matrot = new Matrixhelper();
	matrot.setRotationDegrees(currentRot);
	var directionForward = new vector3d(0.0, 0.0, 1.0);

	//var matrot2 = new Matrixhelper();
	//matrot2.setRotationDegrees(this.AdditionalRotationForLooking);
	//matrot = matrot.multiply(matrot2);

	matrot.rotateVect(directionForward);

	var speed = this.Speed * timeDiff;
	var origSpeed = 0;
			
	var bBackward = this.downKeyDown;
	var bForward = this.upKeyDown;
	
	
	directionForward.normalize();
	directionForward.x *= speed;
	directionForward.y *= speed;
	directionForward.z *= speed;

	if (bForward || bBackward) // || (this.UseAcceleration && this.AcceleratedSpeed != 0))
	{
		var moveVect = new vector3d(directionForward.x, directionForward.y, directionForward.z);

		if (bBackward || (!(bForward || bBackward))) // && !this.AccelerationIsForward))
		{
			moveVect.x *= -1;
			moveVect.y *= -1;
			moveVect.z *= -1;
		}

		pos.x += moveVect.x;
		pos.y += moveVect.y;
		pos.z += moveVect.z;
	}
	
	if (this.JumpForce > 0)
	{
		ccbSetSceneNodeProperty(node, 'Animation', this.JumpAnimation);		
		if (!this.loopJumpAnimation)
			ccbSetSceneNodeProperty(node, 'Looping', false);
	}
	else
	if (bForward || bBackward)
	{
		ccbSetSceneNodeProperty(node, 'Animation', this.WalkAnimation);
		ccbSetSceneNodeProperty(node, 'Looping', true);
	}
	else
	{
		ccbSetSceneNodeProperty(node, 'Animation', this.StandAnimation);
		ccbSetSceneNodeProperty(node, 'Looping', true);
	}
	
	
	// jump if jump was pressed
	
	if (this.PressedJump && this.JumpForce == 0)
	{
		this.PressedJump = false;
		this.JumpForce = this.JumpLengthMs;
	}
		
	if (this.JumpForce > 0)
	{
		pos.y += this.JumpSpeed * timeDiff;
		this.JumpForce -= timeDiff;
		
		if (this.JumpForce < 0) 
			this.JumpForce = 0;
			
		if (this.JumpSpeedForward > 0)
		{
			directionForward.normalize();
			directionForward.x *= this.JumpSpeedForward;
			directionForward.y *= this.JumpSpeedForward;
			directionForward.z *= this.JumpSpeedForward;
			
			pos.x += directionForward.x;
			pos.y += directionForward.y;
			pos.z += directionForward.z;
		}
	}
	
	// set position
	
	ccbSetSceneNodeProperty(node, 'Position', pos);
	
	return true;
}

// parameters: key: key id pressed or left up.  pressed: true if the key was pressed down, false if left up
behavior_thirdPersonShooter.prototype.onKeyEvent = function(code, down)
{
	// store which key is down
	// key codes are this: left=37, up=38, right=39, down=40

	if (code == 37 || code == 65 )
	{
		this.leftKeyDown = down;
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.rightKeyDown = false;
		return true;
	}
		
	if (code == 39 || code == 68 )
	{
		this.rightKeyDown = down;
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.leftKeyDown = false;
		return true;
	}
		
	if (code == 38 || code == 87 )
	{
		this.upKeyDown = down;			
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.downKeyDown = false;
		return true;
	}
		
	if (code == 40 || code == 83 )
	{
		this.downKeyDown = down;
		
		// fix chrome key down problem (key down sometimes doesn't arrive)
		if (down) this.upKeyDown = false;
		return true;
	}
		
	// jump when space pressed
	
	if (code == 32 && down)
		this.PressedJump = true;
}


// mouseEvent: 0=move moved, 1=mouse clicked, 2=left mouse up,  3=left mouse down, 4=right mouse up, 5=right mouse up
behavior_thirdPersonShooter.prototype.onMouseEvent = function(mouseEvent, mouseWheelDelta)
{
	// we currently don't support move event. But for later use maybe.
}
