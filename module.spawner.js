module.exports = {
    // state working = Returning minerals to structure
    run: function (spawn) {
        //Code for spawn scaling
        var numberOfSources;
        var numberOfMineralSources;
        var roomMineralType;

        //Check sources of the room
        if (spawn.memory.numberOfSources == undefined) {
            var sources = spawn.room.find(FIND_SOURCES);
            numberOfSources = sources.length;
            spawn.memory.numberOfSources = numberOfSources;
        }
        else {
            numberOfSources = spawn.memory.numberOfSources;
        }

        //Check extractors of the room
        var minsources = spawn.room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_EXTRACTOR)});
        numberOfMineralSources = minsources.length;
        if (numberOfMineralSources > 0) {
            var mineral = spawn.room.find(FIND_MINERALS, {filter: (s) => (s.mineralAmount > 0)});
            numberOfMineralSources = mineral.length;
            if (mineral[0] != undefined) {
                roomMineralType = mineral[0].mineralType;
            }
        }

        //TODO Check for spawn hierarchy
        /*
        if (spawn.memory.spawnRole != 1) {
            console.log("slave spawner");
            var realspawn = spawn;
            spawn = spawn.room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN) && s.memory.spawnRole == 1})[0];
        }
        */

        var minimumSpawnOf = new Array();
        //Volume defined by flags
        minimumSpawnOf["remoteHarvester"] = 0;
        minimumSpawnOf["claimer"] = 0;
        minimumSpawnOf["protector"] = 0;
        minimumSpawnOf["stationaryHarvester"] = 0;

        // Check for protector flags
        var protectorFlags = _.filter(Game.flags,{ memory: { function: 'protector', spawn: spawn.id}});
        for (var p in protectorFlags) {
            //Iterate through remote source flags of this spawn
            minimumSpawnOf.protector += protectorFlags[p].memory.volume;
        }

        // Check for remote source flags
        var remoteSources = _.filter(Game.flags,{ memory: { function: 'remoteSource', spawn: spawn.id}});
        for (var t in remoteSources) {
            //Iterate through remote source flags of this spawn
            minimumSpawnOf.remoteHarvester += remoteSources[t].memory.volume;
        }

        // Check for narrow source flags
        var narrowSources = _.filter(Game.flags,{ memory: { function: 'narrowSource', spawn: spawn.id}});
        for (var t in narrowSources) {
            //Iterate through remote source flags of this spawn
            minimumSpawnOf.stationaryHarvester ++;
        }

        // Check for active flag "remoteController"
        var remoteController = _.filter(Game.flags,{ memory: { function: 'remoteController', spawn: spawn.id}});
        for (var t in remoteController) {
            if (remoteController[t].room != undefined && remoteController[t].room.controller.owner != undefined && remoteController[t].room.controller.owner.username == spawn.room.controller.owner.username) {
                //Target room already claimed
            }
            else {
                minimumSpawnOf.claimer ++;
            }
        }


        //Spawning volumes scaling with # of sources in room
        var constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
        constructionSites = constructionSites.length;

        minimumSpawnOf["builder"] = Math.ceil(numberOfSources * 0.2 * constructionSites);
        if (minimumSpawnOf.builder > numberOfSources){
            minimumSpawnOf.builder = numberOfSources;
        }

        minimumSpawnOf["upgraders"] = numberOfSources;
        minimumSpawnOf["harvester"] = Math.ceil(numberOfSources * 1.5);
        minimumSpawnOf["repairer"] = Math.ceil(numberOfSources * 0.5);
        minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
        minimumSpawnOf["miner"] = numberOfMineralSources;

        if (spawn.room.storage != undefined && spawn.room.storage.store[roomMineralType] > spawn.memory.roomMineralLimit) {
            minimumSpawnOf.miner = 0;
        }
        var maxNumberOfCreeps = 2; // 2 creeps over minimum allowed
        for (var job in minimumSpawnOf) {
            maxNumberOfCreeps += minimumSpawnOf[job];
        }

        var numberOf = new Array();
        // Creeps not leaving room
        numberOf["harvester"] = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "harvester")}).length;
        numberOf["stationaryHarvester"] = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "stationaryHarvester")}).length;
        numberOf["builder"] = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "builder")}).length;
        numberOf["repairer"] = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "repairer")}).length;
        numberOf["wallRepairer"] = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "wallRepairer")}).length;
        numberOf["miner"] = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "miner")}).length;
        numberOf["upgrader"] = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "upgrader")}).length;

        //Creeps leaving room
        numberOf["remoteHarvester"] = _.filter(Game.creeps,{ memory: { role: 'remoteHarvester', spawn: spawn.id}}).length;
        numberOf["claimer"] = _.filter(Game.creeps,{ memory: { role: 'claimer', spawn: spawn.id}}).length;

        numberOf["protector"] = 0;
        var enemyCreeps = spawn.room.find(FIND_HOSTILE_CREEPS);
        if (enemyCreeps.length > 0) {
            numberOf.protector = enemyCreeps.length;
        }
        else {
            //TODO Use "volume" on flag to direct number of protectors
            numberOf.protector = _.filter(Game.creeps,{ memory: { role: 'protector', spawn: spawn.id}}).length;
        }

        var totalCreeps = 0;
        for (var job in numberOf) {
            totalCreeps += numberOf[job];
        }
        var energy = spawn.room.energyCapacityAvailable;
        var name = undefined;

        if (maxNumberOfCreeps > totalCreeps) {
            // if not enough harvesters
            if (numberOf.harvester < minimumSpawnOf.harvester) {
                // try to spawn one

                var rolename = 'harvester';
                // if spawning failed and we have no harvesters left
                if (numberOf.harvester == 0 || spawn.room.energyCapacityAvailable < 350) {
                    // spawn one with what is available
                    var rolename = 'miniharvester';
                }
            }
            else if (numberOf.claimer < minimumSpawnOf.claimer) {
                var rolename = 'claimer';
            }
            else if (numberOf.protector < minimumSpawnOf.protector) {
                var rolename = 'protector';
            }
            else if (numberOf.stationaryHarvester < minimumSpawnOf.stationaryHarvester) {
                var rolename = 'stationaryHarvester';
            }
            else if (numberOf.upgrader < minimumSpawnOf.upgraders) {
                var rolename = 'upgrader';
            }
            else if (numberOf.repairer < minimumSpawnOf.repairer) {
                var rolename = 'repairer';
            }
            else if (numberOf.builder < minimumSpawnOf.builder) {
                var rolename = 'builder';
            }
            else if (numberOf.remoteHarvester < minimumSpawnOf.remoteHarvester) {
                var rolename = 'remoteHarvester';
            }
            else if (numberOf.wallRepairer < minimumSpawnOf.wallRepairer) {
                var rolename = 'wallRepairer';
            }
            else if (numberOf.miner < minimumSpawnOf.miner) {
                var rolename = 'miner';
            }
            else {
                var rolename = 'upgrader';
            }
            if (rolename != "---") {
                name = spawn.createCustomCreep(energy, rolename);
                // name > 0 would not work since string > 0 returns false
                if (!(name < 0)) {
                    console.log("Spawned new creep: " + name + " (" + rolename + ") in room " + spawn.room.name + ".");
                }
                else {
                    //console.log("Spawn error (room " + spawn.room.name + "): " + name);
                }
            }
        }
    }
}