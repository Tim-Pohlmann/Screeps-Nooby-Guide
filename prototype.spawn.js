module.exports = function() {
    // create a new function for StructureSpawn
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName) {
			var size = 0;
			var body = [];
			
			switch (roleName) {
				case "miniharvester":
				case "harvester":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
				break;
				
				case "upgrader":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=250;
				
				break;
				
				case "repairer":
				case "builder":
				case "wallRepairer":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY);  //50
					body.push(MOVE);  //50
					size=250;
				break;
						
				default:
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
				break;
			}
			
            // create a balanced body as big as possible with the given energy unless it is a MiniHarvester.
			if (roleName == "miniharvester") {
				var numberOfParts=1;
			}
            else {
				var numberOfParts = Math.floor(energy / size);
			}
            var finalBody = [];
			
			for (let i = 0; i < numberOfParts; i++) {
				for (part in body) {
					finalBody.push(part);
				}			
            }

            // create creep with the created body and the given role
            return this.createCreep(body, undefined, { role: roleName, working: false });
        };
};