module.exports = {
    // state working = Returning minerals to structure
    run: function (spawn, allies) {
        if (spawn.room.controller.owner == undefined || (spawn.room.controller.owner != undefined && spawn.owner.username != spawn.room.controller.owner.username)) {
            //Spawner standing in room not controlled by player
            return -1;
        }
        var realspawn;

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

        if (spawn.memory.spawnRole != 1 && spawn.room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN}).length > 1) {
            console.log("slave spawner");
            realspawn = spawn;
            spawn = spawn.room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN) && s.memory.spawnRole == 1})[0];
        }

        var minimumSpawnOf = new Array();
        //Volume defined by flags
        minimumSpawnOf["remoteHarvester"] = 0;
        minimumSpawnOf["claimer"] = 0;
        minimumSpawnOf["protector"] = 0;
        minimumSpawnOf["stationaryHarvester"] = 0;
        minimumSpawnOf["demolisher"] = 0;

        // Check for demolisher flags
        var demolisherFlags = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: spawn.id}});
        for (var p in demolisherFlags) {
            //Iterate through demolisher flags of this spawn
            minimumSpawnOf.demolisher += demolisherFlags[p].memory.volume;
        }

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
            if (remoteController[t].room != undefined && remoteController[t].room != undefined && remoteController[t].room.controller.owner != undefined && remoteController[t].room.controller.owner.username == spawn.room.controller.owner.username) {
                //Target room already claimed
            }
            else {
                if (remoteController[t].room == undefined || remoteController[t].room.controller.reservation == undefined || remoteController[t].room.controller.reservation == undefined || remoteController[t].room.controller.reservation.ticksToEnd < 3000) {
                    minimumSpawnOf.claimer ++;
                }
            }
        }

        //Spawning volumes scaling with # of sources in room
        var constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
        if (constructionSites.length == 0) {
            minimumSpawnOf.builder = 0;
        }
        else {
            //There are construction sites
            var progress = 0;
            var totalProgress = 0;

            for (var w in constructionSites) {
                progress += constructionSites[w].progress;
                totalProgress += constructionSites[w].progressTotal;
            }
            if (totalProgress - progress < 301) {
                minimumSpawnOf.builder = 0;
            }
            else {
                minimumSpawnOf.builder = Math.ceil((totalProgress - progress) / 5000);
            }
        }

        if (minimumSpawnOf.builder > numberOfSources * 2){
            minimumSpawnOf.builder = numberOfSources * 2;
        }

        minimumSpawnOf["upgrader"] = Math.ceil(numberOfSources * 1);
        minimumSpawnOf["harvester"] = Math.ceil(numberOfSources * 1.5);
        minimumSpawnOf["repairer"] = Math.ceil(numberOfSources * 0.5);
        minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
        minimumSpawnOf["miner"] = numberOfMineralSources;
        if (spawn.room.memory.terminalTransfer != undefined) {
            minimumSpawnOf["distributor"] = 1;
        }
        else {
            minimumSpawnOf["distributor"] = 0;
        }

        if (spawn.room.storage != undefined && spawn.room.storage.store[roomMineralType] > spawn.memory.roomMineralLimit) {
            minimumSpawnOf.miner = 0;
        }
        var enemyCreeps = spawn.room.find(FIND_HOSTILE_CREEPS);
        for (var g in enemyCreeps) {
            var username = enemyCreeps[g].owner.username;
            if (allies.indexOf(username) == -1) {
                minimumSpawnOf.protector++;
                minimumSpawnOf.upgrader = 0;
                minimumSpawnOf.builder = 0;
                minimumSpawnOf.remoteHarvester = 0;
                minimumSpawnOf.miner = 0;
                minimumSpawnOf.distributor = 0;
            }
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
        numberOf["distributor"] = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "distributor")}).length;

        //Creeps leaving room
        numberOf["remoteHarvester"] = _.filter(Game.creeps,{ memory: { role: 'remoteHarvester', spawn: spawn.id}}).length;
        numberOf["claimer"] = _.filter(Game.creeps,{ memory: { role: 'claimer', spawn: spawn.id}}).length;
        numberOf["protector"] = _.filter(Game.creeps,{ memory: { role: 'protector', spawn: spawn.id}}).length;
        numberOf["demolisher"] = _.filter(Game.creeps,{ memory: { role: 'demolisher', spawn: spawn.id}}).length;

        var energy = spawn.room.energyCapacityAvailable;
        var name = undefined;

        var hostiles = spawn.room.memory.hostiles;
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
        else if (numberOf.distributor < minimumSpawnOf.distributor) {
            var rolename = 'distributor';
        }
        else if (numberOf.upgrader < minimumSpawnOf.upgrader) {
            var rolename = 'upgrader';
        }
        else if (numberOf.repairer < minimumSpawnOf.repairer) {
            var rolename = 'repairer';
        }
        else if (numberOf.builder < minimumSpawnOf.builder) {
            var rolename = 'builder';
        }
        else if (numberOf.miner < minimumSpawnOf.miner) {
            var rolename = 'miner';
        }
        else if (numberOf.remoteHarvester < minimumSpawnOf.remoteHarvester) {
            var rolename = 'remoteHarvester';
        }
        else if (numberOf.demolisher < minimumSpawnOf.demolisher) {
            var rolename = 'demolisher';
        }
        else if (numberOf.wallRepairer < minimumSpawnOf.wallRepairer) {
            var rolename = 'wallRepairer';
        }
        else {
            var container = spawn.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE});
            var containerEnergie = 0;

            for (var e in container) {
                containerEnergie += container[e].store[RESOURCE_ENERGY];
            }
            if (hostiles == 0 && containerEnergie > spawn.room.energyAvailable * 1.75) {
                if (numberOf.upgrader < Math.ceil(minimumSpawnOf.upgrader * 2.5)) {
                    var rolename = 'upgrader';
                }
                else if (numberOf.wallRepairer < minimumSpawnOf.wallRepairer * 2) {
                    var rolename = 'wallRepairer';
                }
                else if (numberOf.miner < minimumSpawnOf.miner * 2) {
                    var rolename = 'miner';
                }
                else if (numberOf.harvester < Math.ceil(minimumSpawnOf.harvester * 1.5)) {
                    var rolename = 'harvester';
                }
                else {
                    var rolename = "---";
                }
            }
            else {
                var rolename = "---";
            }
        }
        spawn.memory.lastSpawnAttempt = rolename;
        if (rolename != "---") {
            if (realspawn == undefined) {
                //Normal spawn
                name = spawn.createCustomCreep(energy, rolename, spawn.id);
            }
            else {
                //Slave spawner using master spawn ID to identify creeps
                name = realspawn.createCustomCreep(energy, rolename, spawn.id);
            }
            if (!(name < 0)) {
                console.log("Spawned new creep: " + name + " (" + rolename + ") in room " + spawn.room.name + ".");
            }
            else if (name != -4 && name != -6) {
                //console.log("Spawn error (" + rolename + " in room " + spawn.room.name + "): " + name);
            }
        }
    }
}