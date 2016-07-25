//FLAGS
//remoteController = controller in an room to be claimed or reserved, triggers protector
//remoteSource = source in remote room to be harvested and returned home, triggers protector


// import modules
require('prototype.spawn')();
require('prototype.creep')();
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleJobber = require('role.jobber');
var roleRemoteHarvester = require('role.remoteHarvester');
var roleProtector = require('role.protector');
var roleClaimer = require('role.claimer')
var roleStationaryHarvester = require('role.stationaryHarvester');


var playerUsername = "Pantek59";

module.exports.loop = function () {
    
	// check for memory entries of died creeps by iterating over Memory.creeps
    for (var name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
            console.log(name + " expired.");
        }
    }

    // Cycle through rooms    
    for (var r in Game.rooms) {
        // Spawn code
        var spawns = Game.rooms[r].find(FIND_MY_SPAWNS);

        if (spawns.length == 0) {
            //room has no spawner yet

            if (Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername) {
                //room is owned and should be updated

                var upgraderRecruits = Game.rooms[r].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "upgrader")});
                if (upgraderRecruits.length < 1) {
                    // find adjacent rooms
                    var exits = Game.map.describeExits(Game.rooms[r].name);
                    var roomName;
                    for (var x in exits) {
                        if(Game.rooms[exits[x]] != undefined){
                            var newUpgraders = Game.rooms[exits[x]].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "upgrader") && s.room == Game.rooms[exits[x]]});
                            if (newUpgraders.length > 0) {
                                var targetCreep = newUpgraders[0];
                                roomName=Game.rooms[exits[x]].name;
                            }
                        }
                    }
                    if (targetCreep != undefined) {
                        targetCreep.memory.homeroom = Game.rooms[r].name;
                        targetCreep.memory.spawn =  Game.rooms[r].controller.id;
                        console.log(targetCreep + " has been captured as an upgrader by room " + roomName + ".");
                    }
                }

                var BuilderRecruits = Game.rooms[r].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "builder")});
                if (BuilderRecruits.length < 1) {
                    // find adjacent rooms
                    var exits = Game.map.describeExits(Game.rooms[r].name);

                    for (var x in exits) {
                        if(Game.rooms[exits[x]] != undefined){
                            var newBuilders = Game.rooms[exits[x]].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "builder") && s.room.name == Game.rooms[exits[x]].name});
                            var targetCreep = newBuilders[0];
                            roomName=Game.rooms[exits[x]].name;
                        }
                    }

                    if (targetCreep != undefined) {
                        targetCreep.memory.homeroom = Game.rooms[r].name;
                        targetCreep.memory.spawn =  Game.rooms[r].controller.id;
                        console.log(targetCreep.name + " has been captured as an builder " + roomName + ".");
                    }
                }

            }
        }
        else {
            // loop through all spawns of the room
            for (var spawn in spawns) {
                /* TODO: Search room for flags by attribute -> flag name can only be used once
                var flags = Game.rooms[r].find(FIND_FLAGS, {filter: (s) => (s.memory.spawn == spawns[spawn].id)});
                for (var f in flags) {
                    if (flags[f].memory.spawn != undefined) {
                        switch (flags[f].memory.function) {
                            case "narrowSource":
                                //Marker for stationary harvesters
                                break;

                            case "remoteSource":
                                //Marker for remote harvesters
                                break;
                        }
                    }
                }
                */
                //Code for spawn scaling
                var numberOfSources;
                if (spawns[spawn].memory.numberOfSources == undefined) {
                    var sources = spawns[spawn].room.find(FIND_SOURCES);
                    numberOfSources = sources.length;
                    spawns[spawn].memory.numberOfSources = numberOfSources;
                }
                else {
                    numberOfSources = spawns[spawn].memory.numberOfSources;
                }

                //Volume defined by flags
                var minimumNumberOfRemoteHarvesters = 0;
                var minimumNumberOfClaimers = 0;
                var minimumNumberOfProtectors = 0;
                var minimumNumberofStationaryHarvesters = 0;

                //Spawning volumes scaling with # of sources in room
                var minimumNumberOfHarvesters = Math.ceil(numberOfSources * 1.5);
                var minimumNumberOfUpgraders = Math.ceil(numberOfSources * 1.0);
                var minimumNumberOfBuilders = Math.ceil(numberOfSources * 0.5);
                var minimumNumberOfRepairers = Math.ceil(numberOfSources * 0.5);
                var minimumNumberOfWallRepairers = Math.ceil(numberOfSources * 0.5);

                // Iterate through all flags
                for (let name in Game.flags) {
                    var flag = Game.flags[name];
                    if (flag.memory.spawn == spawns[spawn].id) {
                        //flag active for current spawn
                        switch(flag.memory.function) {
                            case "remoteSource":
                                minimumNumberOfRemoteHarvesters = minimumNumberOfRemoteHarvesters + flag.memory.volume;
                                //console.log(minimumNumberOfRemoteHarvesters);
                                break;

                            case "narrowSource":
                                minimumNumberofStationaryHarvesters++;
                                break;

                            case "remoteController":
                                break;

                            case "protector":
                                break;
                        }
                    }
                }


                /* Check for active flag "remoteSource"
                var remoteSource = Game.rooms[r].find(FIND_FLAGS, {filter: (s) => (s.memory.spawn == spawns[spawn].id) && s.memory.function == "remoteSource"});
                if (remoteSource.length == 0) {
                    minimumNumberOfRemoteHarvesters = 0;
                }
                else {
                    if (remoteSource[0].memory.volume == undefined) {
                        remoteSource[0].memory.volume = 0;
                    }
                    minimumNumberOfRemoteHarvesters = remoteSource[0].memory.volume;
                }
                */

                // Check for active flag "remoteController"
                var remoteController = Game.rooms[r].find(FIND_FLAGS, {filter: (s) => (s.memory.spawn == spawns[spawn].id) && s.memory.function == "remoteController"});
                if (remoteController.length == 0) {
                    minimumNumberOfClaimers = 0;
                }
                else if (remoteController.room.controller.owner != undefined && remoteController.room.controller.owner.username == Game.rooms[r].controller.owner.username) {
                    //Target room already claimed
                    minimumNumberOfClaimers = 0;
                }
                //minimumNumberOfRemoteHarvesters = 0;

                var maxNumberOfCreeps = Math.ceil(numberOfSources * 10);

                var numberOfHarvesters = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "harvester")});
                var numberOfStationaryHarvesters = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "stationaryHarvester")});
                var numberOfRemoteHarvesters = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "remoteHarvester")});
                var numberOfUpgraders = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "upgrader")});
                var numberOfBuilders = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "builder")});
                var numberOfRepairers = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "repairer")});
                var numberOfWallRepairers = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "wallRepairer")});
                var numberOfProtectors = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "protector")});
                var numberOfClaimers = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "claimer")});

                numberOfHarvesters = numberOfHarvesters.length;
                numberOfStationaryHarvesters = numberOfStationaryHarvesters.length;
                numberOfRemoteHarvesters = numberOfRemoteHarvesters.length;
                numberOfUpgraders = numberOfUpgraders.length;
                numberOfBuilders = numberOfBuilders.length;
                numberOfRepairers = numberOfRepairers.length;
                numberOfWallRepairers = numberOfWallRepairers.length;
                numberOfProtectors = numberOfProtectors.length;
                numberOfClaimers = numberOfClaimers.length;
                var energy = spawns[spawn].room.energyCapacityAvailable;
                var name = undefined;

                var totalCreeps = _.sum(Game.creeps, (c) => c.memory.spawn == spawns[spawn].id);
                if (maxNumberOfCreeps > totalCreeps) {
                    // if not enough harvesters
                    if (numberOfHarvesters < minimumNumberOfHarvesters) {
                        // try to spawn one

                        var rolename = 'harvester';
                        // if spawning failed and we have no harvesters left

                        if (numberOfHarvesters == 0 || spawns[spawn].room.energyCapacityAvailable < 350) {
                            // spawn one with what is available
                            var rolename = 'miniharvester';
                        }
                    }
                    else if (numberOfStationaryHarvesters < minimumNumberofStationaryHarvesters) {
                        var rolename = 'stationaryHarvester';
                    }
                    else if (numberOfUpgraders < minimumNumberOfUpgraders) {
                        var rolename = 'upgrader';
                    }
                    else if (numberOfRepairers < minimumNumberOfRepairers) {
                        var rolename = 'repairer';
                    }
                    else if (numberOfBuilders < minimumNumberOfBuilders) {
                        var rolename = 'builder';
                    }
                    else if (numberOfWallRepairers < minimumNumberOfWallRepairers) {
                        var rolename = 'wallRepairer';
                    }
                    else if (numberOfProtectors < minimumNumberOfProtectors) {
                        var rolename = 'protector';
                    }
                    else if (numberOfClaimers < minimumNumberOfClaimers) {
                        var rolename = 'claimer';
                    }
                    else if (numberOfRemoteHarvesters < minimumNumberOfRemoteHarvesters) {
                        var rolename = 'remoteHarvester';
                    }
                    else {
                        var rolename = 'builder';
                    }

                    name = spawns[spawn].createCustomCreep(energy, rolename);
                    // print name to console if spawning was a success
                    // name > 0 would not work since string > 0 returns false
                    if (!(name < 0)) {
                        console.log("Spawned new creep: " + name + " (" + rolename + ") in room " + Game.rooms[r].name);
                    }
                    else {
                        //console.log("Spawn error (room " + Game.rooms[r] + "): " + name);
                    }
                }
                else {
                    //console.log("Room " + Game.rooms[r] + " reached max creep level.");
                }
            }
        }

        // Tower code      
        var towers = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});

        if (towers.length > 0) {

            // Tower attack code
            var hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS);  

            if(hostiles.length > 0) {
                var username = hostiles[0].owner.username;
                Game.notify("Hostile creep " + username + " spotted in room " + Game.rooms[r].name + "!");
                towers.forEach(tower => tower.attack(hostiles[0]));
            }

            //Healing code
            for (tower in towers) {                
                //Healing code
                var wounded = Game.rooms[r].find(FIND_MY_CREEPS, { filter: (s) => s.hits < s.hitsMax});

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

            if (energyAmount > 5) {
                var collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                        filter: (s) => (s.carryCapacity - _.sum(s.carry) - energyAmount) > 0
                    && s.memory.role != "stationaryHarvester"});

                if (collector == null) {
                    var collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                            filter: (s) => (s.carryCapacity - _.sum(s.carry)) > 0
                        && s.memory.role != "stationaryHarvester"});
                }

                if (collector != null) {
                    // Creep found to pick up dropped energy
                    collector.memory.jobQueueObject = energyID;
                    collector.memory.jobQueueTask = "pickUpEnergy";
                    roleJobber.run(collector, "droppedEnergy")
                }
            }
        }
    }


	//Cycle through creeps
    // for every creep name in Game.creeps
    for (let name in Game.creeps) {
        // get the creep object
        var creep = Game.creeps[name];

        //Check for job queues
        if (creep.memory.jobQueueTask != undefined) {
            //Job queue pending
            switch (creep.memory.jobQueueTask) {
                case "pickUpEnergy": //Dropped energy to be picked up
                    roleJobber.run(creep,"droppedEnergy");
                    break;

                case "remoteBuild": //Room without spawner needs builder
                    var newroom = Game.getObjectById(creep.memory.jobQueueObject);
                    break;
            }
            creep.memory.jobQueueTask = undefined;
        }
        else {
            // if creep is harvester, call harvester script
            if (creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            // if creep is upgrader, call upgrader script
            else if (creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }		
            // if creep is builder, call builder script
            else if (creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
    		        // if creep is repairer, call repairer script
            else if (creep.memory.role == 'repairer') {
                roleRepairer.run(creep);
            }
            // if creep is wallRepairer, call wallRepairer script
            else if (creep.memory.role == 'wallRepairer') {
                roleWallRepairer.run(creep);
            }
            // if creep is remoteHarvester, call remoteHarvester script
            else if (creep.memory.role == 'remoteHarvester') {
                roleRemoteHarvester.run(creep);
            }
            else if (creep.memory.role == 'protector') {
                roleProtector.run(creep);
            }
            else if (creep.memory.role == 'claimer') {
                roleClaimer.run(creep);
            }
            else if (creep.memory.role == 'stationaryHarvester') {
                roleStationaryHarvester.run(creep);
            }
        }
    }
};
