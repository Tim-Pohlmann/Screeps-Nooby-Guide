module.exports = {
    // a function to run the logic for this role
    run: function(creep, target) {
    	// Collect energy from different sources
    	var returncode;

    	if (target == "source") {
    		var source = creep.pos.findClosestByPath(FIND_SOURCES,{filter: (s) => s.energy > 0});
    		returncode = creep.harvest(source);
    	}
    	else {
    		// Identify target by ID
    		if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
    			if(!creep.memory.path) {
    				creep.memory.path = creep.pos.findPathTo(target);				
    			}
    			creep.moveByPath(creep.memory.path);
    		}    		
    	}
    	switch (target) {
    		case "source":
    			
    		break;

    		case "droppedEnergy";
    			var sourcepath = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
    			returncode = creep.pickup(source);
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