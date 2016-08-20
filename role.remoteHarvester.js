var roleCollector = require('role.collector');
var roleBuilder = require('role.builder');
const RESOURCE_SPACE = "space";

module.exports = {
    // state working = Returning energy to structure
    run: function(creep) {
        // check for picked up minerals
        var specialResources = false;

        for (var resourceType in creep.carry) {
            switch (resourceType) {
                case RESOURCE_ENERGY:
                    break;

                default:
                    // find closest container with space to get rid of minerals
                    if (creep.room.name != creep.memory.homeroom) {
                        creep.moveTo(creep.memory.spawn);
                    }
                    else if (creep.transfer(freeContainer, resourceType) == ERR_NOT_IN_RANGE) {
                        var freeContainer = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                        creep.moveTo(freeContainer, {reusePath: delayPathfinding});
                    }
                    specialResources = true;
                    break;
            }
        }

        if (specialResources == false) { // if creep is bringing energy to a structure but has no energy left
            if (_.sum(creep.carry) == 0) {
                // switch state to harvesting
                if (creep.memory.working == true) {
                    delete creep.memory.path;
                    delete creep.memory._move;
                }
                creep.memory.working = false;
            }
            // if creep is harvesting energy but is full
            else if (_.sum(creep.carry) == creep.carryCapacity) {
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
                    var constructionSite = creep.pos.lookFor((LOOK_CONSTRUCTION_SITES));

                    if (road[0] == undefined && constructionSite[0] == undefined && creep.room.name != creep.memory.homeroom) {
                        //Road on swamp needed
                        creep.pos.createConstructionSite(STRUCTURE_ROAD);
                    }
                    if (road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && creep.room.name != creep.memory.homeroom) {
                        // Found road to repair
                        creep.repair(road[0]);
                    }
                    else {
                        // Find exit to spawn room
                        var spawn = Game.getObjectById(creep.memory.spawn);
                        if (creep.room.name != creep.memory.homeroom) {
                            //still in new room, go out
                            if (!creep.memory.path) {
                                creep.memory.path = creep.pos.findPathTo(spawn);
                            }
                            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                                creep.memory.path = creep.pos.findPathTo(spawn, {ignoreCreeps: false});
                                creep.moveByPath(creep.memory.path);
                            }
                        }
                        else {
                            // back in spawn room

                            delete creep.memory.path;
                            // find closest spawn, extension, tower or container which is not full
                            structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);

                            // if we found one
                            if (structure != null) {
                                // try to transfer energy, if it is not in range
                                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
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
    }
};