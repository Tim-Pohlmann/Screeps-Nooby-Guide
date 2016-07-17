module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
    	// find closest source
		var returncode;
		var source = creep.pos.findClosestByPath(FIND_SOURCES,{filter: (s) => s.energy > 0});
		if (source == null) {
			//transfer from container
			var containers = creep.room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_CONTAINER
																		&& s.store[RESOURCE_ENERGY] > 0});
			source = containers[0];
			returncode = creep.withdraw(source, RESOURCE_ENERGY);
		}
		else {
			//harvest from source
			returncode = creep.harvest(source);
		}

		switch(returncode){
			case (OK):

			break;

			case (ERR_INVALID_TARGET):

			break;

			case (ERR_NOT_IN_RANGE):
				// move towards the source
				var code;

				switch (creep.memory.role) {
					case "upgrader00":
						var nearestCreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (s) => s.name != creep.name});
						var pathToCreep = creep.pos.findPathTo(nearestCreep);
						var pathToSource = creep.pos.findPathTo(source);
						code = 0;
					break;

					default:
						code = creep.moveTo(source);
					break;
				}
								
				if (code != 0) {
					switch (code) {
						case -11:
							//creep.say("Tired");
						break;
						
						case -7:
							creep.say("Invalid target!");
						break;
						
						case -2:
							creep.say("No path!");
						break;

						default:
							creep.say(code);
						break;
					}
				}
			break;

			default:
				creep.say(returncode);
			break;
		}	
    }

    
};