// import modules
require('prototype.spawn')();
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleCollector = require('role.collector');

module.exports.loop = function () {
    
	// check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
            console.log("One creep expired.");
        }
    }
	
	//console.log("Creep Action Start: " + Game.cpu.getUsed());
    // for every creep name in Game.creeps
    for (let name in Game.creeps) {
        // get the creep object
        var creep = Game.creeps[name];

        // if creep is harvester, call harvester script
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
			//console.log("Post Harvester: " + Game.cpu.getUsed());
        }
        // if creep is upgrader, call upgrader script
        else if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
			//console.log("Post Upgrader: " + Game.cpu.getUsed());
        }		
        // if creep is builder, call builder script
        else if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
			//console.log("Post Builder: " + Game.cpu.getUsed());
        }
		        // if creep is repairer, call repairer script
        else if (creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
			//console.log("Post Repairer: " + Game.cpu.getUsed());
        }
        // if creep is wallRepairer, call wallRepairer script
        else if (creep.memory.role == 'wallRepairer') {
            roleWallRepairer.run(creep);
			//console.log("Post WallRepairer: " + Game.cpu.getUsed());
        }
    }
    
    // setup some minimum numbers for different roles
    var minimumNumberOfHarvesters = 3;
    var minimumNumberOfUpgraders = 3;
    var minimumNumberOfBuilders = 1;
    var minimumNumberOfRepairers = 3;
    var minimumNumberOfWallRepairers = 2;
	var maxNumberOfCreeps = 50;
	
    // count the number of creeps alive for each role
    // _.sum will count the number of properties in Game.creeps filtered by the
    //  arrow function, which checks for the creep being a harvester
    var numberOfHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
    var numberOfUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
    var numberOfBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'builder');
    var numberOfRepairers = _.sum(Game.creeps, (c) => c.memory.role == 'repairer');
    var numberOfWallRepairers = _.sum(Game.creeps, (c) => c.memory.role == 'wallRepairer');

    var energy = Game.spawns.Spawn1.room.energyCapacityAvailable;
    var name = undefined;
	
	var totalCreeps = numberOfBuilders + numberOfHarvesters + numberOfRepairers + numberOfUpgraders + numberOfWallRepairers;
	
	if (maxNumberOfCreeps > totalCreeps) {		
			// if not enough harvesters
		if (numberOfHarvesters < minimumNumberOfHarvesters) {
			// try to spawn one
			var rolename='harvester';			

			// if spawning failed and we have no harvesters left
			if (numberOfHarvesters == 0) {
				// spawn one with what is available
				var rolename='miniharvester';
			}
		}
		// if not enough upgrader
		else if (numberOfUpgraders < minimumNumberOfUpgraders) { var rolename='upgrader';}
		// if not enough repairers
		else if (numberOfRepairers < minimumNumberOfRepairers) { var rolename='repairer';}
		// if not enough builders
		else if (numberOfBuilders < minimumNumberOfBuilders) { var rolename='builder';}
		// if not enough wallRepairers
		else if (numberOfWallRepairers < minimumNumberOfWallRepairers) { var rolename='wallRepairer';}
		else { var rolename='builder';}
		
		name = Game.spawns.Spawn1.createCustomCreep(energy, rolename);
		// print name to console if spawning was a success
		// name > 0 would not work since string > 0 returns false
		if (!(name < 0)) {
			console.log("Spawned new creep: " + name + ": " + rolename);
		}
	}
	else {
		//console.log("Max Creeps Reached: " + totalCreeps);
	}

    // Cycle through rooms    
    for (let r in Game.rooms) {
        // tower code
        var hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS);
        
        if(hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            Game.notify(`Hostile creep ${username} spotted!`);

            var towers = Game.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            towers.forEach(tower => tower.attack(hostiles[0]));
        }
    }
};
