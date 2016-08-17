module.exports = function() {
    // create a new function for StructureSpawn
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName, spawnID) {
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
					roleName = "harvester";// try to upgrade the controller
					break;

				case "remoteHarvester":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=250;
					sizelimit = 10;
					break;
				
				case "harvester":
					body.push(WORK); //100
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
                    body.push(MOVE);  //50
					size=350;
					sizelimit = 99;
					break;

				case "stationaryHarvester":
					body.push(WORK); //100
					body.push(WORK); //100
					body.push(WORK); //100
                    body.push(WORK); //100
                    body.push(WORK); //100
                    body.push(WORK); //100
					body.push(CARRY); //50
                    body.push(CARRY); //50
					body.push(MOVE);  //50
                    body.push(MOVE);  //50
					size=800;
					sizelimit = 1;
					break;
				
				case "upgrader":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=300;
					sizelimit = 10;
					break;
				
				case "repairer":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 8;
					break;

				case "builder":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 12;
					break;

				case "wallRepairer":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY);  //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=300;
					sizelimit = 10;
					break;

				case "claimer":
					body.push(CLAIM);//600
					body.push(CLAIM);//600
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=1300;
					sizelimit = 1;
					break;

				case "protector":
					body.push(ATTACK);//100
					body.push(ATTACK);//100
					body.push(MOVE);  //50
					body.push(MOVE);  //50
                    body.push(MOVE);  //50
					size=350;
					sizelimit = 10;
					break;

				case "miner":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=300;
					sizelimit = 5;
					break;

                case "distributor":
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    size=200;
                    sizelimit = 5;
                    break;

                case "demolisher":
                    body.push(WORK); //100
                    body.push(CARRY); //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    size=250;
                    sizelimit = 10;
                    break;

				default:
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 8;
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
		var homeRoom = this.room.name;

		return this.createCreep(finalBody, undefined, { role: roleName, working: false, spawn: spawnID, jobQueueTask: undefined, homeroom: homeRoom});
	}
};