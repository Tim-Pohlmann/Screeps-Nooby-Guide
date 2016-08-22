const CPUdebug = false;

const delayPathfinding = 2;
const delayRoomScanning = 20;
const RESOURCE_SPACE = "space";

require('prototype.spawn')();
require('prototype.creep.findClosestContainer')();
require('prototype.creep.findMyFlag')();
require('prototype.creep.findResource')();

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
var roleMiner = require('role.miner');
var roleDistributor = require("role.distributor");
var roleDemolisher = require('role.demolisher');
var moduleSpawner = require('module.spawner');
var roleEnergyTransporter = require("role.energyTransporter");

var playerUsername = "Pantek59";
var allies = new Array();
allies.push("king_lispi");
allies.push("Tanjera");
allies.push("Atavus");
allies.push("BlackLotus");

// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function() {
  profiler.wrap(function() {
     if (CPUdebug == true) {console.log("Start: " + Game.cpu.getUsed())}

	// check for memory entries of died creeps by iterating over Memory.creeps
    for (var name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }
    var senex = _.filter(Game.creeps,{ ticksToLive: 1});
    for (var ind in senex) {
        console.log("Creep expired: " + senex[ind].name + " the \"" + senex[ind].memory.role + "\" in room " + senex[ind].room.name + ".");
    }
    if (CPUdebug == true) {console.log("Start cycling through rooms: " + Game.cpu.getUsed())}
    // Cycle through rooms    
    for (var r in Game.rooms) {
        //Save # of hostile creeps in room
        Game.rooms[r].memory.hostiles = 0;
        var enemies = Game.rooms[r].find(FIND_HOSTILE_CREEPS);
        for (var cr in enemies) {
            if (allies.indexOf(enemies[cr].owner.username) == -1) {
                Game.rooms[r].memory.hostiles++;
            }
        }

        if (Game.rooms[r].memory.terminalEnergyCost == undefined) {
            Game.rooms[r].memory.terminalEnergyCost = 0;
        }

        //  Refresher (will be executed every few ticks)
        var searchResult;

        if (Game.time % delayRoomScanning == 0) {
            Game.rooms[r].memory.resourceTicker = Game.time;

            // Preloading room structure
            if (Game.rooms[r].memory.roomArraySources == undefined) {
                var sourceIDs = new Array();
                searchResult = Game.rooms[r].find(FIND_SOURCES);
                for (let s in searchResult) {
                    sourceIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArraySources = sourceIDs;
            }

            if (Game.rooms[r].memory.roomArrayMinerals == undefined) {
                var sourceIDs = new Array();
                searchResult = Game.rooms[r].find(FIND_MINERALS);
                for (let s in searchResult) {
                    sourceIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayMinerals = sourceIDs;
            }

            var containerIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
            for (let s in searchResult) {
                containerIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayContainers = containerIDs;

            var spawnIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
            for (let s in searchResult) {
                spawnIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArraySpawns = spawnIDs;

            var extensionIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION});
            for (let s in searchResult) {
                extensionIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayExtensions = extensionIDs;

            var LinkIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LINK});
            for (let s in searchResult) {
                LinkIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayLinks = LinkIDs;

            var LabIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LAB});
            for (let s in searchResult) {
                LabIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayLabs = LabIDs;

            var ExtensionIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR});
            for (let s in searchResult) {
                ExtensionIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayExtractors = ExtensionIDs;

            var rampartIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
            for (let s in searchResult) {
                rampartIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayRamparts = rampartIDs;

            var towerIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
            for (let s in searchResult) {
                towerIDs.push(searchResult[s].id);
            }

            Game.rooms[r].memory.roomArrayTowers = towerIDs;

            if (Game.rooms[r].memory.roomArrayConstructionSites == undefined) {
                var constructionIDs = new Array();
                searchResult = Game.rooms[r].find(FIND_MY_CONSTRUCTION_SITES);
                for (let s in searchResult) {
                    constructionIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayConstructionSites = constructionIDs;
            }
        }

        //Flag code
        if (CPUdebug == true) {console.log("Starting flag code: " + Game.cpu.getUsed())}
        var remoteHarvestingFlags = _.filter(Game.flags,{ memory: { function: 'remoteSource'}});

        for (var f in remoteHarvestingFlags) {
            var flag = remoteHarvestingFlags[f];
            if (flag.room != undefined) {
                // We have visibility in room
                //console.log("flag");
                if (flag.room.memory.hostiles > 0 && flag.room.memory.panicFlag == undefined) {
                    //Hostiles present in room with remote harvesters
                    console.log("Panic flag is set in room " + flag.room.name);

                    var panicFlag = flag.pos.createFlag(); // create white panic flag to attract protectors
                    flag.room.memory.panicFlag = panicFlag;
                    panicFlag = _.filter(Game.flags,{ name: panicFlag})[0];
                    panicFlag.memory.function = "protector";
                    panicFlag.memory.volume = flag.room.memory.hostiles;
                    panicFlag.memory.spawn = flag.memory.spawn;
                }
                else if (flag.room.memory.hostiles == 0 && flag.room.memory.panicFlag != undefined) {
                    // No hostiles present in room with remote harvesters
                    var tempFlag = _.filter(Game.flags,{ name: flag.room.memory.panicFlag})[0];
                    tempFlag.remove();
                    delete flag.room.memory.panicFlag;
                }
            }
        }
        if (CPUdebug == true) {console.log("Starting spawn code: " + Game.cpu.getUsed())}
        // Spawn code
        var spawns = Game.rooms[r].find(FIND_MY_SPAWNS);
        if (spawns.length == 0) {
            //room has no spawner yet
            if (Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername) {
                //room is owned and should be updated
                var claimFlags = _.filter(Game.flags,{ memory: { function: 'remoteController'}});
                claimFlags = Game.rooms[r].find(FIND_FLAGS, { filter: (s) => s.pos.roomName == Game.rooms[r].name && s.memory.function == "remoteController"});

                var upgraderRecruits = _.filter(Game.creeps,{ memory: { role: 'upgrader', homeroom: Game.rooms[r].name}});
                if (upgraderRecruits.length < 1) {
                    var roomName;

                    if (claimFlags.length > 0) {
                        //Claimer present, read homeroom
                        var newUpgraders = _.filter(Game.creeps,{ memory: { role: 'upgrader', homeroom: claimFlags[0].memory.supply}});

                        if (newUpgraders.length > 0) {
                            var targetCreep = newUpgraders[0];
                            roomName=claimFlags[0].memory.supply;
                        }
                    }
                    else {
                        for (var x in Game.rooms) {
                            if(Game.rooms[x] != undefined && Game.rooms[x] != Game.rooms[r]){
                                var newUpgraders = Game.rooms[x].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "upgrader")});
                                if (newUpgraders.length > 0) {
                                    var targetCreep = newUpgraders[0];
                                    roomName=Game.rooms[x].name;
                                }
                            }
                        }
                    }

                    if (targetCreep != undefined) {
                        targetCreep.memory.homeroom = Game.rooms[r].name;
                        targetCreep.memory.spawn =  Game.rooms[r].controller.id;
                        console.log(targetCreep.name + " has been captured in room " + targetCreep.pos.roomName + " as an upgrader by room " + Game.rooms[r].name + ".");
                        targetCreep = undefined;
                    }
                }

                var BuilderRecruits = _.filter(Game.creeps,{ memory: { role: 'repairer', homeroom: Game.rooms[r].name}});
                if (BuilderRecruits.length < 1) {
                    var roomName;
                    if (claimFlags.length > 0) {
                        //Claimer present, read homeroom
                        var newBuilders = _.filter(Game.creeps,{ memory: { role: 'repairer', homeroom: claimFlags[0].memory.supply}});
                        if (newBuilders.length > 0) {
                            var targetCreepBuilder = newBuilders[0];
                            roomName=claimFlags[0].memory.supply;
                        }
                    }
                    else {
                        for (var x in Game.rooms) {
                            if(Game.rooms[x] != undefined && Game.rooms[x] != Game.rooms[r]){
                                var newBuilders = Game.rooms[x].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "repairer")});
                                if (newBuilders.length > 0) {
                                    var targetCreepBuilder = newBuilders[0];
                                    roomName=Game.rooms[x].name;
                                }
                            }
                        }
                    }
                    if (targetCreepBuilder != undefined) {
                        targetCreepBuilder.memory.homeroom = Game.rooms[r].name;
                        targetCreepBuilder.memory.spawn =  Game.rooms[r].controller.id;
                        console.log(targetCreepBuilder.name + " has been captured in room " + targetCreepBuilder.pos.roomName + " as a repairer by room " + Game.rooms[r].name + ".");
                    }
                }

            }
        }
        else {
            // loop through all spawns of the room
            for (var spawn in spawns) {
                if (spawns[spawn].memory.spawnRole != "x") {
                    moduleSpawner.run(spawns[spawn], allies);
                }
            }
        }
        if (CPUdebug == true) {console.log("Starting tower code: " + Game.cpu.getUsed())}
        // Tower code      
        var towers = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        var hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS);

        for (tower in towers) {
            // Tower attack code
            var maxHealBodyParts = 0;
            var HealBodyParts = 0;
            var healingInvader = undefined;

            for (var h in hostiles) {
                HealBodyParts = 0;
                for (var part in hostiles[h].body) {
                    if (hostiles[h].body[part].type == "heal") {
                        //Healing body part found
                        HealBodyParts++;
                    }
                }

                if (HealBodyParts > maxHealBodyParts) {
                    maxHealBodyParts = HealBodyParts;
                    healingInvader = hostiles[h].id;
                }
            }

            if (hostiles.length > 0) {
                if (healingInvader != undefined) {
                    hostiles[0] = Game.getObjectById(healingInvader);
                }
                var username = hostiles[0].owner.username;
                if (allies.indexOf(username) == -1) {
                    console.log("Hostile creep " + username + " spotted in room " + Game.rooms[r].name + "!");
                    towers.forEach(tower => tower.attack(hostiles[0]));
                }
            }

            // Tower healing code
            var wounded = Game.rooms[r].find(FIND_MY_CREEPS, {filter: (s) => s.hits < s.hitsMax});

            if (wounded.length > 0) {
                towers[tower].heal(wounded[0]);
            }

            // Tower repairing code
            if (towers[tower].energy / towers[tower].energyCapacity > 0.8) {
                var damage = Game.rooms[r].find(FIND_MY_STRUCTURES, { filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});

                if (damage.length > 0) {
                    towers[tower].repair(damage[0]);
                }
            }
        }
        if (CPUdebug == true) {console.log("Start dropped energy search: " + Game.cpu.getUsed())}
        // Search for dropped energy
        var energies=Game.rooms[r].find(FIND_DROPPED_ENERGY);
        for (var energy in energies) {
            var energyID = energies[energy].id;
            var energyAmount = energies[energy].amount;

            if (energyAmount > 5 && Game.rooms[r].memory.hostiles == 0) {
                var collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                        filter: (s) => (s.carryCapacity - _.sum(s.carry) - energyAmount) >= 0 && s.memory.role != "protector" && s.memory.role != "distributor"});

                if (collector == null) {
                    collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                            filter: (s) => (s.carryCapacity - _.sum(s.carry)) > 0 && s.memory.role != "protector" && s.memory.role != "distributor"});
                }

                if (collector != null) {
                    // Creep found to pick up dropped energy
                    collector.memory.jobQueueObject = energyID;
                    collector.memory.jobQueueTask = "pickUpEnergy";

                    roleJobber.run(collector, "droppedEnergy")
                }
                //console.log(collector.name + " is picking up dropped energy (" + energyAmount + ") in room " + energies[energy].room);
            }
        }
        if (CPUdebug == true) {console.log("Starting link code: " + Game.cpu.getUsed())}
        // Link code
        var RoomLinks = Game.rooms[r].find(FIND_MY_STRUCTURES,{filter: (s) => (s.structureType == STRUCTURE_LINK)});
        var targetLevel = 0;
        var minLevel = 99;
        var minLink;
        var maxLevel = -1;
        var maxLink;

        for (var link in RoomLinks) {
            targetLevel += RoomLinks[link].energy;
        }
        targetLevel = Math.ceil(targetLevel / RoomLinks.length / 100); //Targetlevel is now 0 - 8

        if (targetLevel != null) {
            for (var link in RoomLinks) {
                if (Math.ceil(RoomLinks[link].energy / 100) <= targetLevel && Math.ceil(RoomLinks[link].energy / 100) <= minLevel) {
                    minLevel = Math.ceil(RoomLinks[link].energy / 100);
                    minLink = RoomLinks[link];
                }
                else if (Math.ceil(RoomLinks[link].energy / 100) >= targetLevel && Math.ceil(RoomLinks[link].energy / 100) >= maxLevel) {
                    maxLevel = Math.ceil(RoomLinks[link].energy / 100);
                    maxLink = RoomLinks[link];
                }
            }
            if (maxLink != undefined && maxLink.cooldown == 0 && maxLevel != minLevel && RoomLinks.length > 0) {
                maxLink.transferEnergy(minLink, (maxLevel - targetLevel) * 100);
            }
        }

        // Terminal code
        if (CPUdebug == true) {console.log("Starting terminal code: " + Game.cpu.getUsed())}
        if (Game.rooms[r].memory.terminalTransfer != undefined) {
            var terminal = Game.rooms[r].terminal;
            if (terminal != undefined) {
                //Terminal exists
                var targetRoom;
                var amount;
                var resource;
                var comment;
                var energyCost;
                var info = Game.rooms[r].memory.terminalTransfer;
                info = info.split(":");
                targetRoom = info[0];
                amount = info[1];
                resource = info[2];
                comment = info[3];

                energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, targetRoom);
                Game.rooms[r].memory.terminalEnergyCost = energyCost;

                if (terminal.store[resource] >= amount && terminal.store[RESOURCE_ENERGY] >= energyCost) {
                    // Amount to be transferred reached and enough energy available -> GO!
                    if (terminal.send(resource,amount,targetRoom,comment) == OK) {
                        delete Game.rooms[r].memory.terminalTransfer;
                        delete Game.rooms[r].memory.terminalEnergyCost;
                        console.log(amount + " " + resource + " has been transferred to room " + targetRoom + ": " + comment);
                        Game.notify(amount + " " + resource + " has been transferred to room " + targetRoom + ": " + comment);
                    }
                    else {
                        console.log("Terminal transfer error: " + terminal.send(resource,amount,targetRoom,comment));
                    }
                }
            }
        }
    }
    if (CPUdebug == true) {console.log("Starting creeps: " + Game.cpu.getUsed())}
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
            if (CPUdebug == true) {console.log("Start creep " + creep.name +"( "+ creep.memory.role + "): " + Game.cpu.getUsed())}
            if (creep.memory.role != "miner" && creep.memory.role != "distributer" && creep.memory.role != "scientist" &&_.sum(creep.carry) != creep.carry.energy) {
                // Minerals found in creep
                for (var resourceType in creep.carry) {
                    switch (resourceType) {
                        case RESOURCE_ENERGY:
                            break;
                        default:
                            if (creep.room.name != creep.memory.homeroom) {
                                creep.moveTo(Game.getObjectById(creep.memory.spawn), {reusePath: 5});
                            }
                            else {
                                // find closest container with space to get rid of minerals
                                var freeContainer = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                                //console.log(freeContainer);
                                if (creep.room.name != creep.memory.homeroom) {
                                    creep.moveTo(creep.memory.spawn);
                                }
                                else if (creep.transfer(freeContainer, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(freeContainer, {reusePath: delayPathfinding});
                                }
                            }
                            break;
                    }
                }
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
                else if (creep.memory.role == 'distributor') {
                    roleDistributor.run(creep);
                }
                else if (creep.memory.role == 'demolisher') {
                    roleDemolisher.run(creep);
                }
                else if (creep.memory.role == 'energyTransporter') {
                    roleEnergyTransporter.run(creep);
                }
            }
        }
        if (CPUdebug == true) {console.log("Creep " + creep.name +"( "+ creep.memory.role + ") finished: " + Game.cpu.getUsed())}
    }
    if (CPUdebug == true) {console.log("Finish: " + Game.cpu.getUsed())}
  });
}
