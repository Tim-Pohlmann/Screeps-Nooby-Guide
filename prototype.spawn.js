module.exports = function() {
    // create a new function for StructureSpawn
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName) {
			var size = 0;
			var sizelimit;
			var body = [];
			
			switch (roleName) {
				case "miniharvester":				
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 1;
					roleName = "harvester";
					break;

				case "remoteHarvester":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=350;
					sizelimit = 4;
					break;
				
				case "harvester":
					body.push(WORK); //100
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=300;
					sizelimit = 4;
					break;

				
				case "upgrader":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=300;
					sizelimit = 4;
					break;
				
				case "repairer":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 5;
					break;

				case "builder":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=250;
					sizelimit = 5;
					break;

				case "wallRepairer":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY);  //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=300;
					sizelimit = 4;
					break;

				case "claimer":
					body.push(CLAIM);//600
					body.push(CLAIM);//600
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=1300;
					sizelimit = 15;
					break;

				case "protector":
					body.push(ATTACK);//100
					body.push(MOVE);  //50
					size=150;
					sizelimit = 15;
					break;

				default:
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 6;
					break;
			}
			
         // create a balanced body as big as possible with the given energy
         var numberOfParts = Math.floor(energy / size);
         var finalBody = [];

		if (numberOfParts > sizelimit) {
			numberOfParts = sizelimit;
		}

		for (let i = 0; i < numberOfParts; i++) {
			for (let part = 0; part < body.length; part++) {
				finalBody.push(body[part]);
			}
		}

		// create creep with the created body and the given role
		var spawnID = this.id;
		return this.createCreep(finalBody, undefined, { role: roleName, working: false, spawn: spawnID, jobQueueTask: undefined});
	}
};