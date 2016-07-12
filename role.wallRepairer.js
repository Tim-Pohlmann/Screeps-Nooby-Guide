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
<<<<<<< HEAD
        else if (creep.carry.energy == creep.carryCapacity) {
=======
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
>>>>>>> origin/master
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to repair something
        if (creep.memory.working == true) {
			
			if (creep.memory.wallTarget == undefined) {
<<<<<<< HEAD
				// not already repairing a wall, find new one
				var walls = creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_WALL });
				var target = undefined;

				// loop with increasing percentages: 100% = 300'000'000 ; 0.001% = 300;
				for (var percentage = 0.001; percentage <= 1; percentage = percentage + 0.001){
=======
				// find all walls in the room
				var walls = creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_WALL });
				var target = undefined;

				// loop with increasing percentages
				for (var percentage = 0.01; percentage <= 1; percentage = percentage + 0.01){
>>>>>>> origin/master
					// find a wall with less than percentage hits

					// for some reason this doesn't work
					// target = creep.pos.findClosestByPath(walls, {
					//     filter: (s) => s.hits / s.hitsMax < percentage
					// });

					// so we have to use this
					target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
						filter: (s) => s.structureType == STRUCTURE_WALL &&
									   s.hits / s.hitsMax < percentage
					});
<<<<<<< HEAD
					
					if (target != undefined) {
						// if there is one save it
						creep.memory.wallTarget=target;
						// and break the loop
=======

					// if there is one
					if (target != undefined) {
						creep.memory.targetPercentage=percentage;
						creep.memory.wallTarget=target;
						// break the loop
>>>>>>> origin/master
						break;
					}
				}
			}
			else {
<<<<<<< HEAD
				// already repairing a wall
=======
				var percentage=creep.memory.targetPercentage;
>>>>>>> origin/master
				var target=creep.memory.wallTarget;
			}				

            // if we find a wall that has to be repaired
            if (target != undefined) {
                // try to repair it, if not in range
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    // move towards it
<<<<<<< HEAD
                    creep.moveTo(target, {reusePath: 5});
                }				
=======
                    creep.moveTo(target, {reusePath: 30});
                }
				else {
					//repair successful, more repair needed?
					if (target.hits / target.hitsMax > percentage) {
						//no further repair at the moment
						creep.memory.wallTarget = undefined;
					}
				}
>>>>>>> origin/master
            }
            // if we can't fine one
            else {
                // look for construction sites
                roleBuilder.run(creep);
            }
        }
        // if creep is supposed to harvest energy from source
        else {
			// forget target
			creep.memory.wallTarget = undefined;
            // find closest source
            var source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (s) => s.energy > 0
            });
            // try to harvest energy, if the source is not in range
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards the source
<<<<<<< HEAD
                creep.moveTo(source, {reusePath: 5});
=======
                creep.moveTo(source, {reusePath: 30});
>>>>>>> origin/master
            }
        }
    }
};