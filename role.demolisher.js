module.exports = {
    // state working = Returning energy to structure

    run: function(creep) {
        // if creep is bringing energy to a structure but has no energy left
        if (creep.carry.energy == 0) {

            // switch state to harvesting
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            delete creep.memory.path;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            // Find exit to spawn room
            var spawn = Game.getObjectById(creep.memory.spawn);
            if (creep.room.name != creep.memory.homeroom) {
                //still in new room, go out
                if(!creep.memory.path) {
                    creep.memory.path = creep.pos.findPathTo(spawn);
                }
                if(creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                    creep.memory.path = creep.pos.findPathTo(spawn);
                    creep.moveByPath(creep.memory.path);
                }
            }
            else {
                // back in spawn room
                var freeContainerArray = creep.findClosestContainer(0);
                var structure = freeContainerArray.container;

                if (structure == null) {
                    // find closest spawn, extension, tower or container which is not full
                    structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                            filter: (s) => ((s.structureType == STRUCTURE_SPAWN
                        || s.structureType == STRUCTURE_EXTENSION
                        || s.structureType == STRUCTURE_TOWER)
                        && s.energy < s.energyCapacity) || (s.structureType == STRUCTURE_STORAGE && s.storeCapacity - _.sum(s.store) > 0)});
                }

                // if we found one
                if (structure != null) {

                    if (structure.structureType == STRUCTURE_SPAWN && structure.energy == structure.energyCapacity) {
                        roleUpgrader.run(creep);
                    }
                    // try to transfer energy, if it is not in range
                    else if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure, {reusePath: 10});
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            //TODO Several remote sources per spawn
            //Find remote source
            var demolishFlags = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: creep.memory.spawn}});

            if (demolishFlags.length > 0) {

                var demolishFlag = demolishFlags[0];
                // Find exit to target room
                if (creep.room != demolishFlag.room) {
                    //still in old room, go out
                    if (!creep.memory.path) {
                        creep.memory.path = creep.pos.findPathTo(demolishFlag);
                    }
                    if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
                        creep.memory.path = creep.pos.findPathTo(demolishFlag);
                        creep.moveByPath(creep.memory.path)
                    }
                }
                else {
                    if (creep.room.memory.hostiles == 0) {
                        //new room reached, start demolishing
                        var targetlist;

                        if (demolishFlag.memory.target == "object") {
                            //demolish flag position structures
                            targetlist = demolishFlag.pos.lookFor(LOOK_STRUCTURES);
                            // Go through target list
                            for (var i in targetlist) {
                                if (targetlist[i].structureType != undefined) {
                                    if ((targetlist[i].store != undefined && targetlist[i].store[RESOURCE_ENERGY] > 0) || (targetlist[i].energy != undefined && targetlist[i].energy > 0)) {
                                        //empty structure of energy first
                                        if (creep.withdraw(targetlist[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(targetlist[i], {reusePath: 10});
                                        }
                                    }
                                    else if (creep.dismantle(targetlist[i]) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(targetlist[i], {reusePath: 10});
                                    }
                                    break;
                                }
                            }
                            if (targetlist.length == 0) {
                                Game.notify("Demolition flag in room " + demolishFlag.pos.roomName + " is placed in empty square!")
                            }
                        }
                        else if (demolishFlag.memory.target == "room") {
                            //demolish all structures
                            // find structures with energy
                            var target = creep.pos.findClosestByPath(FIND_STRUCTURES,{ filter: (s) =>((s.energy != undefined && s.energy > 0) || (s.store != undefined && s.store[RESOURCE_ENERGY] > 0)) && (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_TERMINAL || s.structureType == STRUCTURE_LINK || s.structureType == STRUCTURE_LAB)});
                            if (target == null) {
                                target = creep.pos.findClosestByPath(FIND_STRUCTURES,{ filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_TERMINAL || s.structureType == STRUCTURE_LINK || s.structureType == STRUCTURE_LAB || s.structureType == STRUCTURE_RAMPART});
                            }

                            if (target != null) {
                                if ((target.store != undefined && target.store[RESOURCE_ENERGY] > 0) || target.energy != undefined && target.energy > 20) {
                                    //empty structure of energy first
                                    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(target, {reusePath: 10});
                                    }
                                    else {
                                        creep.withdraw(target, RESOURCE_ENERGY);
                                    }
                                }
                                else if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target, {reusePath: 10});
                                }
                            }
                        }


                    }
                    else {
                        //Hostiles creeps in new room
                        var homespawn = Game.getObjectById(creep.memory.spawn);
                        if (creep.room.name != creep.memory.homeroom) {
                            creep.moveTo(homespawn), {reusePath: 10};
                        }
                        else if (creep.pos.getRangeTo(homespawn) > 5) {
                            creep.moveTo(homespawn), {reusePath: 3};
                        }
                    }
                }
            }
        }
    }
};