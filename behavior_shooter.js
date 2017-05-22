/*
<behavior jsname="behavior_shooter"  description="When Key Pressed Do Action Plus">
<property name="Key" type="float" default="70" />
<property name="DoAction" type="action" />
<property name="ShootWait" type="float" default="1000" />
<property name="ShootAnim" type="string" default="Attack" />
<property name="IdleAnim" type="string" default="Idle" />
</behavior>
*/

behavior_shooter = function(node){
	this.NextTime = null;
	this.KeyPressed = 0;
	this.mode = 0;
	
	this.LastAnim="";
	this.LastLoop=true;
	
	//this.LastAnim=ccbGetSceneNodeProperty(node, 'Animation');
	//this.LastLoop=ccbGetSceneNodeProperty(node, 'Looping');
};

// called every frame. 
//   'node' is the scene node where this behavior is attached to.
//   'timeMs' the current time in milliseconds of the scene.
// Returns 'true' if something changed, and 'false' if not.
behavior_shooter.prototype.onAnimate = function(currentnode, timeMs){

	if(this.mode==0){//nothing
		if (this.KeyPressed == this.Key){
			ccbInvokeAction(this.DoAction);
			this.NextTime = timeMs + this.ShootWait;
			this.mode=1;
			
			
		}	
//		print(ccbGetSceneNodeProperty(currentnode, 'Animation'));
	}else if(this.mode==1){//wait
		if ( timeMs > this.NextTime ){
			this.mode=0;
			this.KeyPressed = -1;
			ccbSetSceneNodeProperty(currentnode, 'Animation', this.IdleAnim);ccbSetSceneNodeProperty(currentnode, 'Looping', true);
		}
	}
	
	return true;
}

behavior_shooter.prototype.onKeyEvent = function(keyCode, pressed){
	//todo store in 1 0 in array to detect multiple keys
	if (pressed == true) this.KeyPressed = keyCode;
	if (pressed == false) this.KeyPressed = -1;
}