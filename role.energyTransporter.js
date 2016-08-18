const RESOURCE_SPACE = "space";
const delayPathfinding = 2;

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
        else if (_.sum(creep.carry) == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
			// find closest spawn, extension or tower which is not full
            var structure = Game.getObjectById(creep.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER));
			// if we found one
			if (structure != undefined && structure != null) {
				// try to transfer energy, if it is not in range
				if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					// move towards it
					creep.moveTo(structure, {reusePath: delayPathfinding});
				}
			}
			else {
				// spawn, extensions and towers full with energy
			    //var storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {	filter: (s) => (s.structureType == STRUCTURE_STORAGE) && _.sum(s.store) < s.storeCapacity});
                var container = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);

				if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					// move towards it
					creep.moveTo(container, {reusePath: delayPathfinding});
				}
			}
		}
        // if creep is supposed to harvest energy from source
        else {
        	roleCollector.run(creep);
        }
    }
};