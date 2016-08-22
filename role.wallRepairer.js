var roleBuilder = require('role.builder');
var roleCollector = require('role.collector');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // check for home room
        if (creep.room.name != creep.memory.homeroom) {
            //return to home room
            var hometarget = Game.getObjectById(creep.memory.spawn);
            creep.moveTo(hometarget, {reusePath: 10});
        }
        else {
            // if creep is trying to repair something but has no energy left
            if (creep.carry.energy == 0) {
                // switch state
                creep.memory.working = false;
            }
            // if creep is full of energy but not working
            else if (creep.carry.energy == creep.carryCapacity) {
                // switch state
                creep.memory.working = true;
            }

            // if creep is supposed to repair something
            if (creep.memory.working == true) {
                if (creep.memory.statusRepairing == undefined) {
                    var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
                    if (constructionSite != null) {
                        // Construction sites found
                        if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                            // move towards the constructionSite
                            creep.moveTo(constructionSite, {reusePath: 5});
                        }
                    }
                    else {
                        var target = undefined;
                        // loop with increasing percentages
                        for (var percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001) {
                            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL && s.hits / s.hitsMax < percentage) || (s.structureType == STRUCTURE_RAMPART && s.hits / (s.hitsMax * 3) < percentage)});
                            if (target != undefined) {
                                break;
                            }
                        }

                        // if we find a wall that has to be repaired
                        if (target != undefined) {
                            // try to repair it, if not in range
                            var result = creep.repair(target);
                            if (result == ERR_NOT_IN_RANGE) {
                                // move towards it
                                creep.moveTo(target, {reusePath: 5});
                            }
                            else if (result == OK) {
                                creep.memory.statusRepairing = target.id;
                            }
                            else {
                                delete creep.memory.statusRepairing;
                            }
                        }
                        // if we can't fine one
                        else {
                            // look for construction sites
                            roleBuilder.run(creep);
                        }
                    }
                }
                else {
                    if (creep.repair(Game.getObjectById(creep.memory.statusRepairing)) != OK) {
                        delete creep.memory.statusRepairing;
                    }
                }

            }
            // if creep is supposed to harvest energy from source
            else {
                roleCollector.run(creep);
            }
        }
    }
};