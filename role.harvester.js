module.exports = {
    // state working = Returning energy to structure
	
    run: function(creep) {
        // if creep is bringing energy to a structure but has no energy left
<<<<<<< HEAD
        if (creep.carry.energy == 0) {
=======
        if (creep.memory.working == true && creep.carry.energy == 0) {
>>>>>>> origin/master
            // switch state to harvesting
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            
				
			// find closest spawn, extension or tower which is not full
			var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
				// the second argument for findClosestByPath is an object which takes
				// a property called filter which can be a function
				// we use the arrow operator to define it
				filter: (s) => (s.structureType == STRUCTURE_SPAWN
							 || s.structureType == STRUCTURE_EXTENSION
							 || s.structureType == STRUCTURE_TOWER)
							 && s.energy < s.energyCapacity
			});
						
			// if we found one
			if (structure != undefined) {			

				if (structure.structureType == STRUCTURE_SPAWN && structure.energy == structure.energyCapacity) {
					roleUpgrader.run(creep);
				}					
				// try to transfer energy, if it is not in range
				else if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					// move towards it
<<<<<<< HEAD
					creep.moveTo(structure, {reusePath: 10});
=======
					creep.moveTo(structure, {reusePath: 30});
>>>>>>> origin/master
				}					
			}
		}
        // if creep is supposed to harvest energy from source
        else {
			// find closest source
<<<<<<< HEAD
			
			//var source = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
			//console.log(source);
			
			source = creep.pos.findClosestByPath(FIND_SOURCES);	
			// try to harvest energy, if the source is not in range
			if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
				// move towards the source
				var code = creep.moveTo(source, {reusePath: 10})
				if (code != 0) {
					switch (code)
					{
						case -11:
							creep.say("Too tired!");
						break;
						
						case -7:
							creep.say("Invalid target!");
						break;
						
						case -2:
							creep.say("No path to target!");
						break;
					}
				}
=======
			var source = creep.pos.findClosestByPath(FIND_SOURCES);
	
			// try to harvest energy, if the source is not in range
			if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
				// move towards the source
				creep.moveTo(source, {reusePath: 30});					
>>>>>>> origin/master
			}
        }
    }
};