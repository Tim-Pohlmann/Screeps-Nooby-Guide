module.exports = function() {
    // find unoccupied flag and return flag name
	Creep.prototype.findMyFlag =
	function(flagFunction) {
	    var flagList;
        var flag;
        var flagCreeps;
        var volume;

		if (flagFunction == "narrowSource") {
		    // static volumes
            volume = 1;
        }

        if (this.memory.currentFlag != undefined && this.memory.currentFlag != -1) {
            // There is a current flag
            flag = Game.flags[this.memory.currentFlag];
            if (flag == undefined) {
                volume = 0;
                delete this.memory.currentFlag;
            }
            else if (volume == undefined) {
                //dynamic volume
                volume = flag.memory.volume;
            }
            flagCreeps = _.filter(Game.creeps,{ currentFlag: this.memory.currentFlag});


            if (flagCreeps.length <= volume) {
                //only one stationaryHarvester on this flag -> OK
                return this.memory.currentFlag;
            }
            else {
                delete this.memory.currentFlag;
            }
        }

        if (this.memory.currentFlag == undefined || this.memory.currentFlag == -1) {
            //Search for new flag necessary
            flagList = _.filter(Game.flags, {memory: {function: flagFunction, spawn: this.memory.spawn}});

            for (var flag in flagList) {
                this.memory.currentFlag = flagList[flag].name;

                flagCreeps = _.filter(Game.creeps, {memory: {currentFlag: this.memory.currentFlag}});
                if (flagFunction == "narrowSource") {
                    // static volumes
                    volume = 1;
                }
                else {
                    volume = flagList[flag].memory.volume;
                }
                //console.log(this.name + " @ " + flagList[flag].name + ": " + flagCreeps.length);

                if (flagCreeps.length <= volume) {
                    //only one stationaryHarvester on this flag -> OK
                    return this.memory.currentFlag;
                }
            }
        }
    }
};