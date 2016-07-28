module.exports = {
    // state working = Returning minerals to structure
    run: function(creep) {
        // if creep is bringing minerals to a structure but is empty now
        if (_.sum(creep.carry) == 0) {
            // switch state to harvesting
            creep.memory.working = false;
        }
        // if creep is harvesting minerals but is full
        else if (_.sum(creep.carry) == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer minerals to a structure
        if (creep.memory.working == true) {
			// find closest container or storage which is not full
			var storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {	filter: (s) => (s.structureType == STRUCTURE_STORAGE) && s.energy < s.energyCapacity});

			if (storage == null) {
				//No storage found in room
				var containerArray = creep.findClosestContainer(0);
				var container = containerArray.container;
				if (creep.transfer(container, RESOURCES_ALL) == ERR_NOT_IN_RANGE) {
						creep.moveTo(container, {reusePath: 5});
				}
			}
			else {
				//storage found
				if (creep.transfer(storage, RESOURCES_ALL) == ERR_NOT_IN_RANGE) {
					creep.moveTo(storage, {reusePath: 5});
				}
			}
		}
        else {
			//creep is supposed to harvest minerals from source

			var containerArray = creep.findClosestContainer(-1);
			if (containerArray.container != undefined) {
				//minerals waiting in containers
				var storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {	filter: (s) => (s.structureType == STRUCTURE_STORAGE) && _.sum(s.store) < s.storeCapacity});
				if (storage != null) {
					//storage found
				}
			}
			else {
				//minerals waiting at source
				var mineral = creep.findClosestByPath(FIND_MINERALS);
				if (creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
					creep.moveTo(mineral);
				}
			}
        }
    }
};