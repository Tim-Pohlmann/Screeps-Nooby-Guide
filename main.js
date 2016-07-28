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
var roleMiner = require('role.miner')

var playerUsername = "Pantek59";
var allies = new Array();
allies[0] = "king_lispi";
allies[1] = "Tanjera";

module.exports.loop = function () {
    
	// check for memory entries of died creeps by iterating over Memory.creeps
    for (var name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }
    var senex = _.filter(Game.creeps,{ ticksToLive: 1});
    if (senex.length > 0) {
        console.log(senex[0].name + " the \"" + senex[0].memory.role + "\" expired in room " + senex[0].room.name + ".");
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
                //Code for spawn scaling
                var numberOfSources;
                var numberOfMineralSources;

                //Check sources of the room
                if (spawns[spawn].memory.numberOfSources == undefined) {
                    var sources = spawns[spawn].room.find(FIND_SOURCES);
                    numberOfSources = sources.length;
                    spawns[spawn].memory.numberOfSources = numberOfSources;
                }
                else {
                    numberOfSources = spawns[spawn].memory.numberOfSources;
                }

                //Check extractors of the room
                if (spawns[spawn].memory.numberOfMinerals == undefined) {
                    var minsources = spawns[spawn].room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_EXTRACTOR)});
                    numberOfMineralSources = minsources.length;
                    spawns[spawn].memory.numberOfMinerals = numberOfMineralSources;
                }
                else {
                    mineralSources = spawns[spawn].memory.numberOfMinerals;
                }

                //Volume defined by flags
                var minimumNumberOfRemoteHarvesters = 0;
                var minimumNumberOfClaimers = 0;
                var minimumNumberOfProtectors = 0;
                var minimumNumberofStationaryHarvesters = 0;

                // Check for remote source flags
                var remoteSources = _.filter(Game.flags,{ memory: { function: 'remoteSource', spawn: spawns[spawn].id}});
                for (var t in remoteSources) {
                    //Iterate through remote source flags of this spawn
                    minimumNumberOfRemoteHarvesters += remoteSources[t].memory.volume;
                }

                // Check for narrow source flags
                var narrowSources = _.filter(Game.flags,{ memory: { function: 'narrowSource', spawn: spawns[spawn].id}});
                for (var t in remoteSources) {
                    //Iterate through remote source flags of this spawn
                    minimumNumberofStationaryHarvesters ++;
                }

                // Check for active flag "remoteController"
                var remoteController = _.filter(Game.flags,{ memory: { function: 'remoteController', spawn: spawns[spawn].id}});
                for (var t in remoteController) {
                    if (remoteController[t].room.controller.owner != undefined && remoteController[t].room.controller.owner.username == Game.rooms[r].controller.owner.username) {
                        //Target room already claimed
                        minimumNumberOfClaimers = 0;
                    }
                    else {
                        minimumNumberOfClaimers++;
                    }
                }

                //Spawning volumes scaling with # of sources in room
                var minimumNumberOfHarvesters = Math.ceil(numberOfSources * 1.5) - minimumNumberofStationaryHarvesters;
                var minimumNumberOfUpgraders = Math.ceil(numberOfSources * 1.0);
                var minimumNumberOfBuilders = Math.ceil(numberOfSources * 0.5);
                var minimumNumberOfRepairers = Math.ceil(numberOfSources * 0.5);
                var minimumNumberOfWallRepairers = Math.ceil(numberOfSources * 0.5);
                var minimumNumberOfMiners = numberOfMineralSources;

                var maxNumberOfCreeps = numberOfSources * 10;

                // Creeps not leaving room
                var numberOfHarvesters = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "harvester")});
                var numberOfStationaryHarvesters = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "stationaryHarvester")});
                var numberOfUpgraders = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "upgrader")});
                var numberOfBuilders = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "builder")});
                var numberOfRepairers = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "repairer")});
                var numberOfWallRepairers = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "wallRepairer")});
                var numberOfMiners = spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "miner")});

                //Creeps leaving room
                var numberOfRemoteHarvesters = _.filter(Game.creeps,{ memory: { role: 'remoteHarvester', spawn: spawns[spawn].id}});
                var numberOfProtectors = _.filter(Game.creeps,{ memory: { role: 'protector', spawn: spawns[spawn].id}});
                var numberOfClaimers = _.filter(Game.creeps,{ memory: { role: 'claimer', spawn: spawns[spawn].id}});

                numberOfHarvesters = numberOfHarvesters.length;
                numberOfStationaryHarvesters = numberOfStationaryHarvesters.length;
                numberOfRemoteHarvesters = numberOfRemoteHarvesters.length;
                numberOfUpgraders = numberOfUpgraders.length;
                numberOfBuilders = numberOfBuilders.length;
                numberOfRepairers = numberOfRepairers.length;
                numberOfWallRepairers = numberOfWallRepairers.length;
                numberOfProtectors = numberOfProtectors.length;
                numberOfClaimers = numberOfClaimers.length;
                numberOfMiners = numberOfMiners.length;

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
                    else if (numberOfRemoteHarvesters < minimumNumberOfRemoteHarvesters) {
                        var rolename = 'remoteHarvester';
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
                    else if (numberOfMiners < minimumNumberOfMiners) {
                        var rolename = 'miner';
                    }
                    else {
                        var rolename = 'repairer';
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

        for (tower in towers) {
            // Tower attack code
            var hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS);
            var maxHealBodyParts = 0;
            var HealBodyParts = 0;
            var healingInvader = undefined;

            for (var h in hostiles) {
                HealBodyParts = 0;
                for (var part in hostiles[h].body) {
                    if(hostiles[h].body[part].type == "heal") {
                        //Healing body part found
                        HealBodyParts++;
                    }
                }

                if (HealBodyParts > maxHealBodyParts) {
                    maxHealBodyParts = HealBodyParts;
                    healingInvader = hostiles[h].id;
                }
            }

            if(hostiles.length > 0) {
                if (healingInvader != undefined) {
                    hostiles[0] = Game.getObjectById(healingInvader);
                }
                var username = hostiles[0].owner.username;
                if (allies.indexOf(username) == -1) {
                    Game.notify("Hostile creep " + username + " spotted in room " + Game.rooms[r].name + "!");
                    towers.forEach(tower => tower.attack(hostiles[0]));
                }
            }

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
