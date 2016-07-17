// import modules
require('prototype.spawn')();
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleCollector = require('role.collector');
var roleJobber = require('role.jobber');
var roleRemoteHarvester = require('role.remoteHarvester');

module.exports.loop = function () {
    
	// check for memory entries of died creeps by iterating over Memory.creeps
    for (var name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
            console.log("One creep expired.");
        }
    }

    // Cycle through rooms    
    for (var r in Game.rooms) {
        //console.log(Game.map.describeExits(Game.rooms[r].name));

        // Tower code      
        var towers = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});

        if (towers.length > 0) {

            // Tower attack code
            var hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS);  

            if(hostiles.length > 0) {
                var username = hostiles[0].owner.username;
                Game.notify("Hostile creep " + username + " spotted!");
                     
                towers.forEach(tower => tower.attack(hostiles[0]));
            }

            //Healing code

            for (tower in towers) {                
                //Healing code
                var wounded = Game.rooms[r].find(FIND_MY_CREEPS, { 
                    filter: function(object) 
                    {
                        return (object.hits < object.hitsMax) && (object.name != creep.name);
                    }
                }); 

                if (wounded.length >0) {
                    towers[tower].heal(wounded[0]);
                }
                
                //Repairing code
                if (towers[tower].energy / towers[tower].energyCapacity > 0.8) {
                    var damage = Game.rooms[r].find(FIND_MY_STRUCTURES,{
                        filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART });
                    
                    if (damage.length > 0) {
                        towers[tower].repair(damage[0]);
                    }
                }
            }
        }

        // Search for dropped energy
        var energies=Game.rooms[r].find(FIND_DROPPED_ENERGY);

        for (energy in energies) {
            var energyID = energies[energy].id;
            var energyAmount = energies[energy].amount;

            var collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, { 
                filter: (s) => (s.carryCapacity - _.sum(s.carry) - energyAmount) > 0 });
            
            if (collector != null) {
                // Creep found to pick up dropped energy
                collector.memory.jobQueueObject = energyID;
                collector.memory.jobQueueTask = "pickUpEnergy";
                //console.log(energyID + ": " + energyAmount + " " + energies[energy].resourceType + " (" + Game.rooms[r] + ": " + energies[energy].pos.x + "/" + energies[energy].pos.y);
                //console.log(collector.name);
                roleJobber.run(collector, "droppedEnergy")
            }
        }
    }


	//Cycle through creeps
    // for every creep name in Game.creeps
    for (let name in Game.creeps) {
        // get the creep object
        var creep = Game.creeps[name];
        /*if (creep.memory.jobQueueTask != undefined) {
            creep.memory.jobQueueTask = undefined;
        }*/

        if (creep.memory.jobQueueTask != undefined) { // Creep has job pending
            //Job queue pending
            switch (creep.memory.jobQueueTask) {
                case "pickUpEnergy": //Dropped energy to be picked up
                    roleJobber.run(creep,"droppedEnergy");
                break;
            }

            creep.memory.jobQueueTask = undefined;
        }
        else {
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
    }
    
    // setup some minimum numbers for different roles
    var minimumNumberOfHarvesters = 3;
    var minimumNumberOfRemoteHarvesters = 0;
    var minimumNumberOfUpgraders = 2;
    var minimumNumberOfBuilders = 1;
    var minimumNumberOfRepairers = 1;
    var minimumNumberOfWallRepairers = 1;
	var maxNumberOfCreeps = 30;

    //console.log(Game.flags.targetRoom.id);
	
    var numberOfHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
    var numberOfRemoteHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'remoteHarvester');
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
		// if not enough remoteHarvesters
        else if (numberOfWallRepairers < minimumNumberOfRemoteHarvesters) { var rolename='remoteHarvester';}
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
};
