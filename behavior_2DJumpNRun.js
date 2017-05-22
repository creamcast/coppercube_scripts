// This is a coppercube behavior which moves the node it is attached to only on the x axis,
// controlled by the cursor keys and with space for 'jump'.
//
// The following embedded xml is for the editor and describes how the behavior can be edited:
// Supported types are: int, float, string, bool, color, vect3d, scenenode, texture, action
/*
	<behavior jsname="behavior_2DJumpNRun" description="Simple 2D Jump'n'Run Player">
		<property name="Speed" type="float" default="0.02" />
		<property name="JumpSpeed" type="float" default="0.2" />
		<property name="JumpLengthMs" type="int" default="200" />
	</behavior>
*/

behavior_2DJumpNRun = function()
{
	this.ForwardKeyDown = false;
	this.BackKeyDown = false;
	this.PressedJump = false;
	this.LastTime = null;
	this.JumpForce = 0;
	this.JumpLengthMs = 1000;
};

// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// Returns 'true' if something changed, and 'false' if not.
behavior_2DJumpNRun.prototype.onAnimate = function(node, timeMs)
{
	// get the time since the last frame
	
	if (this.LastTime == null)
	{
		this.LastTime = timeMs; // we were never called before, so store the time and cancel
		this.InitPos = ccbGetSceneNodeProperty(node, 'Position');
		this.InitRotation = ccbGetSceneNodeProperty(node, 'Rotation');
		return false;
	}
	
	this.LastNodeUsed = node;
	
	var delta = timeMs - this.LastTime;
	this.LastTime = timeMs;
	if (delta > 200) delta = 200;
	
	// move 
	
	var pos = ccbGetSceneNodeProperty(node, 'Position');
	pos.z = this.InitPos.z; // force to by always on the same 2D axis
	
	if (this.ForwardKeyDown)
	{
		pos.x += this.Speed * delta;
		ccbSetSceneNodeProperty(node, 'Animation', 'walk');
		ccbSetSceneNodeProperty(node, 'Rotation', this.InitRotation);
	}
	else
	if (this.BackKeyDown)
	{
		pos.x -= this.Speed * delta;
		ccbSetSceneNodeProperty(node, 'Animation', 'walk');
		ccbSetSceneNodeProperty(node, 'Rotation', this.InitRotation.x, this.InitRotation.y - 180, this.InitRotation.z);
	}
	else
	{
		// not walking, stand
		
		ccbSetSceneNodeProperty(node, 'Animation', 'stand');
	}
	
	// jump if jump was pressed
	
	if (this.PressedJump && this.JumpForce == 0)
	{
		this.PressedJump = false;
		this.JumpForce = this.JumpLengthMs;
	}
		
	if (this.JumpForce > 0)
	{
		pos.y += this.JumpSpeed * delta;
		this.JumpForce -= delta;
		
		if (this.JumpForce < 0) 
			this.JumpForce = 0;
	}
	
	
	// set position
	
	ccbSetSceneNodeProperty(node, 'Position', pos);
	
	return true;
}

// parameters: key: key id pressed or left up.  pressed: true if the key was pressed down, false if left up
behavior_2DJumpNRun.prototype.onKeyEvent = function(key, pressed)
{
	// store which key is down
	// key codes are this: left=37, up=38, right=39, down=40

	if (key == 37 || key == 40)
		this.BackKeyDown = pressed;
	else	
	if (key == 39 || key == 38)
		this.ForwardKeyDown = pressed;
		
	// jump when space pressed
	
	if (key == 32 && pressed)
		this.PressedJump = true;
}


// mouseEvent: 0=mouse moved, 1=mouse wheel moved, 2=left mouse up,  3=left mouse down, 4=right mouse up, 5=right mouse down
behavior_2DJumpNRun.prototype.onMouseEvent = function(mouseEvent, mouseWheelDelta)
{
	// we currently don't support move event. But for later use maybe.
}
