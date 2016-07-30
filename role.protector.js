
module.exports = {
    // a function to run the logic for this role
    run: function(creep, allies) {

        var protectorFlags = _.filter(Game.flags,{ memory: { function: 'protector', spawn: creep.memory.spawn}});

        if (protectorFlags.length > 0) {
            //TODO More than one protector flag per spawn
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
            else if (wounded != null){
                //wounded creeps present in room
                if(creep.heal(wounded) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(wounded);
                }
            }
            else {
                //Move to flag if not there
                var range = creep.pos.getRangeTo(protectorFlags[0]);
                if (range > 5) {

                    //TODO: Change handling of protector flags
                    if (!creep.memory.path) {
                        creep.memory.path = creep.pos.findPathTo(protectorFlags[0]);
                    }
                    if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                        creep.memory.path = creep.pos.findPathTo(protectorFlags[0]);
                        creep.moveByPath(creep.memory.path);
                    }
                }
            }

        }
    }
};