

module.exports = {
    // state working = Returning energy to structure

    run: function(creep) {
        //Look for vacant source marked as narrowSource

        var narrowSources = creep.room.find(FIND_FLAGS, {filter: (s) => (s.memory.spawn == creep.memory.spawn && s.memory.function == "narrowSource")});
        for (var n in narrowSources) {
            var busyCreeps = creep.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.spawn == creep.memory.spawn && s.memory.function == "narrowSource")
                                                            && s.memory.staticX == narrowSources[n].pos.x && s.memory.staticY == narrowSources[n].pos.y});
            if(busyCreeps.length == 0) {
                //no other stationary harvesters working on this source
                creep.memory.staticX = narrowSources[n].pos.x;
                creep.memory.staticY = narrowSources[n].pos.y;
                break;
            }
        }
        if (creep.memory.staticX == undefined || creep.memory.staticY == undefined) {
            console.log(creep.name + " has no source to stationary harvest.");
        }
        else if (creep.pos.isEqualTo(creep.memory.staticX, creep.memory.staticY)) {
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
                creep.harvest(source);
            }
            else {
                //Identify and save container
                if (creep.memory.narrowContainer == undefined) {
                    var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                    var container;

                    for (var i in containers) {
                        if (creep.transfer(containers[i],RESOURCE_ENERGY) == OK) {
                            //container found
                            container = containers[i];
                            creep.memory.narrowContainer = container.id;
                        }
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
                creep.memory.path = creep.pos.findPathTo(creep.memory.staticX, creep.memory.staticY);
            }
            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                creep.memory.path = creep.pos.findPathTo(creep.memory.staticX, creep.memory.staticY);
                creep.moveByPath(creep.memory.path);
            }
        }
    }
};