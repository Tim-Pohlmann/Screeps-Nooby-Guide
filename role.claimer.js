var roleCollector = require('role.collector');
var roleUpgrader = require('role.upgrader');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // Find exit to target room
        var spawn = Game.getObjectById(creep.memory.spawn);

        if (creep.room.name == spawn.room.name) {
            //still in old room, go out

            if(!creep.memory.path) {
                creep.memory.path = creep.pos.findPathTo(Game.flags.remoteController);
            }
            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                creep.memory.path = creep.pos.findPathTo(Game.flags.remoteController);
                creep.moveByPath(creep.memory.path)
            }
        }
        else {
            //new room reached, start reserving / claiming
            // try to claim the controller
            var returncode = creep.claimController(creep.room.controller);

            switch (returncode) {
                case ERR_NOT_IN_RANGE:
                    // if not in range, move towards the controller
                    creep.moveTo(creep.room.controller, {reusePath: 10});
                    break;

                case ERR_INVALID_TARGET:
                    //if invalid, probably claimed
                    if (creep.room.controller.owner == spawn.room.controller.owner) {
                        //no claimer needed anymore
                        creep.suicide();
                    }

                    break;

                case ERR_GCL_NOT_ENOUGH:
                    //Global level not high enough, switch to reserving
                    if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE)
                        creep.moveTo(creep.room.controller, {reusePath: 10});
                    break;

                default:
                    creep.say(returncode);
                    break;
            }
        }
    }
};