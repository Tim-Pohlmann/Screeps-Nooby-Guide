module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
    	// find closest source
		var returncode;
		var source = creep.pos.findClosestByPath(FIND_SOURCES,{filter: (s) => s.energy > 0});
		if (source != null) {

			var sourcepath = creep.pos.findPathTo(source);
			var sourcedist = sourcepath.length;
		}
		else {
			var sourcedist = 99999;
		}

		var containers = creep.room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_CONTAINER
			&& s.store[RESOURCE_ENERGY] > 0});
		if (containers.length > 0) {

			var containerpath = creep.pos.findPathTo(containers[0]);
			var containerdist = containerpath.length;
		}
		else {
			var containerdist = 99999;
		}

		if (containerdist < sourcedist) {
			//transfer from container
			returncode = creep.withdraw(containers[0], RESOURCE_ENERGY);
			source = containers[0];
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
				var code = creep.moveTo(source);
								
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