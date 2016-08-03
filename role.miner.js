var roleBuilder = require('role.builder');

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
		var storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {	filter: (s) => (s.structureType == STRUCTURE_STORAGE) && _.sum(s.store) < s.storeCapacity});
		var resource;

        // if creep is supposed to transfer minerals to a structure
        if (creep.memory.working == true) {
			if (creep.carry[RESOURCE_ENERGY] > 0) {
				//somehow picked up energy
				var containerArray = creep.findClosestContainer(0);
				var container = containerArray.container;
				if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(container, {reusePath: 5});
				}
			}
			for (var t in creep.carry) {
				if (t != "energy") {
					resource = t;
					break;
				}
			}
			if (storage == null) {
				//No storage found in room
				var containerArray = creep.findClosestContainer(0);
				var container = containerArray.container;
				if (creep.transfer(container, resource) == ERR_NOT_IN_RANGE) {
						creep.moveTo(container, {reusePath: 5});
				}
			}
			else {
				//storage found
				if (creep.transfer(storage, resource) == ERR_NOT_IN_RANGE) {
					creep.moveTo(storage, {reusePath: 5});
				}
			}
		}
        else {
			//creep is supposed to harvest minerals from source or containers
			var containerArray = creep.findClosestContainer(-1);
			var containerResource;
			//console.log(containerArray.container);
			if (containerArray.container != undefined && storage != null) {
				//minerals waiting in containers
				//analyzing storage of container
				var store = containerArray.container.store;
				for (var s in store) {
					if (s != RESOURCE_ENERGY) {
						// mineral found in container
						containerResource = s;
					}
				}
				if (creep.withdraw(containerArray.container, containerResource) == ERR_NOT_IN_RANGE) {
					creep.moveTo(containerArray.container);
				}
			}
			else {
				//minerals waiting at source
				var mineral = creep.pos.findClosestByPath(FIND_MINERALS, {	filter: (s) => s.mineralAmount > 0});
				if (mineral != null && creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
					creep.moveTo(mineral);
				}
			}
        }
    }
};