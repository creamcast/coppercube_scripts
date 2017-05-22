/*
<action jsname="action_shooter" description="Action Shooter">
	<property name="PlayerNode" type="scenenode" />
    <property name="TargetNode" type="scenenode" />
    <property name="DoActionTrue" type="action" />
    <property name="DoActionFalse" type="action" />
    <property name="ShootDelay" type="float" default="1000" />
    <property name="ShootWait" type="float" default="1000" />
    <property name="ShootFOV" type="float" default="80" />
</action>
*/

//==============================================================================
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
//==============================================================================

action_shooter = function(){
	this.mode = 0;
	this.NextTime = 0;
};

action_shooter.prototype.dotProduct = function(a, b)
{
	return a.x*b.x + a.y*b.y + a.z*b.z;
}

// called when the action is executed 
action_shooter.prototype.execute = function(){
	var me = this; 
	this.registeredFunction = function() { me.MainFunc(); }; 
	ccbRegisterOnFrameEvent(me.registeredFunction);
	this.NextTime = +new Date();
	this.NextTime = this.NextTime + this.ShootDelay;
}    

action_shooter.prototype.IsInFOV = function(){
	var currentRot = ccbGetSceneNodeProperty(this.PlayerNode, 'Rotation');
	var pos = ccbGetSceneNodeProperty(this.PlayerNode, 'Position');
	var targetpos = ccbGetSceneNodeProperty(this.TargetNode, "Position");
	
	//get rotation vector
	var matrot = new Matrixhelper();
	matrot.setRotationDegrees(currentRot);
	var directionForward = new vector3d(-1, 0.0, 0.0);	//set this to the forward direction player is facing, make  negative if model is flipped 
	matrot.rotateVect(directionForward);
	
	directionForward.normalize();
	
	var tdirection = targetpos.substract(pos);
//	var tdirection = pos.substract(targetpos);
	tdirection.normalize();
	var result = this.dotProduct(directionForward,tdirection); //negative means target is behind the object, postive means its in front (180)
	var r = Math.acos(result); //get angle in radians
	var deg = r * 180 / Math.PI;//convert radians to degrees

	if (result >=0 && deg <= this.ShootFOV/2){
		return true;	
	}else{
		return false;	
	}
}


action_shooter.prototype.MainFunc = function(){
	var now = +new Date();
	if (this.mode == 0){
		if (now > this.NextTime){
			//invoke other action
			if (this.IsInFOV()==true){
				ccbInvokeAction(this.DoActionTrue, this.registeredFunction); 
			}else{
				ccbInvokeAction(this.DoActionFalse, this.registeredFunction);
			}
			this.mode = 1;
			this.NextTime = now + this.ShootWait;
			
		}	
	}else if(this.mode == 1){
		if (now > this.NextTime){
			//finish this action
			ccbUnregisterOnFrameEvent(this.registeredFunction);
			this.mode=2;
		}	
	}
}