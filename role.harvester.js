var roleCollector = require('role.collector');

module.exports = {
    // state working = Returning energy to structure
	
    run: function(creep) {
        // if creep is bringing energy to a structure but has no energy left
        if (creep.carry.energy == 0) {

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
			var numberOfHarvesters = creep.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "harvester")});
			numberOfHarvesters = numberOfHarvesters.length;

			if (numberOfHarvesters < 2) {
				//only one harvester left, no tower refill
				var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
						filter: (s) => (s.structureType == STRUCTURE_SPAWN
					|| s.structureType == STRUCTURE_EXTENSION)
					&& s.energy < s.energyCapacity});
			}
			else {
				//towers included in energy distribution
				var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
						filter: (s) => (s.structureType == STRUCTURE_SPAWN
					|| s.structureType == STRUCTURE_EXTENSION
					|| s.structureType == STRUCTURE_TOWER)
					&& s.energy < s.energyCapacity});
			}
			// if we found one
			if (structure != undefined) {			

				if (structure.structureType == STRUCTURE_SPAWN && structure.energy == structure.energyCapacity) {
					roleUpgrader.run(creep);
				}					
				// try to transfer energy, if it is not in range
				else if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					// move towards it
					creep.moveTo(structure, {reusePath: 5});

				}					
			}
			else {
				var contArray = creep.findClosestContainer(0);
				var container = contArray.container;

				if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					// move towards it
					creep.moveTo(container, {reusePath: 5});
				}
			}
		}
        // if creep is supposed to harvest energy from source
        else {
        	roleCollector.run(creep);        	
        }
    }
};