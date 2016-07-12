var roleBuilder = require('role.builder');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if creep is trying to repair something but has no energy left
        if (creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is full of energy but not working
        else if (creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to repair something
        if (creep.memory.working == true) {
			
			var walls = creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_WALL });
			var target = undefined;

			// loop with increasing percentages
			for (var percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001){
				// find a wall with less than percentage hits

				// for some reason this doesn't work
				// target = creep.pos.findClosestByPath(walls, {
				//     filter: (s) => s.hits / s.hitsMax < percentage
				// });

				// so we have to use this
				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL && s.hits / s.hitsMax < percentage});
				
				if (target != undefined) {
					break;
				}
			}
							
            //console.log(target);
            // if we find a wall that has to be repaired
            if (target != undefined) {
                // try to repair it, if not in range
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(target, {reusePath: 5});
                }				

            }
            // if we can't fine one
            else {
                // look for construction sites
                roleBuilder.run(creep);
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // find closest source
            var source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (s) => s.energy > 0
            });
            // try to harvest energy, if the source is not in range
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards the source
                creep.moveTo(source, {reusePath: 5});

            }
        }
    }
};