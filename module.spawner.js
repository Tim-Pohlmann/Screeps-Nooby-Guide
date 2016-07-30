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
        if (spawn.memory.numberOfMinerals == undefined || spawn.memory.roomMineralType == undefined) {
            var minsources = spawn.room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_EXTRACTOR)});
            numberOfMineralSources = minsources.length;
            spawn.memory.numberOfMinerals = numberOfMineralSources;
            if (numberOfMineralSources > 0) {
                var mineral = spawn.room.find(FIND_MINERALS, {filter: (s) => (s.mineralAmount > 0)});
                roomMineralType = mineral[0].mineralType;
                spawn.memory.roomMineralType = roomMineralType;
            }
        }
        else {
            numberOfMineralSources = spawn.memory.numberOfMinerals;
            roomMineralType = spawn.memory.roomMineralType;
        }

        //Volume defined by flags
        var minimumNumberOfRemoteHarvesters = 0;
        var minimumNumberOfClaimers = 0;
        var minimumNumberOfProtectors = 0;
        var minimumNumberofStationaryHarvesters = 0;

        // Check for protector flags
        var protectorFlags = _.filter(Game.flags,{ memory: { function: 'protector', spawn: spawn.id}});
        for (var p in protectorFlags) {
            //Iterate through remote source flags of this spawn
            minimumNumberOfProtectors += protectorFlags[p].memory.volume;
        }

        // Check for remote source flags
        var remoteSources = _.filter(Game.flags,{ memory: { function: 'remoteSource', spawn: spawn.id}});
        for (var t in remoteSources) {
            //Iterate through remote source flags of this spawn
            minimumNumberOfRemoteHarvesters += remoteSources[t].memory.volume;
        }

        // Check for narrow source flags
        var narrowSources = _.filter(Game.flags,{ memory: { function: 'narrowSource', spawn: spawn.id}});
        for (var t in narrowSources) {
            //Iterate through remote source flags of this spawn
            minimumNumberofStationaryHarvesters ++;
        }

        // Check for active flag "remoteController"
        var remoteController = _.filter(Game.flags,{ memory: { function: 'remoteController', spawn: spawn.id}});
        for (var t in remoteController) {
            if (remoteController[t].room != undefined && remoteController[t].room.controller.owner != undefined && remoteController[t].room.controller.owner.username == Game.rooms[r].controller.owner.username) {
                //Target room already claimed
                minimumNumberOfClaimers = 0;
            }
            else {
                minimumNumberOfClaimers++;
            }
        }
        //Spawning volumes scaling with # of sources in room
        var constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
        constructionSites = constructionSites.length;
        var minimumNumberOfBuilders = Math.ceil(numberOfSources * 0.2 * constructionSites);
        if (minimumNumberOfBuilders > numberOfSources) {
            minimumNumberOfBuilders = numberOfSources;
        }

        var minimumNumberOfUpgraders;
        if (spawn.room.controller.level < 4) {
            minimumNumberOfUpgraders = Math.ceil(numberOfSources * 1.0);
        }
        else {
            minimumNumberOfUpgraders = Math.ceil(numberOfSources * 0.5);
        }

        var minimumNumberOfHarvesters = Math.ceil(numberOfSources * 1.5);
        var minimumNumberOfRepairers = Math.ceil(numberOfSources * 0.5);
        var minimumNumberOfWallRepairers = Math.ceil(numberOfSources * 0.5);
        var minimumNumberOfMiners = numberOfMineralSources;

        if (spawn.room.storage != undefined && spawn.room.storage.store[roomMineralType] > 250000) {
            minimumNumberOfMiners = 0;
        }

        var maxNumberOfCreeps = numberOfSources * 10;

        // Creeps not leaving room
        var numberOfHarvesters = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "harvester")});
        var numberOfStationaryHarvesters = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "stationaryHarvester")});
        var numberOfBuilders = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "builder")});
        var numberOfRepairers = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "repairer")});
        var numberOfWallRepairers = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "wallRepairer")});
        var numberOfMiners = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "miner")});
        var numberOfUpgraders = spawn.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "upgrader")});

        //Creeps leaving room
        var numberOfRemoteHarvesters = _.filter(Game.creeps,{ memory: { role: 'remoteHarvester', spawn: spawn.id}});
        var numberOfClaimers = _.filter(Game.creeps,{ memory: { role: 'claimer', spawn: spawn.id}});
        var enemyCreeps = spawn.room.find(FIND_HOSTILE_CREEPS);
        if (enemyCreeps.length > 0) {
            var numberOfProtectors = enemyCreeps.length;
        }
        else {
            var numberOfProtectors = _.filter(Game.creeps,{ memory: { role: 'protector', spawn: spawn.id}});
            numberOfProtectors = numberOfProtectors.length;
        }

        numberOfHarvesters = numberOfHarvesters.length;
        numberOfStationaryHarvesters = numberOfStationaryHarvesters.length;
        numberOfRemoteHarvesters = numberOfRemoteHarvesters.length;
        numberOfUpgraders = numberOfUpgraders.length;
        numberOfBuilders = numberOfBuilders.length;
        numberOfRepairers = numberOfRepairers.length;
        numberOfWallRepairers = numberOfWallRepairers.length;
        numberOfClaimers = numberOfClaimers.length;
        numberOfMiners = numberOfMiners.length;
        var energy = spawn.room.energyCapacityAvailable;
        var name = undefined;
        var totalCreeps = _.sum(Game.creeps, (c) => c.memory.spawn == spawn.id);
        if (maxNumberOfCreeps > totalCreeps) {
            // if not enough harvesters
            if (numberOfHarvesters < minimumNumberOfHarvesters) {
                // try to spawn one

                var rolename = 'harvester';
                // if spawning failed and we have no harvesters left

                if (numberOfHarvesters == 0 || spawn.room.energyCapacityAvailable < 350) {
                    // spawn one with what is available
                    var rolename = 'miniharvester';
                }
            }
            else if (numberOfClaimers < minimumNumberOfClaimers) {
                var rolename = 'claimer';
            }
            else if (numberOfProtectors < minimumNumberOfProtectors) {
                var rolename = 'protector';
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
            else if (numberOfMiners < minimumNumberOfMiners) {
                var rolename = 'miner';
            }
            else {
                var rolename = '---';
            }
            if (rolename != "---") {
                name = spawn.createCustomCreep(energy, rolename);
                // print name to console if spawning was a success
                // name > 0 would not work since string > 0 returns false
                if (!(name < 0)) {
                    console.log("Spawned new creep: " + name + " (" + rolename + ") in room " + spawn.room.name + ".");
                }
                else {
                    //console.log("Spawn error (room " + spawn.room.name + "): " + name);
                }
            }
        }
        else {
            //console.log("Room " + spawn.room.name + " reached max creep level.");
        }
    }
}