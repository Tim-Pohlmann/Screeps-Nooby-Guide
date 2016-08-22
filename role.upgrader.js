var roleCollector = require('role.collector');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        if (creep.room.name != creep.memory.homeroom) {
            //return to home room
            var hometarget = Game.getObjectById(creep.memory.spawn);
            creep.moveTo(hometarget, {reusePath: 10});
        }
        else {
            // if creep is bringing energy to the controller but has no energy left
            if (creep.memory.working == true && creep.carry.energy == 0) {
                // switch state
                creep.memory.working = false;
            }
            // if creep is harvesting energy but is full
            else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
                // switch state
                creep.memory.working = true;
            }

            // if creep is supposed to transfer energy to the controller
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
                else if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    // try to upgrade the controller, if not in range, move towards the controller
                    creep.moveTo(creep.room.controller, {reusePath: 10});
                }
            }
            // if creep is supposed to harvest energy from source
            else {
                roleCollector.run(creep);
            }
        }
    }
};