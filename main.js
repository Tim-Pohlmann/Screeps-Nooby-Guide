// import modules
require('prototype.spawn')();
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleLongDistanceHarvester = require('role.longDistanceHarvester');
var roleClaimer = require('role.claimer');

global.HOME = 'W54S79';

module.exports.loop = function () {
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }

    // for every creep name in Game.creeps
    for (let name in Game.creeps) {
        // get the creep object
        var creep = Game.creeps[name];

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
        // if creep is longDistanceHarvester, call longDistanceHarvester script
        else if (creep.memory.role == 'longDistanceHarvester') {
            roleLongDistanceHarvester.run(creep);
        }
        // if creep is claimer, call claimer script
        else if (creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        }
    }

    // find all towers
    var towers = Game.rooms[HOME].find(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_TOWER
    });
    // for each tower
    for (let tower of towers) {
        // find closes hostile creep
        var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // if one is found...
        if (target != undefined) {
            // ...FIRE!
            tower.attack(target);
        }
    }

    // iterate over all the spawns
    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        let creepsInRoom = spawn.room.find(FIND_CREEPS);

        // count the number of creeps alive for each role in this room
        // _.sum will count the number of properties in Game.creeps filtered by the
        //  arrow function, which checks for the creep being a specific role
        var numberOfHarvesters = _.sum(creepsInRoom, (c) => c.memory.role == 'harvester');
        var numberOfUpgraders = _.sum(creepsInRoom, (c) => c.memory.role == 'upgrader');
        var numberOfBuilders = _.sum(creepsInRoom, (c) => c.memory.role == 'builder');
        var numberOfRepairers = _.sum(creepsInRoom, (c) => c.memory.role == 'repairer');
        var numberOfWallRepairers = _.sum(creepsInRoom, (c) => c.memory.role == 'wallRepairer');
        // count the number of long distance harvesters globally
        var numberOfLongDistanceHarvestersW54S78 = _.sum(Game.creeps, (c) =>
            c.memory.role == 'longDistanceHarvester' && c.memory.target == 'W54S78');
        var numberOfLongDistanceHarvestersW2N4 = _.sum(Game.creeps, (c) =>
            c.memory.role == 'longDistanceHarvester' && c.memory.target == 'W2N4');

        var energy = spawn.room.energyCapacityAvailable;
        var name = undefined;

        // if not enough harvesters
        if (numberOfHarvesters < spawn.memory.minHarvesters) {
            // try to spawn one
            name = spawn.createCustomCreep(energy, 'harvester');

            // if spawning failed and we have no harvesters left
            if (name == ERR_NOT_ENOUGH_ENERGY && numberOfHarvesters == 0) {
                // spawn one with what is available
                name = spawn.createCustomCreep(
                    spawn.room.energyAvailable, 'harvester');
            }
        }
        // if there is a claim order defined
        else if (spawn.memory.claimRoom != undefined) {
            // try to spawn a claimer
            name = spawn.createClaimer(spawn.memory.claimRoom);
            // if that worked
            if (!(name < 0)) {
                // delete the claim order
                delete spawn.memory.claimRoom;
            }
        }
        // if not enough upgraders
        else if (numberOfUpgraders < spawn.memory.minUpgraders) {
            // try to spawn one
            name = spawn.createCustomCreep(energy, 'upgrader');
        }
        // if not enough repairers
        else if (numberOfRepairers < spawn.memory.minRepairers) {
            // try to spawn one
            name = spawn.createCustomCreep(energy, 'repairer');
        }
            // if not enough builders
        else if (numberOfBuilders < spawn.memory.minBuilders) {
            // try to spawn one
            name = spawn.createCustomCreep(energy, 'builder');
        }
            // if not enough wallRepairers
        else if (numberOfWallRepairers < spawn.memory.minWallRepairers) {
            // try to spawn one
            name = spawn.createCustomCreep(energy, 'wallRepairer');
        }
            // if not enough longDistanceHarvesters for W54S78
        else if (numberOfLongDistanceHarvestersW54S78 < spawn.memory.minLDHW54S78) {
            // try to spawn one
            name = spawn.createLongDistanceHarvester(energy, 2, spawn.room.name, 'W54S78', 0);
        }
            // if not enough longDistanceHarvesters for W2N4
        else if (numberOfLongDistanceHarvestersW2N4 < spawn.memory.minLDH2N4) {
            // try to spawn one
            name = spawn.createLongDistanceHarvester(energy, 3, spawn.room.name, 'W2N4', 0);
        }
        else {
            // else try to spawn a builder
            name = spawn.createCustomCreep(energy, 'builder');
        }

        // print name to console if spawning was a success
        // name > 0 would not work since string > 0 returns false
        if (!(name < 0)) {
            console.log(spawnName + " spawned new creep: " + name + " (" + Game.creeps[name].memory.role + ")");
            console.log("Harvesters    : " + numberOfHarvesters);
            console.log("Upgraders     : " + numberOfUpgraders);
            console.log("Builders      : " + numberOfBuilders);
            console.log("Repairers     : " + numberOfRepairers);
            console.log("WallRepairers : " + numberOfWallRepairers);
            console.log("LDH W52S78    : " + numberOfLongDistanceHarvestersW54S78);
        }
    }
};