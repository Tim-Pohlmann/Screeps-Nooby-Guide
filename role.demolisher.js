const RESOURCE_SPACE = "space";

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
                var structure = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_LINK, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_SPAWN);
                // if we found one
                if (structure != null) {
                    // try to transfer energy, if it is not in range
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure, {reusePath: 10});
                    }
                }
            }
        }
        // if creep is supposed to demolish
        else {
            //TODO Several demolishers per spawn
            //Find something to demolish
            var demolishFlag = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: creep.memory.spawn}})[0];

            //var demolishFlag = creep.findMyFlag("demolish");
            //demolishFlag = _.filter(Game.flags,{ name: demolishFlag});
            if (demolishFlag != null) {
                // Find exit to target room
                if (demolishFlag.room == undefined || creep.room.name != demolishFlag.room.name) {
                    //still in old room, go out
                    creep.moveTo(demolishFlag, {reusePath: 3});
                    creep.memory.oldRoom = true;
                }
                else {
                    if (creep.room.memory.hostiles == 0) {
                        if (creep.memory.statusDemolishing == undefined) {
                            //new room reached, start demolishing
                            if (creep.memory.oldRoom == true) {
                                delete creep.memory.targetBuffer;
                                delete creep.memory.oldRoom;
                                delete creep.memory._move;
                                delete creep.memory.path;
                            }
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
                                //demolish all structures in room
                                // find structures with energy
                                //var target = creep.pos.findClosestByPath(FIND_STRUCTURES,{ filter: (s) =>((s.energy != undefined && s.energy > 0) || (s.store != undefined && s.store[RESOURCE_ENERGY] > 0)) && (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_TERMINAL || s.structureType == STRUCTURE_LINK || s.structureType == STRUCTURE_LAB)});
                                var target = creep.findResource(RESOURCE_ENERGY, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TERMINAL, STRUCTURE_STORAGE, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_LAB);
                                if (target == null) {
                                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_ROAD});
                                }

                                if (target != null) {
                                    if ((target.store != undefined && target.store[RESOURCE_ENERGY] > 0) || target.energy != undefined && target.energy > 20) {
                                        //empty structure of energy first
                                        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {reusePath: 5});
                                        }
                                        else if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {reusePath: 5});
                                        }
                                    }
                                    else {
                                        var result = creep.dismantle(target);
                                        if (result == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {reusePath: 5});
                                        }
                                        else if (result == OK) {
                                            creep.memory.statusDemolishing = target.id;
                                        }
                                    }
                                }
                            }
                        } else {
                            if (creep.dismantle(Game.getObjectById(creep.memory.statusDemolishing)) != OK) {
                                delete creep.memory.statusDemolishing;
                                delete creep.memory.path;
                                delete creep.memory._move;
                                delete creep.memory.targetBuffer;
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