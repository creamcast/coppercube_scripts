// This is a scripted coppercube action.
// It fades the whole screen to or from black, and executes an action after finished.
//
// The following embedded xml is for the editor and describes how the action can be edited:
// Supported types are: int, float, string, bool, color, vect3d, scenenode, texture, action
/*
	<action jsname="action_FadeScreen" description="Fade the whole screen">
		<property name="TimeToFade" type="int" default="500" />
		<property name="Color" type="color" default="ff000000" />
		<property name="FadeOut" type="bool" default="true" />
		<property name="ActionWhenFinished" type="action" />
	</action>
*/

action_FadeScreen = function()
{
};

// called when the action is executed 
action_FadeScreen.prototype.execute = function(currentNode)
{
	var me = this; 
	this.registeredFunction = function() { me.drawFadeScreenFunc(); }; 
	
	ccbRegisterOnFrameEvent(this.registeredFunction);		
	this.startTime = (new Date()).getTime();
	this.endTime = this.startTime + this.TimeToFade;
	
	this.currentNode = currentNode;
}

// --------------------------------------------------------
// Implementation of the screen fading function

action_FadeScreen.prototype.drawFadeScreenFunc = function()
{
	var me = this;
			
	var now = (new Date()).getTime();
		
	// calculate color
	
	var alpha = (now - me.startTime) / (me.endTime - me.startTime);
	alpha = alpha * 255.0;
	if (alpha > 255) alpha = 255;
	if (alpha < 0) alpha = 0;
	if (!me.FadeOut) alpha = 255 - alpha;
	
	var color = (alpha<<24) | (me.Color & 0x00ffffff);
		
	// draw rectangle
	
	ccbDrawColoredRectangle(color, 0, 0, ccbGetScreenWidth(), ccbGetScreenHeight());
	
	// stop fading if end reached and run an action
	
	if (now > me.endTime)
	{
		ccbUnregisterOnFrameEvent(this.registeredFunction);
		ccbInvokeAction(me.ActionWhenFinished, me.currentNode);
	}
}
