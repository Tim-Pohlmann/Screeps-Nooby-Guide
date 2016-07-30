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
var moduleSpawner = require('module.spawner');

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
            if (Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername) {
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

                var BuilderRecruits = Game.rooms[r].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "repairer")});
                if (BuilderRecruits.length < 1) {
                    // find adjacent rooms
                    var exits = Game.map.describeExits(Game.rooms[r].name);

                    for (var x in exits) {
                        if(Game.rooms[exits[x]] != undefined){
                            var newBuilders = Game.rooms[exits[x]].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "repairer") && s.room.name == Game.rooms[exits[x]].name});
                            var targetCreep = newBuilders[0];
                            roomName=Game.rooms[exits[x]].name;
                        }
                    }

                    if (targetCreep != undefined) {
                        targetCreep.memory.homeroom = Game.rooms[r].name;
                        targetCreep.memory.spawn =  Game.rooms[r].controller.id;
                        console.log(targetCreep.name + " has been captured as a repairer by room " + roomName + ".");
                    }
                }

            }
        }
        else {
            // loop through all spawns of the room
            for (var spawn in spawns) {
                moduleSpawner.run(spawns[spawn]);
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
                roleProtector.run(creep, allies);
            }
            else if (creep.memory.role == 'claimer') {
                roleClaimer.run(creep);
            }
            else if (creep.memory.role == 'stationaryHarvester') {
                roleStationaryHarvester.run(creep);
            }
            else if (creep.memory.role == 'miner') {
                roleMiner.run(creep);
            }
        }
    }
};
