// import modules
require('prototype.spawn')();
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');



module.exports.loop = function () {
    
	// check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
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
            //roleWallRepairer.run(creep);
			//console.log("Post WallRepairer: " + Game.cpu.getUsed());
        }
    }
    
    // setup some minimum numbers for different roles
    var minimumNumberOfHarvesters = 2;
    var minimumNumberOfUpgraders = 1;
    var minimumNumberOfBuilders = 1;
    var minimumNumberOfRepairers = 1;
    var minimumNumberOfWallRepairers = 0;
	var maxNumberOfCreeps = 30;
	
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
			name = Game.spawns.Spawn1.createCustomCreep(energy, 'harvester');

			// if spawning failed and we have no harvesters left
			if (name == ERR_NOT_ENOUGH_ENERGY && numberOfHarvesters == 0) {
				// spawn one with what is available
				name = Game.spawns.Spawn1.createCustomCreep(
					Game.spawns.Spawn1.room.energyAvailable, 'harvester');
			}
		}
		// if not enough upgraders
		else if (numberOfUpgraders < minimumNumberOfUpgraders) {		
			name = Game.spawns.Spawn1.createCustomCreep(energy, 'upgrader');
		}
		// if not enough repairers
		else if (numberOfRepairers < minimumNumberOfRepairers) {
			name = Game.spawns.Spawn1.createCustomCreep(energy, 'repairer');
		}
		// if not enough builders
		else if (numberOfBuilders < minimumNumberOfBuilders) {
			name = Game.spawns.Spawn1.createCustomCreep(energy, 'builder');
		}
		// if not enough wallRepairers
		else if (numberOfWallRepairers < minimumNumberOfWallRepairers) {
			name = Game.spawns.Spawn1.createCustomCreep(energy, 'wallRepairer');
		}
		else {
			// else try to spawn a builder
			name = Game.spawns.Spawn1.createCustomCreep(energy, 'builder');
		}
		// print name to console if spawning was a success
		// name > 0 would not work since string > 0 returns false
		if (!(name < 0)) {
			console.log("Spawned new creep: " + name + ": #" + totalCreeps);
		}
	}
	else {
		console.log("Max Creeps Reached: " + totalCreeps);
	}	
};
