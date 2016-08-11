var roleCollector = require('role.collector');
var roleHarvester = require('role.harvester');

module.exports = {
    // state working = Transporting stuff somewhere
    run: function(creep) {
        var terminal = creep.room.terminal;
        var amount;
        var targetRoom;
        var resource;
        var comment;
        var energyCost;
        var info = creep.room.memory.terminaltransfer; // Format: ROOM:AMOUNT:RESOURCE:COMMENT
        if (info == undefined) {
            roleHarvester.run(creep);
        }
        else {
            info.split(":");
            targetRoom = info[0];
            amount = info[1];
            resource = info[2];
            comment = info[3];
            energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, targetRoom.name);

            // if creep is bringing minerals to a structure but is empty now
            if (_.sum(creep.carry) == 0) {
                // switch state to loading
                creep.memory.working = false;
            }
            // if creep is full or has all necessary resources loaded
            else if (_.sum(creep.carry) == creep.carryCapacity || (creep.store[resource] + terminal.store[resource] >= amount && creep.store[RESOURCE_ENERGY] + terminal.store[RESOURCE_ENERGY] >= energyCost)) {
                // Creep either full or all necessary materials aboard
                creep.memory.working = true;
            }

            if (creep.memory.working == true) {
                // Creep either full or all necessary materials aboard
                for (var res in creep.store) {
                    if (creep.store[res] > 0 && creep.transfer(terminal, res) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal, {reusePath: 3});
                    }
                }
            }
            else {
                //creep is supposed to pick stuff up, it's still not full
                if (terminal.length > 0) {
                    // Terminal exists
                    //TODO: Pick up incoming stuff from terminal (check with active transfer)
                    if (creep.room.memory.terminaltransfer == undefined && _.sum(terminal.store) > 0) {
                        // No transfer order pending, terminal has material and should be emptied
                        for (var res in terminal.store) {
                            if (terminal.store[res] > 0 && creep.withdraw(terminal, res) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(terminal, {reusePath: 3});
                            }
                        }
                    }

                    if (creep.room.memory.terminaltransfer != undefined) {
                        //TODO: Pick up stuff for terminal
                        if (terminal.store[RESOURCE_ENERGY] + creep.store[RESOURCE_ENERGY] < energyCost) {
                            roleCollector.run(creep);
                        }
                        else if (terminal.store[resource] + creep.store[resource] < amount) {
                            //Pick up mineral for terminal
                            var mineralContainer = creep.findClosestContainer(resource);
                            if (mineralContainer.container != undefined) {
                                // Mineral storage found
                                if (terminal.store[resource] > 0 && creep.withdraw(terminal, resource) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(terminal, {reusePath: 3});
                                }
                            }
                        }
                    }
                }

                //TODO: Pick up products from labs
                //TODO Pick up minerals for labs

                // Collected resources from containers where they have been dropped by harvesters
                var containerArray = creep.findClosestContainer(-1);
                var containerResource;
                if (containerArray.container != undefined && storage != null) {
                    //minerals waiting in containers
                    //analyzing storage of container
                    var store = containerArray.container.store;
                    for (var s in store) {
                        if (s != RESOURCE_ENERGY) {
                            // mineral found in container
                            containerResource = s;
                        }
                    }
                    if (creep.withdraw(containerArray.container, containerResource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(containerArray.container);
                    }
                }
            }
        }
    }
};