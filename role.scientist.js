const RESOURCE_SPACE = "space";

module.exports = {
    // prepares ingredients and performs the reaction

    run: function(creep) {
        // Lab order format: [VOLUME]:[INGREDIENT1]:[INGREDIENT2]
        if (creep.memory.labInput1 == undefined || creep.memory.labInput2 == undefined || creep.memory.lanOutput == undefined) {
            // Find and save labs
            for (var l in creep.room.memory.roomArrayLabs) {
                var lab = Game.getObjectById(creep.room.memory.roomArrayLabs[l]);
                var neighboringLabs = lab.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: (s) => (s.structureType == STRUCTURE_LAB)});
                if (neighboringLabs > 1) {
                    creep.memory.labOutput = lab.id;
                    creep.memory.labInput1 = neighboringLabs[0].id;
                    creep.memory.labInput2 = neighboringLabs[1].id;
                }
            }
        }

        if (creep.room.memory.labOrder != undefined){
            var order = creep.room.memory.labOrder.split(":");
            var inputLab1 = Game.getObjectById(creep.memory.labInput1);
            var inputLab2 = Game.getObjectById(creep.memory.labInput2);
            var outputLab = Game.getObjectById(creep.memory.labOutput);

            if (_.sum(creep.carry) < creep.carryCapacity) {
                // Scientist still has space left

                if (inputLab1.mineralType != order[1]) {
                    // Lab 1 has to be emptied
                    if (creep.withdraw(inputLab1,inputLab1.mineralType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(inputLab1, {reusePath: 3});
                    }
                }
                else if (inputLab2.mineralType != order[2]) {
                    // Lab 2 has to be emptied
                    if (creep.withdraw(inputLab2,inputLab1.mineralType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(inputLab2, {reusePath: 3});
                    }
                }
                else if (outputLab.mineralType != order[2]) {
                    // Lab 0 has to be emptied
                    if (creep.withdraw(outputLab,inputLab1.mineralType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(outputLab, {reusePath: 3});
                    }
                }

                //Labs ready for filling

            }
            else {
                // Scientist full
                for (var resourceType in creep.carry) {
                    if (resourceType == order[1]) {
                        //Found ingredient 1
                    }
                    else if (resourceType == order[2]) {
                        //Found ingredient 2
                    }
                    else {
                        //Get rid of it
                        var freeContainer = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                        if (creep.room.name != creep.memory.homeroom) {
                            creep.moveTo(creep.memory.spawn);
                        }
                        else if (creep.transfer(freeContainer, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(freeContainer, {reusePath: delayPathfinding});
                        }
                    }
                }
            }
        }
        else {
            roleEnergyTransporter.run(creep);
        }
    }
};