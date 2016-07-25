
module.exports = {
    // a function to run the logic for this role
    run: function(creep) {

        // Find exit to target room
        var spawn = Game.getObjectById(creep.memory.spawn);

        if (creep.room.name == spawn.room.name) {
            //still in old room, go out
            //TODO: Change handling of protector flags
            if(!creep.memory.path) {
                creep.memory.path = creep.pos.findPathTo(Game.flags.remoteSource);
            }
            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                creep.memory.path = creep.pos.findPathTo(Game.flags.remoteSource);
                creep.moveByPath(creep.memory.path)
            }
        }
        else {
            //new room reached
            //Attack code
            var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            if (hostile != null) {
                //enemies present in room
                if(creep.attack(hostile) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostile);
                }
            }

            //Heal code
            var wounded = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (s) => s.hits < s.hitsMax});
            if (wounded != null){
                //wounded creeps present in room
                if(creep.heal(wounded) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(wounded);
                }
            }

            //Move to flag if not there
            //TODO: Change handling of protector flags
            if (!creep.memory.path) {
                creep.memory.path = creep.pos.findPathTo(Game.flags.remoteSource);
            }
            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                creep.memory.path = creep.pos.findPathTo(Game.flags.remoteSource);
                creep.moveByPath(creep.memory.path);
            }
        }
    }
};