module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
		// check for picked up minerals
		var specialResources = false;

		for (var resourceType in creep.carry) {
			switch (resourceType) {
				case "energy":
					break;

				default:
					// find closest container with space
					var freeContainerArray = creep.findClosestContainer(0);
					var freeContainer = freeContainerArray.container;

					if (creep.transfer(freeContainer, resourceType) == ERR_NOT_IN_RANGE) {
						creep.moveTo(freeContainer);
					}

					specialResources = true;
					break;
			}
		}

		if (specialResources == false) {
			if (creep.memory.role == "harvester") {
				// find closest source
				var container;
				var sourcepath;
				var sourcedist;

				var source = creep.pos.findClosestByPath(FIND_SOURCES, {filter: (s) => s.energy > 0});
				if (source != null) {

					sourcepath = creep.pos.findPathTo(source);
					sourcedist = sourcepath.length;
				}
				else {
					sourcedist = 99999;
				}

				// find closest container with energy
				//console.log(creep.room.energyCapacityAvailable - creep.room.energyAvailable);
				if (creep.room.energyCapacityAvailable > creep.room.energyAvailable) {
					//spawn not full, find container or storage if available
					container = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) =>(s.structureType == STRUCTURE_LINK && s.energy > 0) || ((s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0)});
				}
				else if (creep.room.storage != undefined && creep.room.storage.storeCapacity - _.sum(creep.room.storage.store > 0)) {
					//spawn full and storage with space exists or towers need energy
					container = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_LINK && s.energy > 0) || (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0)});
				}
				else {
					container = undefined;
				}

				var containerdist = 99999;
				if (container != undefined) {
					var containerpath = creep.pos.findPathTo(container);
					if (containerpath.length < containerdist) {
						containerdist = containerpath.length;
					}
				}

				// Compare distances to select nearest energy source
				if (container != undefined && containerdist < sourcedist) {
					//transfer from container
					if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveByPath(containerpath);
					}
				}
				else {
					//harvest from source
					if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
						creep.moveByPath(sourcepath);
					}
				}
			}
			else {
				//no harvester role
				// find closest source
				var returncode;
				var container;
				var source = creep.pos.findClosestByPath(FIND_SOURCES, {filter: (s) => s.energy > 0});
				if (source != null) {

					var sourcepath = creep.pos.findPathTo(source);
					var sourcedist = sourcepath.length;
				}
				else {
					var sourcedist = 99999;
				}

				// find closest container with energy
				//container = creep.findClosestContainer(RESOURCE_ENERGY);
				container = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_LINK && s.energy > 0) || (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0) || (s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0)})

				var containerdist = 99999;
				if (container != null) {
					var containerpath = creep.pos.findPathTo(container);
					if (containerpath.length < containerdist) {
						containerdist = containerpath.length;
					}
				}
				else {
					container = undefined;
				}
				var pathToSource;
				var spawn = Game.getObjectById(creep.memory.spawn);
				// Compare distances to select nearest energy source
				if ((container != undefined && containerdist <= sourcedist) && (spawn.room.energyCapacityAvailable > spawn.room.energyAvailable || creep.memory.role != "harvester" || (container.structureType != STRUCTURE_STORAGE && spawn.room.storage != undefined && spawn.room.storage.storeCapacity - _.sum(spawn.room.storage.store > 0)))) {
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
				var code;
				switch (returncode) {
					case (OK):

						break;

					case (ERR_INVALID_TARGET):

						break;

					case (ERR_NOT_IN_RANGE):
						// move towards the source
						code = creep.moveTo(source, {reusePath: 8});

						if (code != 0) {
							switch (code) {
								case -11:
									//creep.say("Tired");
									break;

								case -7:
									creep.say("Invalid target!");
									break;

								case -2:
									//console.log(creep.name + ": " + source);
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
				return(returncode);
			}
		}
	}
};