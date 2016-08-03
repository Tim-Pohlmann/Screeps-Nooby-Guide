var roleCollector = require('role.collector');
var roleBuilder = require('role.builder');
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
            creep.memory.working = true;
            delete creep.memory.path;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            //Find construction sites
            var constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

            if (constructionSites.length > 0) {
                // Construction sites found, build them!
                roleBuilder.run(creep);
            }
            else {
                var road = creep.pos.lookFor(LOOK_STRUCTURES);
                if (road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD) {
                    // Found road to repair
                    creep.repair(road[0]);
                }
                else {
                    // Find exit to spawn room
                    var spawn = Game.getObjectById(creep.memory.spawn);
                    if (creep.room.name != creep.memory.homeroom) {
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
                        var freeContainerArray = creep.findClosestContainer(0);
                        var structure = freeContainerArray.container;

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
                                creep.moveTo(structure, {reusePath: 10});
                            }
                        }
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            //TODO Several remote sources per spawn
            //Find remote source
            var remoteSources = _.filter(Game.flags,{ memory: { function: 'remoteSource', spawn: creep.memory.spawn}});
            if (remoteSources.length > 0) {

                var remoteSource = remoteSources[0];
                // Find exit to target room
                if (creep.room != remoteSource.room) {
                    //still in old room, go out
                    if (!creep.memory.path) {
                        creep.memory.path = creep.pos.findPathTo(remoteSource);
                    }
                    if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                        creep.memory.path = creep.pos.findPathTo(remoteSource);
                        creep.moveByPath(creep.memory.path)
                    }
                }
                else {
                    //new room reached, start harvesting
                    var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    if (hostile == null) {
                        //No enemy creeps
                        //console.log(roleCollector.run(creep));
                        if (roleCollector.run(creep) != OK && creep.pos.getRangeTo(remoteSource) > 6) {
                            if (!creep.memory.path) {
                                creep.memory.path = creep.pos.findPathTo(remoteSource);
                            }
                            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                                creep.memory.path = creep.pos.findPathTo(remoteSource);
                                creep.moveByPath(creep.memory.path)
                            }
                        }
                    }
                    else {
                        //Hostiles creeps in new room
                        //TODO: Evading code
                        if (roleCollector.run(creep) != OK && creep.pos.getRangeTo(remoteSource) > 6) {
                            if (!creep.memory.path) {
                                creep.memory.path = creep.pos.findPathTo(remoteSource);
                            }
                            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                                creep.memory.path = creep.pos.findPathTo(remoteSource);
                                creep.moveByPath(creep.memory.path)
                            }
                        }
                    }
                }
            }
        }
    }
};