//AI for melee combat
//Target - the target the AI will react to (usually the player)
//Speed - walk speed
//IdleAnim - idle animation
//WalkAnim - walk animation
//DeathAnim - death animation
//ActivateLen - when the length between AI and Target is less than this number the AI will actiavte and follow the player
//MeleeRange - AI will attack if length between AI and player is eq or lower than this number
//MaxRange - when length between AI and player is eq or larger AI will return to Idle mode
//MeleeAnimTime - duration of melee attack
//MeleeWait - duration spent waiting until next melee attack
//AOffset - For some reason with the AI moveto command the characer stops before reaching the destination, 
//this offset fixes this bug. Its best to keep it at this number. If the AI can't reach player raise this value.
//ActionOnAttack - action to invoke every time AI does melee attack
//ActionOnDie - action to invoke when AI dies (hp is less than or equal to 0)
//ActionOnSpawn - action to invoke when AI spawns on map
//
//Usage
//1.Create an animated Entity
//2.Set 'AI for melee combat' as a behavior, set parameters as required.
//3.To give AI health: Set a 'Game Actor with Health' behavior, then set the mode to 'This is a Player', leave parameters as default other than the health
//4.Set a 'Collide when moved' behaviour if nesscary. 

/*
	<behavior jsname="behavior_meleeAI" description="AI for melee combat">
		<property name="Target" type="scenenode" />
		<property name="Speed" type="float" default="0.03" />
		<property name="IdleAnim" type="string" default="Idle" />
		<property name="WalkAnim" type="string" default="Walk" />
		<property name="AttackAnim" type="string" default="Attack" />
		<property name="DeathAnim" type="string" default="Die" />
		<property name="ActivateLen" type="float" default="50" />
		<property name="MeleeRange" type="float" default="10" />
		<property name="MaxRange" type="float" default = "200" />
		<property name="MeleeAnimTime" type="float" default= "800" />
		<property name="MeleeWait" type="float" default="1000" />
		<property name="AOffset" type="float" default="20" />
		<property name="ActionOnAttack" type="action" />
		<property name="ActionOnDie" type="action" />
		<property name="ActionOnSpawn" type="action" />
	</behavior>
*/

behavior_meleeAI = function(){
	this.mode = 0;
	this.LastTime = null;
	this.NextTime = 0;
	this.didAction = false;
	this.didDieAction = false;
}

behavior_meleeAI.prototype.onAnimate = function(currentnode, timeMs){
	if (this.LastTime == null){
		this.LastTime = timeMs; // we were never called before, so store the time and cancel
		ccbInvokeAction(this.ActionOnSpawn);
		return false;
	}
	
	var timeDiff = timeMs - this.LastTime;
	this.LastTime = timeMs;
	var mspassed = timeDiff
	if (timeDiff > 200) timeDiff = 200;
	
	var targetpos = ccbGetSceneNodeProperty(this.Target, "Position")
	var mepos = ccbGetSceneNodeProperty(currentnode, "Position");	
	var tmp = mepos.substract(targetpos);
	var len = tmp.getLength();
	
	var mode_idle=	0;
	var mode_appr=	1;
	var mode_attack=2;
	var mode_wait=	3;
	var mode_die =  4;
	
	var this_health_varstr = "#" + ccbGetSceneNodeProperty(currentnode,"Name") + ".health";
	if (ccbGetCopperCubeVariable(this_health_varstr)<=0){
		this.mode = mode_die;
	}
	
	if(this.mode == mode_die){
		if (this.didDieAction == false){
			this.didDieAction = true;
			ccbInvokeAction(this.ActionOnDie);
		}
		ccbSetSceneNodeProperty(currentnode, 'Animation', this.DeathAnim);ccbSetSceneNodeProperty(currentnode, 'Looping', false);
	}else if(this.mode == mode_idle){
		if (len<=this.ActivateLen){
			this.mode = mode_appr;
		}
		//Animate Idle
		ccbSetSceneNodeProperty(currentnode, 'Animation', this.IdleAnim);ccbSetSceneNodeProperty(currentnode, 'Looping', true);
	}else if(this.mode == mode_appr){
		if (len>=this.MaxRange){
			this.mode = mode_idle;
		}else if (len<=this.MeleeRange){
			this.mode = mode_attack;
			this.NextTime = this.MeleeAnimTime + timeMs; //set time when to finish attack
		}else{
			var currentRot = ccbGetSceneNodeProperty(currentnode, 'Rotation');	
			var pos = ccbGetSceneNodeProperty(currentnode, 'Position');
			var directionForward = new vector3d(0.0,0,0.0);
			var lengthToGo = 0.0;
			var bMovingForward = false;
			directionForward = targetpos.substract(pos);
			directionForward.Y = 0 ;
			lengthToGo = directionForward.getLength();
			bMovingForward = lengthToGo > (this.Speed * 200);
			bMovingForward = true;
			if (bMovingForward){
				//make it go the other way by making directionForward.x and z plus instead of minus
				var angley = Math.atan2(-directionForward.x, -directionForward.z) * (180.0 / 3.14159265358);
				if (angley < 0.0) angley += 360.0;
				if (angley >= 360.0) angley -= 360.0;
				ccbSetSceneNodeProperty(currentnode, 'Rotation', 0.0, angley, 0.0);
				
				//move forward/backward
				var speed = this.Speed * timeDiff;
				directionForward.normalize();
				pos.x += directionForward.x * speed;
				pos.y += directionForward.y * speed;
				pos.z += directionForward.z * speed;
			}
			ccbSetSceneNodeProperty(currentnode, 'Position', pos); 
			
			//Animate Walk
			ccbSetSceneNodeProperty(currentnode, 'Animation', this.WalkAnim);ccbSetSceneNodeProperty(currentnode, 'Looping', true);
		}
	}else if(this.mode == mode_attack){
		if (timeMs >= this.NextTime){
			this.didAction=false;	//reset didAction
			this.NextTime = timeMs + this.MeleeWait;
			this.mode = mode_wait;
		}
		
		//do action halfway of melee
		if (this.didAction==false && timeMs >= this.NextTime - this.MeleeAnimTime/2){
			this.didAction=true;
			ccbInvokeAction(this.ActionOnAttack);
		}
		
		//reduce player health
		//var target_health_varstr = "#" + ccbGetSceneNodeProperty(this.Target,"Name") + ".health";
		//print(ccbGetCopperCubeVariable(target_health_varstr));
		
		//Animate Attack
		ccbSetSceneNodeProperty(currentnode, 'Animation', this.AttackAnim);ccbSetSceneNodeProperty(currentnode, 'Looping', true);
	}else if(this.mode == mode_wait){//wait
		if (timeMs >= this.NextTime){
			this.NextTime = this.MeleeAnimTime + timeMs; 
			this.mode = mode_attack;
		}
		
		if (len>this.MeleeRange){
			//reapproach player if moved out of range
			this.mode = mode_appr;
		}
		
		//Animate Idle
		ccbSetSceneNodeProperty(currentnode, 'Animation', this.IdleAnim);ccbSetSceneNodeProperty(currentnode, 'Looping', true);
	}
}
