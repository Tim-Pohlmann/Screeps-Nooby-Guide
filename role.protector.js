
module.exports = {
    // a function to run the logic for this role
    run: function(creep, allies) {

        var protectorFlags = _.filter(Game.flags,{ memory: { function: 'protector', spawn: creep.memory.spawn}});
        var protectorFlag;

        for (var fl in protectorFlags) {
            //Look for unoccupied remoteController
            var flagName = protectorFlags[fl].name;
            creep.memory.protectorFlag = flagName;
            var busyCreeps = _.filter(Game.creeps,{ memory: { protectorFlag: flagName, spawn: creep.memory.spawn}});
            if (busyCreeps.length <= protectorFlags[fl].memory.volume) {
                //Protector needed
                protectorFlag = protectorFlags[fl];
                creep.memory.protectorFlag = protectorFlag.name;
                break;
            }
        }

        var wounded = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (s) => s.hits < s.hitsMax});

        // Attack code
        var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        var maxHealBodyParts = 0;
        var HealBodyParts;
        var healingInvader = undefined;

        for (var h in hostiles) {
            HealBodyParts = 0;
            for (var part in hostiles[h].body) {
                if(hostiles[h].body[part].type == "heal") {
                    //Healing body part found
                    HealBodyParts++;
                }
            }

            if (HealBodyParts > maxHealBodyParts) {
                maxHealBodyParts = HealBodyParts;
                healingInvader = hostiles[h].id;
            }
        }

        if(hostiles.length > 0) {
            if (healingInvader != undefined) {
                hostiles[0] = Game.getObjectById(healingInvader);
            }
            var username = hostiles[0].owner.username;
            if (allies.indexOf(username) == -1) {
                if (creep.attack(hostiles[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostiles[0]);
                }
            }
        }

        if (protectorFlags.length > 0) {
            //Move to flag if not there
            var range = creep.pos.getRangeTo(protectorFlag);
            if (range > 5) {
                if (!creep.memory.path) {
                    creep.memory.path = creep.pos.findPathTo(protectorFlag);
                }
                if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                    creep.memory.path = creep.pos.findPathTo(protectorFlag);
                    creep.moveByPath(creep.memory.path);
                }
            }
        }
    }
};