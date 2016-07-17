var roleCollector = require('role.collector');
var roleUpgrader = require('role.upgrader');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if creep is bringing energy to the controller but has no energy left
        if (creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to the controller
        if (creep.memory.working == true) {
            // instead of upgraderController we could also use:
            // if (creep.transfer(creep.room.controller, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {

            // try to upgrade the controller
            var returncode = creep.claimController(creep.room.controller);
            switch (returncode) {
                case ERR_NOT_IN_RANGE:
                    // if not in range, move towards the controller
                    creep.moveTo(creep.room.controller, {reusePath: 10});
                    break;

                case ERR_INVALID_TARGET:
                    //if invalid, probably claimed
                    roleUpgrader.run(creep);
                    break;
                default:
                    creep.say(returncode);
                    break;
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
                roleCollector.run(creep);
            }
        }
    }
};