/*
<action jsname="action_moveAI" description="Move AI to position">
    <property name="TargetNode" type="scenenode" />
    <property name="DoAction" type="action" />
    <property name="AOffset" type="float" default="20" />
    <property name="MinLen" type="float" default="5" />
    <property name="MaxLen" type="float" default="200" />
</action>
*/

//    <property name="ThisNode" type="scenenode" />

action_moveAI = function()
{
	this.Attacking = false;
};

// called when the action is executed 
action_moveAI.prototype.execute = function(currentNode)
{
	//ccbAICommand(currentNode, "cancel");
	var me = this; 
	this.registeredFunction = function() { me.walk(); }; 
	ccbRegisterOnFrameEvent(this.registeredFunction);
	this.ThisNode = currentNode;
	//print("activate");
}    

action_moveAI.prototype.walk = function(){
	var moveto = ccbGetSceneNodeProperty(this.TargetNode, "Position")
	var mepos = ccbGetSceneNodeProperty(this.ThisNode, "Position");

	//get length between player and object
	var tmp = mepos.substract(moveto);	
	var length = tmp.getLength();
	print(length);
	if (this.Attacking == true){
		ccbUnregisterOnFrameEvent(this.registeredFunction);
		this.Attacking == false;
		print(ccbGetSceneNodeProperty(this.TargetNode,"Health"));
		ccbInvokeAction(this.DoAction, this.ThisNode);
		ccbSetSceneNodeProperty(this.ThisNode, "Animation", "Attack")
		return true;
				
	}else if (length >=this.MaxLen){
		//ccbUnregisterOnFrameEvent(this.registeredFunction);
		//print("finish");
		//var me = this; 
//		ccbInvokeAction(me.DoAction, me.ThisNode);
	}else if(length <=this.MinLen){
		this.Attacking = true;
	}else{
		//move AI towards targt
		
		//find the offset value of the ending area...	
		var mvec = moveto.substract(mepos);
		mvec.normalize();
		mvec.x=Math.round(mvec.x*this.AOffset);
		mvec.y=Math.round(mvec.y*this.AOffset);
		mvec.z=Math.round(mvec.z*this.AOffset);
		ccbAICommand(this.ThisNode, "moveto", moveto.add(mvec));		
	}
}