module.exports = function() {
    // create a new function for StructureSpawn
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName) {
			var size = 0;
			var body = [];
			
			switch (roleName) {
				case "miniharvester":				
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
				break;
				
				case "harvester":
					body.push(WORK); //100
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=300;
				break;
				
				case "upgrader":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=300;

				
				break;
				
				case "repairer":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=250;
				break;

				case "builder":
				body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY);  //50
					body.push(MOVE);  //50
					size=250;
				break;

				case "wallRepairer":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY);  //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=300;
				break;
						
				default:
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
				break;
			}
			
         // create a balanced body as big as possible with the given energy
         var numberOfParts = Math.floor(energy / size);
         var finalBody = [];
         
         if (roleName=="miniharvester") {
         	roleName = "harvester";
         	finalBody = body;
         }
		else {	
			for (let i = 0; i < numberOfParts; i++) {
				for (let part = 0; part < body.length; part++) {
					finalBody.push(body[part]);					
				}			
         	}
        }
			//console.log(this.canCreateCreep(finalBody));

            // create creep with the created body and the given role
            return this.createCreep(finalBody, undefined, { role: roleName, working: false });
        };
};