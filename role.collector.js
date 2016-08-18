const delayPathfinding = 2;
const delayRoomScanning = 10;
const RESOURCE_SPACE = "space";

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
		// check for picked up minerals
		var specialResources = false;

		for (var resourceType in creep.carry) {
			switch (resourceType) {
				case RESOURCE_ENERGY:
					break;

				default:
					// find closest container with space to get rid of minerals
                    var freeContainer = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    //console.log(freeContainer);
                    if (creep.room.name != creep.memory.homeroom) {
                        creep.moveTo(creep.memory.spawn);
                    }
					else if (creep.transfer(freeContainer, resourceType) == ERR_NOT_IN_RANGE) {
						creep.moveTo(freeContainer, {reusePath: delayPathfinding});
					}
					specialResources = true;
					break;
			}
		}

		if (specialResources == false) {
            if (creep.memory.statusHarvesting == undefined || creep.memory.statusHarvesting == false) {
                var container;
                if (creep.memory.role == "harvester") {
                    // find closest container with energy
                    if (creep.room.energyCapacityAvailable > creep.room.energyAvailable) {
                    //spawn not full, find source, container or storage if available
                        container = creep.findResource(RESOURCE_ENERGY,FIND_SOURCES, STRUCTURE_LINK,STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    }
                    else if (creep.room.storage != undefined && creep.room.storage.storeCapacity - _.sum(creep.room.storage.store > 0)) {
                    //spawn full and storage with space exists or towers need energy
                        container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER);
                    }
                    else {
                        container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK);
                    }
                    //console.log(creep.name + ": " + container.ticksToRegeneration);
                    if (container == undefined) {
                        //console.log(creep.name + "(" + creep.room.name + "): no resource found");
                    }
                    else if (container.ticksToRegeneration == undefined && (container.energy == undefined || container.energy < 3000)) {
                        //container
                        //console.log(creep.name + "(" + creep.room.name + "): container found: " + container);
                        if (creep.withdraw(container, RESOURCE_ENERGY) != OK) {
                            creep.moveTo(container, {reusePath: delayPathfinding});
                        }
                    }
                    else {
                        //Source
                        //console.log(creep.name + "(" + creep.room.name + "): source found: " + container);
                        if (creep.harvest(container) != OK) {
                            creep.moveTo(container, {reusePath: delayPathfinding});
                        }
                    }
                }
                else {
                    //no harvester role
                    // find closest source

                    container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    if (container == undefined) {
                        //console.log(creep.name + "(" + creep.room.name + "): no resource found");
                    }
                    else if (container.ticksToRegeneration == undefined && (container.energy == undefined || container.energy < 3000)) {
                        //container
                        //console.log(creep.name + "(" + creep.room.name + "): container found: " + container);
                        if (creep.withdraw(container, RESOURCE_ENERGY) != OK) {
                            creep.moveTo(container, {reusePath: delayPathfinding});
                        }
                    }
                    else {
                        //Source
                        //console.log(creep.name + "(" + creep.room.name + "): source found: " + container);
                        if (creep.harvest(container) != OK) {
                            creep.moveTo(container, {reusePath: delayPathfinding});
                        }
                    }
                }
            }
            else {
                // Creep is harvesting, try to keep harvesting
                if (creep.harvest(Game.getObjectById(creep.memory.statusHarvesting)) != OK) {
                    creep.memory.statusHarvesting = false;
                }
            }
		}
	}
};