var roleCollector = require('role.collector');
var roleUpgrader = require('role.upgrader');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // Find exit to target room
        var spawn = Game.getObjectById(creep.memory.spawn);
        var remoteControllers = _.filter(Game.flags,{ memory: { function: 'remoteController', spawn: creep.memory.spawn}});
        var remoteController;
        var busyCreeps;

        if (creep.memory.remoteControllerFlag != undefined) {
            //Check whether claiming this flag is this OK
            busyCreeps = _.filter(Game.creeps,{ memory: { remoteControllerFlag: creep.memory.remoteControllerFlag, spawn: creep.memory.spawn}});
        }

        if (creep.memory.remoteControllerFlag == undefined || (creep.memory.remoteControllerFlag != undefined && busyCreeps.length != 1)) {
            //Flag taken, choose other flag
            for (var rem in remoteControllers) {
                //Look for unoccupied remoteController
                var flagName = remoteControllers[rem].name;

                creep.memory.remoteControllerFlag = remoteControllers[rem].name;
                busyCreeps = _.filter(Game.creeps,{ memory: { remoteControllerFlag: flagName, spawn: creep.memory.spawn}});

                if (busyCreeps.length == 1 && (remoteControllers[rem].room == undefined || remoteControllers[rem].room.controller.reservation == undefined|| remoteControllers[rem].room.controller.reservation.ticksToEnd < 3000)) {
                    //No other claimer working on this flag
                    remoteController = remoteControllers[rem];
                    creep.memory.remoteControllerFlag = remoteController.name;
                    break;
                }
            }
        }
        else {
            //Load previous flag
            remoteControllers = _.filter(Game.flags,{name: creep.memory.remoteControllerFlag});
            remoteController = remoteControllers[0];
        }


        if (remoteController != undefined && (remoteController.room == undefined || creep.room.name != remoteController.pos.roomName)) {
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

            if (creep.room.memory.hostiles == 0) {
                // try to claim the controller
                if (remoteController.memory.claim == 1) {
                    var returncode = creep.claimController(creep.room.controller);
                }
                else {
                    returncode = ERR_GCL_NOT_ENOUGH;
                }
                switch (returncode) {
                    case ERR_NOT_IN_RANGE:
                        // if not in range, move towards the controller
                        creep.moveTo(remoteController, {reusePath: 1});
                        break;

                    case ERR_INVALID_TARGET:
                        //if invalid, probably claimed
                        break;

                    case ERR_GCL_NOT_ENOUGH:
                        //Global level not high enough, switch to reserving
                        if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE)
                            creep.moveTo(remoteController, {reusePath: 1});
                        break;

                    default:
                        creep.say(returncode);
                        creep.moveTo(remoteController, {reusePath: 1});
                        break;
                }
            }
            else {
                //Hostiles creeps in new room
                var homespawn = Game.getObjectById(creep.memory.spawn);
                if (creep.room.name != creep.memory.homeroom) {
                    creep.moveTo(homespawn), {reusePath: 10};
                }
                else if (creep.pos.getRangeTo(homespawn) > 5) {
                    creep.moveTo(homespawn), {reusePath: 10};
                }
            }
        }
        else {
            //console.log(creep.name + ": no remote controller flag found!");
        }
    }
};