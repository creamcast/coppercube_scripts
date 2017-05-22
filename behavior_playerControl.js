/*
<behavior jsname="behavior_playerControl"  description="control player">
<property name="Speed" type="float" default="0.01" />
<property name="MoveBy" type="vect3d" default="0.0, 0.0, 0.0" />
<property name="SomeText" type="string" default="Hello World" />
</behavior>
*/

behavior_playerControl = function(node){
	this.LastTime = null;
	this.StartPoint = null;
	this.Forward = false;
	this.Back = false;
	this.TurnLeft = false;
	this.TurnRight = false;
};

// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// Returns 'true' if something changed, and 'false' if not.
behavior_playerControl.prototype.onAnimate = function(node, timeMs){
	if (this.Forward == true){
		var oldPos = ccbGetSceneNodeProperty(node, "Position");
		var moveby = new vector3d(-this.Speed, 0.0, 0);
		var newPos = oldPos.add(moveby);
		ccbSetSceneNodeProperty(node, "Position", newPos);
	}
	
	if (this.Back == true){
		var oldPos = ccbGetSceneNodeProperty(node, "Position");
		var moveby = new vector3d(this.Speed, 0.0, 0);
		var newPos = oldPos.add(moveby);
		ccbSetSceneNodeProperty(node, "Position", newPos);		
	}
	
	if (this.TurnRight == true){
		var oldPos = ccbGetSceneNodeProperty(node, "Rotation");
		var moveby = new vector3d(0, this.Speed, 0);
		var newPos = oldPos.add(moveby);
		ccbSetSceneNodeProperty(node, "Rotation", newPos);		
	}
	
	return true;

}

behavior_playerControl.prototype.onKeyEvent = function(keyCode, pressed){
	var key_s = 83;
	var key_w = 87;
	var key_a = 65;
	var key_d = 68;
	
	//var oldPos = ccbGetSceneNodeProperty(this.ControlNode, "Position");	
	//print(ccbGetSceneNodeProperty(this.ControlNode, "Position"));

	if (keyCode == key_w){
		if (pressed == true) this.Forward = true;
		if (pressed == false) this.Forward = false;
	}
	
	if (keyCode == key_s){
		if (pressed == true) this.Back = true;
		if (pressed == false) this.Back = false;
	}
	
	if (keyCode == key_d){
		if (pressed == true) this.TurnRight = true;
		if (pressed == false) this.TurnRight = false;
	}
}