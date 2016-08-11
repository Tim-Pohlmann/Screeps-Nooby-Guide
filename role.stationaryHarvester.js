

module.exports = {
    // state working = Returning energy to structure

    run: function(creep) {
        //Look for vacant source marked as narrowSource
        //TODO Keep your source, if you are already there cf. claimer code

         if (creep.memory.remoteHarvestingFlag != undefined) {
             //Check whether claiming this flag is this OK
             busyCreeps = _.filter(Game.creeps,{ memory: { remoteHarvestingFlag: creep.memory.remoteHarvestingFlag, spawn: creep.memory.spawn}});
         }

         var HarvestingFlags;
         var myHarvestingFlag;

            /*
         if (creep.memory.remoteHarvestingFlag == undefined || (creep.memory.remoteHarvestingFlag != undefined && busyCreeps.length != 1)) {
             //Flag taken, chose other flag
             for (var rem in remoteHarvestingFlag) {
                //Look for unoccupied remoteHarvestingFlag
                var flagName = remoteHarvestingFlag[rem].name;
                creep.memory.remoteHarvestingFlag = remoteHarvestingFlag[rem].name;
                busyCreeps = _.filter(Game.creeps,{ memory: { remoteHarvestingFlag: flagName, spawn: creep.memory.spawn}});

                if (busyCreeps.length == 1 {
                    //No other claimer working on this flag
                    myHarvestingFlag = HarvestingFlags[rem];
                    creep.memory.remoteHarvestingFlag = myHarvestingFlag;
                    break;
                }
             }
         }
         else {
             //Load previous flag
             HarvestingFlags = _.filter(Game.flags,{name: creep.memory.remoteHarvestingFlag});
             myHarvestingFlag = HarvestingFlags[0];
         }
         */
        
        var busyCreeps;
        if (creep.memory.staticX != undefined && creep.memory.staticY != undefined) {
            busyCreeps = creep.room.find(FIND_MY_CREEPS, {filter: (s) => s.memory.spawn == creep.memory.spawn && s.memory.staticX == creep.memory.staticX && s.memory.staticY == creep.memory.staticY});
        }
        if (busyCreeps == undefined || busyCreeps.length > 1) {

            var narrowSources = creep.room.find(FIND_FLAGS, {filter: (s) => (s.memory.spawn == creep.memory.spawn && s.memory.function == "narrowSource")});
            for (var n in narrowSources) {
                creep.memory.staticX = narrowSources[n].pos.x;
                creep.memory.staticY = narrowSources[n].pos.y;
                busyCreeps = creep.room.find(FIND_MY_CREEPS, {filter: (s) => s.memory.spawn == creep.memory.spawn
                                                                && s.memory.staticX == creep.memory.staticX && s.memory.staticY == creep.memory.staticY});
                if (busyCreeps.length == 1) {
                    //no other stationary harvesters working on this source
                    break;
                }
                else {
                    creep.memory.staticX = undefined;
                    creep.memory.staticY = undefined;
                }
            }
        }

        if (creep.memory.staticX == undefined || creep.memory.staticY == undefined) {
            //console.log(creep.name + " has no source to stationary harvest in room " + creep.room.name + ".");
        }
        else if (creep.pos.isEqualTo(creep.memory.staticX, creep.memory.staticY)) {
            // Harvesting position reached

            if (creep.carry.energy < creep.carryCapacity) {
                //Time to refill
                //Identify and save source
                if (creep.memory.narrowSource == undefined) {
                    var source = creep.pos.findClosestByRange(FIND_SOURCES);
                    creep.memory.narrowSource = source.id;
                }
                else {
                    var source = Game.getObjectById(creep.memory.narrowSource);
                }
                if (creep.harvest(source) != 0){
                    delete creep.memory.narrowSource;
                }
            }
            if (creep.carry.energy == creep.carryCapacity) {
                //Identify and save container
                if (creep.memory.narrowContainer == undefined) {
                    var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK)});
                    var container;

                    for (var i in containers) {
                        if (creep.transfer(containers[i],RESOURCE_ENERGY) == OK) {
                            //container found
                            container = containers[i];
                            creep.memory.narrowContainer = container.id;
                        }
                    }
                }
                else {
                    container = Game.getObjectById(creep.memory.narrowContainer);
                }
                if (creep.transfer(container, RESOURCE_ENERGY) != OK) {
                    delete creep.memory.narrowContainer;
                }
            }
        }
        else {
            // Move to harvesting point
            if (!creep.memory.path) {
                creep.memory.path = creep.pos.findPathTo(creep.memory.staticX, creep.memory.staticY);
            }
            if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                creep.memory.path = creep.pos.findPathTo(creep.memory.staticX, creep.memory.staticY);
                creep.moveByPath(creep.memory.path);
            }
        }
    }
};