var roleBuilder = require('role.builder');
var roleCollector = require('role.collector');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // check for home room
        if (creep.room.name != creep.memory.homeroom && creep.memory.role != "remoteHarvester") {
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
            // if creep is harvesting energy but is full
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                // switch state
                creep.memory.working = true;
            }

            // if creep is supposed to repair something
            if (creep.memory.working == true) {
                if (creep.room.memory.hostiles > 0) {
                    // Hostiles present in room
                    var tower = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});
                    if (tower != null) {
                        // Tower needing energy found
                        if (creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            // move towards it
                            creep.moveTo(tower, {reusePath: 5});
                        }
                    }
                }
                else {
                    var spawn = creep.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_SPAWN});
                    if (spawn.length > 0) {
                        // find closest structure with less than max hits, exclude walls
                        var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits / s.hitsMax < 0.03)});

                        // if we find one
                        if (structure != undefined) {
                            // try to repair it, if it is out of range
                            if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                creep.moveTo(structure, {reusePath: 5});
                            }
                        }
                        // if we can't fine one
                        else {
                            // look for construction sites
                            roleBuilder.run(creep);
                        }
                    }
                    else {
                        //build spawn first
                        var constructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                        if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                            // move towards it
                            creep.moveTo(constructionSite, {reusePath: 5});
                        }
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