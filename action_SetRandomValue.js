// This is a coppercube action for setting a random value into a CopperCube variable.
// 
// The following embedded xml is for the editor and describes how the action can be edited:
// Supported types are: int, float, string, bool, color, vect3d, scenenode, texture, action
/*
	<action jsname="action_SetRandomValue" description="Set Random Value">
		<property name="VariableName" type="string" default="" />
		<property name="Min" type="int" default="0" />
		<property name="Max" type="int" default="100" />
		<property name="Integers" type="bool" default="true" />
	</action>
*/

action_SetRandomValue = function()
{

};

// called when the action is executed 
action_SetRandomValue.prototype.execute = function(currentNode)
{
	var value = (Math.random() * (this.Max - this.Min)) + this.Min;
	
	if (this.Integers)
		value = Math.floor(value);
	
	ccbSetCopperCubeVariable(this.VariableName, value);
}

