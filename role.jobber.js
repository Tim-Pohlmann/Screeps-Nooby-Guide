module.exports = {
    // a function to run the logic for this role
    run: function(creep, target) {
    	// Collect energy from different sources
    	var returncode;

    	switch (target) {
    		case "source":
				var source = creep.pos.findClosestByPath(FIND_SOURCES,{filter: (s) => s.energy > 0});
				returncode = creep.harvest(source);
    			break;

			case "droppedEnergy":
    			var source = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
    			returncode = creep.pickup(source);

				creep.jobQueueTask = undefined;
    			break;

			case "remoteBuild":
				creep.jobQueueTask = undefined;
				break;
    	}

    	//Collecting finished
    	switch(returncode){
			case (OK):

			break;

			case (ERR_INVALID_TARGET):
				
			break;

			case (ERR_NOT_IN_RANGE):
				// move towards the source				

				if (creep.memory.role == "test") {
					var nearestCreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (s) => s.name != creep.name});
					var pathToCreep = creep.pos.findPathTo(nearestCreep);
					var pathToSource = creep.pos.findPathTo(source);
					code = 0;
				}
				else {
					var code = creep.moveTo(source);
				}
				
								
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

					case 0:
					break;

					default:
						creep.say(code);
					break;					
				}
			break;

			default:
				creep.say(returncode);
			break;
		}	
    }    
};