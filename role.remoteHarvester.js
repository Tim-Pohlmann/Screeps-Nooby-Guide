var roleCollector = require('role.collector');
var roleBuilder = require('role.builder');
module.exports = {
    // state working = Returning energy to structure

    run: function(creep) {
        // if creep is bringing energy to a structure but has no energy left
        if (creep.carry.energy == 0) {
            // switch state to harvesting
            if (creep.memory.working == true) {
                delete creep.memory.path;
                delete creep.memory._move;
            }
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.carry.energy == creep.carryCapacity) {
            if (creep.memory.working == false) {
                delete creep.memory.path;
                delete creep.memory._move;
            }
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            //Find construction sites
            var constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

            if (constructionSites.length > 0 && creep.room.name != creep.memory.homeroom) {
                // Construction sites found, build them!
                roleBuilder.run(creep);
            }
            else {
                var road = creep.pos.lookFor(LOOK_STRUCTURES);
                var terrain = creep.pos.lookFor(LOOK_TERRAIN);
                var constructionSite = creep.pos.lookFor((LOOK_CONSTRUCTION_SITES));

                if (terrain == "swamp" && road[0] == undefined && constructionSite[0] == undefined) {
                    //Road on swamp needed
                    creep.pos.createConstructionSite(STRUCTURE_ROAD);
                }
                if (terrain == "swamp" && road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && creep.room.name != creep.memory.homeroom) {
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
                            creep.memory.path = creep.pos.findPathTo(spawn, {ignoreCreeps: false});
                            creep.moveByPath(creep.memory.path);
                        }
                    }
                    else {
                        // back in spawn room

                        delete creep.memory.path;
                        // find closest spawn, extension, tower or container which is not full
                        structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                filter: (s) => ((s.structureType == STRUCTURE_SPAWN
                                || s.structureType == STRUCTURE_EXTENSION
                                || s.structureType == STRUCTURE_TOWER
                                || s.structureType == STRUCTURE_LINK)
                                && s.energy < s.energyCapacity) || ((s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER) && s.storeCapacity - _.sum(s.store) > 0)});
                        // if we found one
                        if (structure != null) {

                            if (structure.structureType == STRUCTURE_SPAWN && structure.energy == structure.energyCapacity) {
                                roleUpgrader.run(creep);
                            }
                            // try to transfer energy, if it is not in range
                            else if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                creep.moveTo(structure, {reusePath: 5, ignoreCreeps: false});
                            }
                        }
                        else {
                            creep.say("No Structure!");
                            //roleUpgrader.run(creep);
                        }
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else if (creep.memory.statusHarvesting == false || creep.memory.statusHarvesting == false) {
            //Find remote source
            var remoteSource = Game.flags[creep.findMyFlag("remoteSource")];
            if (remoteSource != -1) {

                // Find exit to target room
                if (remoteSource.room == undefined || creep.room.name != remoteSource.room.name) {
                    //still in old room, go out
                    if (!creep.memory.path) {
                        creep.memory.path = creep.pos.findPathTo(remoteSource, {ignoreCreeps: false});
                    }
                    if (creep.moveByPath(creep.memory.path) != OK) {
                        creep.memory.path = creep.pos.findPathTo(remoteSource, {ignoreCreeps: false});
                        creep.moveByPath(creep.memory.path)
                    }
                }
                else {
                    //new room reached, start harvesting
                    if (creep.room.memory.hostiles == 0) {
                        //No enemy creeps
                        if (roleCollector.run(creep) != OK && creep.pos.getRangeTo(remoteSource) > 3) {

                            if (!creep.memory.path) {
                                creep.memory.path = creep.pos.findPathTo(remoteSource, {ignoreCreeps: false});
                            }

                            if (creep.moveByPath(creep.memory.path) != OK) {
                                creep.memory.path = creep.pos.findPathTo(remoteSource, {ignoreCreeps: false});
                                delete creep.memory._move;
                                creep.moveByPath(creep.memory.path);
                            }
                        }
                    }
                    else {
                        //Hostiles creeps in new room
                        var homespawn = Game.getObjectById(creep.memory.spawn);
                        if (creep.room.name != creep.memory.homeroom) {
                            creep.moveTo(homespawn), {reusePath: 5};
                        }
                        else if (creep.pos.getRangeTo(homespawn) > 5) {
                            creep.moveTo(homespawn), {reusePath: 5};
                        }
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