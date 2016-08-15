var roleCollector = require('role.collector');
var roleHarvester = require('role.harvester');
var roleMiner = require('role.miner');

module.exports = {
    // state working = Transporting stuff somewhere
    run: function(creep) {
        // Load terminal transfer info
        var terminal = creep.room.terminal;
        var transferAmount = 0;
        var targetRoom;
        var transferResource;
        var transferComment;
        var energyCost = 0;
        var info = creep.room.memory.terminalTransfer; // Format: ROOM:AMOUNT:RESOURCE:COMMENT W21S38:100:Z:TestTransfer
        if (info != undefined) {
            info = info.split(":");
            targetRoom = info[0];
            transferAmount = info[1];
            transferResource = info[2];
            transferComment = info[3];
            energyCost = Game.market.calcTransactionCost(transferAmount, terminal.room.name, targetRoom);
        }

        var mineralTerminal = terminal.store[transferResource];
        var mineralCreep = creep.carry[transferResource];

        if (mineralTerminal == undefined) {mineralTerminal = 0};
        if (mineralCreep == undefined) {mineralCreep = 0};


        if (creep.memory.subRole == undefined) {
            // Determine next subrole

            if (_.sum(creep.carry) == creep.carryCapacity) {
                // Creep full, has to be emptied
                creep.memory.subRole = "empty_creep";
            }
            else if (_.sum(terminal.store) > transferAmount + energyCost) {
                // Terminal full, has to be emptied
                creep.memory.subRole = "empty_terminal";
            }
            else if (info != undefined && mineralTerminal + mineralCreep < transferAmount) {
                // Terminals lacks minerals to execute transfer
                creep.memory.subRole = "get_minerals";
            }
            else if (info != undefined && terminal.store[RESOURCE_ENERGY] + creep.carry.energy < energyCost) {
                // Terminals lacks energy to execute transfer
                creep.memory.subRole = "get_energy";
            }
            else if (_.sum(creep.carry) > 0) {
                // Creep should be emptied before transporting material out of the terminal
                creep.memory.subRole = "empty_creep";
            }
            else if (info == undefined && _.sum(terminal.store) > 0) {
                // Material left in terminal and no transfer active
                creep.memory.subRole = "empty_terminal";
            }
            else {
                creep.memory.subRole = "play_miner";
            }

        }

        switch (creep.memory.subRole) {
            case "empty_terminal":
                if (creep.carry < creep.carryCapacity && (transferResource == undefined || (terminal.store[RESOURCE_ENERGY] > energyCost && mineralTerminal > transferAmount))) {
                    // Withdraw from terminal everything that is not needed for a planned transfer
                    for (var res in creep.carry) {
                        if ((res != RESOURCE_ENERGY || energyCost == 0) && (transferResource == undefined || res != transferResource)) {
                            //No energy nor transferResource if a transfer is planned
                            if (creep.carry[res] > 0 && creep.withdraw(terminal, res) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(terminal, {reusePath: 3});
                            }
                        }
                    }
                }
                else {
                    // Terminal has no more to give
                    delete creep.memory.subRole;
                    delete creep.memory.path;
                }
                break;

            case "empty_creep":
                if (_.sum(creep.carry) > 0) {

                    //Creep has something to deliver
                    if (transferResource == undefined || (terminal.store[RESOURCE_ENERGY] >= energyCost && (mineralTerminal >= transferAmount))) {
                        // Terminal does not need anything
                        var targetContainer;
                        if (creep.room.storage == undefined) {
                            targetContainer = creep.findClosestContainer(0);
                        }
                        else {
                            targetContainer = creep.room.storage;
                        }

                        if (creep.carry.energy > 0) {
                            // Minerals to get rid of
                            var result = creep.transfer(targetContainer, RESOURCE_ENERGY);
                            if (result == ERR_NOT_IN_RANGE) {
                                creep.moveTo(targetContainer, {reusePath: 3});
                                break;
                            }
                            else if (result == OK) {
                                break;
                            }
                        }
                        else if (_.sum(creep.carry) > 0) {
                            // Minerals to get rid of
                            for (var res in creep.carry) {
                                //No energy nor transferResource if a transfer is planned
                                var result = creep.transfer(targetContainer, res);
                                if (result == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(targetContainer, {reusePath: 3});
                                    break;
                                }
                                else if (result == OK) {
                                    break;
                                }
                            }
                        }
                    }
                    else if (_.sum(terminal.store) < terminal.storeCapacity) {
                        // There is stuff to put in the terminal
                        var deltaEnergy = terminal.store[RESOURCE_ENERGY] - energyCost;
                        var deltaMineral = mineralTerminal - transferAmount;
                        if (deltaMineral == undefined) {
                            deltaMineral = 0;
                        }
                        if (deltaMineral < 0 && mineralCreep > 0) {
                            // Minerals for the terminal
                            var result;

                            if (deltaMineral + mineralCreep > 0) {
                                //more minerals than needed
                                result = creep.transfer(terminal, transferResource, Math.abs(deltaMineral));
                            }
                            else {
                                //transfer all you have
                                result = creep.transfer(terminal, transferResource);
                            }
                            if (result != OK) {
                                creep.moveTo(terminal, {reusePath: 3})
                            }
                        }
                        else if (deltaEnergy < 0 && creep.carry.energy > 0) {
                            // Minerals for the terminal
                            var result;

                            if (deltaEnergy + creep.carry.energy > 0) {
                                //more energy than needed
                                result = creep.transfer(terminal, RESOURCE_ENERGY, Math.abs(deltaEnergy));
                            }
                            else {
                                //transfer all you have
                                result = creep.transfer(terminal, RESOURCE_ENERGY);
                            }
                            if (result == ERR_NOT_IN_RANGE) {
                                creep.moveTo(terminal, {reusePath: 3})
                            }
                        }
                        else {
                            var targetContainer;
                            if (creep.room.storage == undefined) {
                                targetContainer = creep.findClosestContainer(0);
                            }
                            else {
                                targetContainer = creep.room.storage;
                            }
                            if (creep.pos.getRangeTo(targetContainer) > 1) {
                                creep.moveTo(targetContainer, {reusePath: 3});
                            }
                            else {
                                for (var res in creep.carry) {
                                    //No energy nor transferResource if a transfer is planned
                                    creep.transfer(targetContainer, res) != OK;
                                }
                            }
                        }
                    }
                    else {
                        var targetContainer2;
                        if (creep.room.storage == undefined) {
                            targetContainer2 = creep.findClosestContainer(0);
                        }
                        else {
                            targetContainer2 = creep.room.storage;
                        }
                        if (creep.pos.getRangeTo(targetContainer2) > 1) {
                            creep.moveTo(targetContainer2, {reusePath: 3});
                        }
                        else {
                            for (var res in creep.carry) {
                                //No energy nor transferResource if a transfer is planned
                                creep.transfer(targetContainer2, res) != OK;
                            }
                        }
                    }
                }
                else {
                    //Creep is empty
                    delete creep.memory.subRole;
                    delete creep.memory.path;
                }
                break;

            case "get_minerals":
                if (_.sum(creep.carry) < creep.carryCapacity && mineralTerminal + mineralCreep < transferAmount){
                    //Terminal lacking stuff and creep does not have enough
                    var mineralContainer = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER) && s.store[transferResource] > 0})
                    if (mineralContainer != null) {
                        // Mineral containers found
                        if (creep.withdraw(mineralContainer, transferResource) != OK) {
                            creep.moveTo(mineralContainer);
                        }
                    }
                    else {
                        console.log("Not enough minerals to process transfer!");
                    }
                }
                else {
                    // No more minerals needed

                    delete creep.memory.subRole;
                    delete creep.memory.path;
                }
                break;

            case "get_energy":
                if (_.sum(creep.carry) < creep.carryCapacity && terminal.store[RESOURCE_ENERGY] + creep.carry.energy < energyCost) {
                    //Terminal lacking stuff and creep does not have enough
                    var energyContainer;
                    if (creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
                        energyContainer = creep.room.storage;
                    }
                    else {
                        energyContainer = creep.findClosestContainer(RESOURCE_ENERGY).container;
                    }

                    if (energyContainer != null) {
                        // Mineral containers found
                        if (creep.withdraw(energyContainer, RESOURCE_ENERGY) != OK) {
                            creep.moveTo(energyContainer);
                        }
                    }
                    else {
                        console.log("Not enough energy to process transfer!");
                    }
                }
                else {
                    // No more minerals needed
                    delete creep.memory.subRole;
                    delete creep.memory.path;
                }
                break;

            case "play_miner":
                delete creep.memory.subRole;
                roleMiner.run(creep);
                break;
        }
    }
};