module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
    	var storage = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_STORAGE});

		if (storage.length > 0) {
			var containerArray = creep.findClosestContainer(-1);
			if (containerArray.container != undefined) {
				//Container found with resources other than energy
				var content = containerArray.container.store;
				var success = false;

				//try to transfer resources
				for (var c in content) {
					if (content[c] != RESOURCE_ENERGY) {
						//resource other than energy found
						if (creep.withdraw(containerArray.container, content[c]) == OK) {
							success = true;
						}
					}
				}

				if (success == false) {
					creep.moveTo(containerArray.container, {reusePath: 5})
				}
			}
			else if (_.sum(creep.carry) > 0) {
				//Unload stuff
				if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					// move towards it
					creep.moveTo(container, {reusePath: 5});
				}
				for (var c in creep.carry) {
					//TODO sorter dysfunctional
				}
				if (creep.transfer(containerArray.container,RESOURCE_ENERGY) == OK) {
					//container found
					container = containers[i];
					creep.memory.narrowContainer = container.id;
				}
			}
		}
	}
};