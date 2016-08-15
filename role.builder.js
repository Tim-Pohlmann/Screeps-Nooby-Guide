var roleUpgrader = require('role.upgrader');
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
            // if creep is trying to complete a constructionSite but has no energy left
            if (creep.carry.energy == 0) {
                // switch state
                creep.memory.working = false;
            }
            // if creep is harvesting energy but is full
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                // switch state
                creep.memory.working = true;
            }

            // if creep is supposed to complete a constructionSite
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
                    // find closest constructionSite
                    var arrayStructures=[STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_ROAD];
                    var constructionSite=null;
                    for (iStruct=0;iStruct<arrayStructures.length;iStruct++){
                        if(constructionSite==null){
                            constructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == arrayStructures[iStruct]});
                        }else{
                            break;
                        }
                    }
                    if (constructionSite == null) {
                        constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {filter: (s) => s.structureType != STRUCTURE_RAMPART});
                    }

                    // if one is found
                    if (constructionSite != null) {
                        // try to build, if the constructionSite is not in range
                        if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                            // move towards the constructionSite
                            creep.moveTo(constructionSite, {reusePath: 5});
                        }
                    }
                    // if no constructionSite is found
                    else {
                        // go upgrading the controller
                        roleUpgrader.run(creep);
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
