

module.exports = {
    // state working = Returning energy to structure

    run: function(creep) {
        //console.log(creep.name + ": " + creep.memory.statusHarvesting);

        if (creep.memory.statusHarvesting == undefined || creep.memory.statusHarvesting == false) {
            //Look for vacant source marked as narrowSource
            if (creep.memory.currentFlag == undefined) {
                creep.memory.currentFlag = creep.findMyFlag("narrowSource");
            }

            if (creep.memory.currentFlag == undefined) {
                //console.log(creep.name + " has no source to stationary harvest in room " + creep.room.name + ".");
            }
            else {
                var flag = Game.flags[creep.memory.currentFlag];
                if (creep.pos.isEqualTo(flag)) {
                    // Harvesting position reached

                    if (creep.carry.energy < creep.carryCapacity) {
                        //Time to refill
                        //Identify and save source
                        if (creep.memory.narrowSource == undefined) {
                            var source = creep.pos.findClosestByRange(FIND_SOURCES);
                            creep.memory.narrowSource = source.id;
                        }
                        else {
                            var source = Game.getObjectById(creep.memory.narrowSource);
                        }
                        if (creep.harvest(source) != OK) {
                            creep.memory.statusHarvesting = false;
                            delete creep.memory.narrowSource;
                        }
                        else {
                            creep.memory.statusHarvesting = source.id;
                        }

                    }
                    if (creep.carry.energy == creep.carryCapacity) {
                        //Identify and save container
                        if (creep.memory.narrowContainer == undefined) {
                            var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.storeCapacity - _.sum(s.store) > 0) || (s.structureType == STRUCTURE_LINK && s.energyCapacity - s.energy) > 0});
                            if (container != null) {
                                creep.memory.narrowContainer = container.id;
                            }
                        }
                        else {
                            container = Game.getObjectById(creep.memory.narrowContainer);
                        }
                        if (creep.transfer(container, RESOURCE_ENERGY) != OK) {
                            delete creep.memory.narrowContainer;
                        }
                    }
                }
                else {
                    // Move to harvesting point
                    if (!creep.memory.path) {
                        creep.memory.path = creep.pos.findPathTo(flag);
                    }
                    if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                        creep.memory.path = creep.pos.findPathTo(flag);
                        creep.moveByPath(creep.memory.path);
                    }
                }
            }
        }
        else {
            // Creep is harvesting, try to keep harvesting
            var result = creep.harvest(Game.getObjectById(creep.memory.statusHarvesting));
            if (creep.harvest(creep.memory.statusHarvesting) != OK) {
                creep.memory.statusHarvesting = false;
            }
        }
    }
};