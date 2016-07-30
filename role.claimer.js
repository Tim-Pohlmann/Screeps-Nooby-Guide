var roleCollector = require('role.collector');
var roleUpgrader = require('role.upgrader');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // Find exit to target room
        var spawn = Game.getObjectById(creep.memory.spawn);
        var remoteControllers = _.filter(Game.flags,{ memory: { function: 'remoteController', spawn: creep.memory.spawn}});
        var remoteController;

        for (var rem in remoteControllers) {
            //Look for unoccupied remoteController
            var flagName = remoteControllers[rem].name;
            var busyCreeps = creep.room.find(FIND_MY_CREEPS, {filter: (s) => s.memory.spawn == creep.memory.spawn && s.memory.remoteControllerFlag == flagName});
            if (busyCreeps.length == 0 || busyCreeps[0].name == creep.name) {
                //No other claimer working on this flag
                remoteController = remoteControllers[rem];
                creep.memory.remoteControllerFlag = remoteController.name;
                break;
            }
        }

        if (remoteController != undefined && creep.room.name != remoteController.room.name) {
            //still in wrong room, go out
            if (!creep.memory.path) {
                creep.memory.path = creep.pos.findPathTo(remoteController);
            }
            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                creep.memory.path = creep.pos.findPathTo(remoteController);
                creep.moveByPath(creep.memory.path)
            }
        }
        else if (remoteController != undefined) {
            //new room reached, start reserving / claiming
            // try to claim the controller
            if (creep.room.controller.owner != undefined && creep.room.controller.owner.username == spawn.room.controller.owner.username) {
                //creep.suicide();
                creep.say("Controller already owned!");
            }
            var returncode = creep.claimController(creep.room.controller);

            switch (returncode) {
                case ERR_NOT_IN_RANGE:
                    // if not in range, move towards the controller
                    creep.moveTo(creep.room.controller, {reusePath: 10});
                    break;

                case ERR_INVALID_TARGET:
                    //if invalid, probably claimed
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