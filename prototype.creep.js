module.exports = function() {
    // create a new function for Creep
	Creep.prototype.findClosestContainer =
	function(res) {
		var container;
		var containers;
		var containerdist;
		var containerpath;

		if (res == 0) {
			//Look for container with space
			containers = this.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.storeCapacity - _.sum(s.store) > 0)});
		}
		else if (res == -1) {
			//Look for container containing anything but energy
			containers = this.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < _.sum(s.store))});
		}
		else {
			//Look for container containing a specific resource
			containers = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[res] > 0})			;
		}

		containerdist = 99999;
		if (containers.length > 0) {
			for (var i in containers) {
				containerpath = this.pos.findPathTo(containers[i]);
				if (containerpath.length < containerdist) {
					container = containers[i];
					containerdist = containerpath.length;
				}
			}
		}
		else {
			container = undefined;
		}
		var containerArray =new Array();
		containerArray["container"]=container;
		containerArray["path"]=containerpath;
		containerArray["distance"]=containerdist;

		//console.log(_.sum(containerArray.container.store));
		return containerArray;
	}
};