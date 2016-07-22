

module.exports = {
    // state working = Returning energy to structure

    run: function(creep) {

        if (creep.pos.isEqualTo(Game.flags.narrowSource.pos.x, Game.flags.narrowSource.pos.y)) {
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
                creep.memory.path = creep.pos.findPathTo(Game.flags.narrowSource);
            }
            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                creep.memory.path = creep.pos.findPathTo(Game.flags.narrowSource);
                creep.moveByPath(creep.memory.path);
            }
        }
    }
};