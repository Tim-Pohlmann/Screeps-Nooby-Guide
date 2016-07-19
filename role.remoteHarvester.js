var roleCollector = require('role.collector');

module.exports = {
    // state working = Returning energy to structure

    run: function(creep) {
        // if creep is bringing energy to a structure but has no energy left

        if (creep.carry.energy == 0) {

            // switch state to harvesting
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.carry.energy == creep.carryCapacity) {
            // switch statevar numberOfHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
            creep.memory.working = true;
            delete creep.memory.path;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            // Find exit to spawn room

            var spawn = Game.getObjectById(creep.memory.spawn);
            if (creep.room.name != spawn.room.name) {
                //still in new room, go out

                if(!creep.memory.path) {
                    creep.memory.path = creep.pos.findPathTo(spawn);
                }
                if(creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                    creep.memory.path = creep.pos.findPathTo(spawn);
                    creep.moveByPath(creep.memory.path);
                }
            }
            else {
                // back in spawn room
                var structures = creep.room.find(FIND_STRUCTURES, {
                            filter: (s) => (s.structureType == STRUCTURE_CONTAINER
                            && s.storeCapacity - _.sum(s.store) > 0)});
                var structure = structures[0];

                //structure = null;

                if (structure == null) {
                    // find closest spawn, extension, tower or container which is not full
                    structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                            filter: (s) => (s.structureType == STRUCTURE_SPAWN
                        || s.structureType == STRUCTURE_EXTENSION
                        || s.structureType == STRUCTURE_TOWER)
                        && s.energy < s.energyCapacity});
                }

                // if we found one
                if (structure != null) {

                    if (structure.structureType == STRUCTURE_SPAWN && structure.energy == structure.energyCapacity) {
                        roleUpgrader.run(creep);
                    }
                    // try to transfer energy, if it is not in range
                    else if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure, {reusePath: 5});
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // Find exit to target room
            var spawn = Game.getObjectById(creep.memory.spawn);

            if (creep.room.name == spawn.room.name) {
                //still in old room, go out

                if(!creep.memory.path) {
                    creep.memory.path = creep.pos.findPathTo(Game.flags.remoteSource);
                }
                if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                    creep.memory.path = creep.pos.findPathTo(Game.flags.remoteSource);
                    creep.moveByPath(creep.memory.path)
                }
            }
            else {
                //new room reached, start harvesting
                var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (hostile == null) {
                    //No enemy creeps
                    roleCollector.run(creep);
                }
                else {
                    //Hostiles creeps in new room
                    //TODO: Evading code
                }
            }
        }
    }
};