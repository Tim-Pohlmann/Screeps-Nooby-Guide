module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
		// check for picked up resources
		var specialResources = false;

		for (var resourceType in creep.carry) {
			//creep.drop(resourceType);
			switch (resourceType) {
				case "energy":
					break;

				default:
					// find closest container with space
					var freeContainerArray = creep.findClosestContainer(0);
					var freeContainer = freeContainerArray.container;
					console.log(freeContainer);

					if (creep.transfer(freeContainer, resourceType) == ERR_NOT_IN_RANGE) {
						creep.moveTo(freeContainer);
					}

					specialResources = true;
					break;
			}
		}

		if (specialResources == false) {

			// find closest source
			var returncode;
			var container;
			var source = creep.pos.findClosestByPath(FIND_SOURCES, {filter: (s) => s.energy > 0
		})
			;
			if (source != null) {

				var sourcepath = creep.pos.findPathTo(source);
				var sourcedist = sourcepath.length;
			}
			else {
				var sourcedist = 99999;
			}

			// find closest container with energy
			//container = creep.findClosestContainer(RESOURCE_ENERGY);
			var containers = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER
				&& s.store[RESOURCE_ENERGY] > 0
		})
			;
			var containerdist = 99999;
			if (containers.length > 0) {
				for (var i in containers) {
					var containerpath = creep.pos.findPathTo(containers[i]);
					if (containerpath.length < containerdist) {
						container = containers[i];
						containerdist = containerpath.length;
					}
				}
			}
			else {
				container = undefined;
			}
			var pathToSource;

			// Compare distances to select nearest energy source
			if (container != undefined && containerdist < sourcedist) {
				//transfer from container
				returncode = creep.withdraw(container, RESOURCE_ENERGY);
				source = container;
				pathToSource = containerpath;
			}
			else {
				//harvest from source
				returncode = creep.harvest(source);
				pathToSource = sourcepath;
			}

			switch (returncode) {
				case (OK):

					break;

				case (ERR_INVALID_TARGET):

					break;

				case (ERR_NOT_IN_RANGE):
					// move towards the source
					var code = creep.moveTo(source);

					if (code != 0) {
						switch (code) {
							case -11:
								//creep.say("Tired");
								break;

							case -7:
								creep.say("Invalid target!");
								break;

							case -2:
								creep.say("No path!");
								break;

							default:
								creep.say(code);
								break;
						}
					}
					break;

				case -8:
					creep.say("Full");
					break;

				default:
					creep.say(returncode);
					break;
			}

		}
	}
};