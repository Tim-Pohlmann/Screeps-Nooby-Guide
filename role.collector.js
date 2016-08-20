const delayPathfinding = 2;
const delayRoomScanning = 10;
const RESOURCE_SPACE = "space";

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
		// check for picked up minerals
        if (creep.memory.statusHarvesting == undefined || creep.memory.statusHarvesting == false) {
            var container;
            if (creep.memory.role == "harvester" || creep.memory.role == "energyTransporter") {
                // find closest container with energy
                if (creep.room.energyCapacityAvailable > creep.room.energyAvailable) {
                    //spawn not full, find source, container or storage if available
                    if (creep.memory.role == "harvester") {
                        container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    }
                    if (creep.memory.role == "energyTransporter") {
                        container = creep.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    }
                }
                else if (creep.room.storage != undefined && creep.room.storage.storeCapacity - _.sum(creep.room.storage.store > 0)) {
                    //spawn full and storage with space exists or towers need energy
                    if (creep.memory.role == "harvester") {
                        container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER);
                    }
                    if (creep.memory.role == "energyTransporter") {
                        container = creep.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER);
                    }
                }
                else {
                    if (creep.memory.role == "harvester") {
                        container = creep.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK);
                    }
                    if (creep.memory.role == "energyTransporter") {
                        container = creep.findResource(RESOURCE_ENERGY, STRUCTURE_LINK);
                    }
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
};