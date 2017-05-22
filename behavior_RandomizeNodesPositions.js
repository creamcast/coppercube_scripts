/*
  <behavior jsname="behavior_RandomizeNodesPositions" 
	description="Randomize Nodes Positions">
      <property name="RandomizeRotation" type="bool" default="false" />
      <property name="MinimalDistance" type="int" default="0" />
  </behavior>
*/

behavior_RandomizeNodesPositions = function() {};

behavior_RandomizeNodesPositions.prototype.onAnimate = function(_node) {
  this.onAnimate = function() {};

  var self = this;
  var node = ccb.node.get(_node);
  var bbox = node.getWorldBBox();
  var positions = [];

  function createPosition() {
    return new ccb.vector(ccb.core.randRange(bbox.min.x, bbox.max.x), node.getWorldPosition().y, ccb.core.randRange(bbox.min.z, bbox.max.z));
  }

  function findPosition() {
    var position = createPosition();

    if(self.MinimalDistance > 0) {
      _.every(positions, function(_position) {
        if(position.getDistanceTo(_position) < self.MinimalDistance) {
          position = findPosition();
          return false;
        }

        return true;
      });
    }

    return position;
  }

  _.each(node.getChildren(), function(child) {
    var position = findPosition();

    var line = new ccb.line(position.clone().sub(new ccb.vector(0, 5000, 0)), position.clone().add(new ccb.vector(0, 10000, 0)));
    var intersection = node.getIntersectionWithLine(line);

    if(intersection) {
      position.y = intersection.y;
    }

    if(self.RandomizeRotation) {
      var rotation = child.getRotation().clone();
      rotation.y = ccb.core.randRange(0, 360);
      child.setRotation(rotation);
    }

    child.setPosition(node.transformWorldPointToLocal(position));

    positions.push(position);
  });
};