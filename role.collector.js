module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
    	// find closest source
			
		var source = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);

		if (source == null) {
			source = creep.pos.findClosestByPath(FIND_SOURCES,{filter: (s) => s.energy > 0});
			
			if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
				// move towards the source
				var code = creep.moveTo(source, {reusePath: 5})
				if (code != 0) {
					switch (code)
					{
						case -11:
							creep.say("Too tired!");
						break;
						
						case -7:
							creep.say("Invalid target!");
						break;
						
						case -2:
							creep.say("No path to target!");
						break;
					}
				}
			}
		}	
		else // no dropped energy found
		{
		
			// try to harvest energy, if the source is not in range
			if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
				// move towards the source
				var code = creep.moveTo(source, {reusePath: 5})
				if (code != 0) {
					switch (code)
					{
						case -11:
							creep.say("Too tired!");
						break;
						
						case -7:
							creep.say("Invalid target!");
						break;
						
						case -2:
							creep.say("No path to target!");
						break;
					}
				}
			}
        }
    }
};