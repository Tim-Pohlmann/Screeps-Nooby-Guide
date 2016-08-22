const RESOURCE_SPACE = "space";

var roleCollector = require('role.collector');

module.exports = {
    // state working = Returning energy to structure
	
    run: function(creep) {
        // if creep is bringing energy to a structure but has no energy left
        if (creep.carry.energy == 0) {
            if (creep.memory.working == true) {
                delete creep.memory.targetBuffer;
            }
            // switch state to harvesting
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.carry.energy == creep.carryCapacity) {
            if (creep.memory.working == false) {
                delete creep.memory.targetBuffer;
            }
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
			// find closest spawn, extension or tower which is not full
			var numberOfHarvesters = creep.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "harvester")}).length;
			var numberOfTransporters = creep.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "energyTransporter")}).length;
			var structure;

			if (numberOfTransporters > 0 || numberOfHarvesters < 2 || (creep.room.memory.hostiles > 0 && creep.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "protector")}).length == 0)) {
				//no tower refill;
                structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION);
			}
			else {
				//towers included in energy distribution
                structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER);
			}
			// if we found one
			if (structure != undefined && structure != null) {
				// try to transfer energy, if it is not in range
				if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					// move towards it
					creep.moveTo(structure, {reusePath: 3});
				}
			}
			else {
                var container = creep.findResource(RESOURCE_SPACE, STRUCTURE_STORAGE);
				if (container == null || container == undefined) {
                    container = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
				}

				if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					// move towards it
					creep.moveTo(container, {reusePath: 3});
				}
			}
		}
        // if creep is supposed to harvest energy from source
        else {
        	roleCollector.run(creep);
        }
    }
};