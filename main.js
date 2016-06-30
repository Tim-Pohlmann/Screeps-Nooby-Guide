// import modules
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');

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
        else if (creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
    }

    // setup some minimum numbers for different roles
    var minimumNumberOfHarvesters = 10;
    var minimumNumberOfUpgraders = 1;
    var minimumNumberOfBuilders = 1;
    var minimumNumberOfRepairers = 2;

    // count the number of creeps alive for each role
    // _.sum will count the number of properties in Game.creeps filtered by the
    //  arrow function, which checks for the creep being a harvester
    var numberOfHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
    var numberOfUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
    var numberOfBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'builder');
    var numberOfRepairers = _.sum(Game.creeps, (c) => c.memory.role == 'repairer');

    var name = undefined;

    // if not enough harvesters
    if (numberOfHarvesters < minimumNumberOfHarvesters) {
        // try to spawn one
        name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,MOVE], undefined,
            { role: 'harvester', working: false});
    }
    // if not enough upgraders
    else if (numberOfUpgraders < minimumNumberOfUpgraders) {
        // try to spawn one
        name = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE,MOVE], undefined,
            { role: 'upgrader', working: false});
    }
    // if not enough repairers
    else if (numberOfRepairers < minimumNumberOfRepairers) {
        // try to spawn one
        name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,MOVE], undefined,
            { role: 'repairer', working: false});
    }
    // if not enough builders
    else if (numberOfBuilders < minimumNumberOfBuilders) {
        // try to spawn one
        name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,MOVE], undefined,
            { role: 'builder', working: false});
    }
    else {
        // else try to spawn a builder
        name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,MOVE], undefined,
            { role: 'builder', working: false});
    }

    // print name to console if spawning was a success
    // name > 0 would not work since string > 0 returns false
    if (!(name < 0)) {
        console.log("Spawned new " + creep.memory.role + " creep: " + name);
    }
};