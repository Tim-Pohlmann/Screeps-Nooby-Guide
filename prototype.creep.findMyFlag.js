module.exports = function() {
    // create a new function for Creep
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

        if (this.memory.currentFlag != undefined) {
            // There is a current flag
            flag = Game.flags[currentFlag];
            if (flag == undefined) {
                volume = 0;
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
        }

        //Search for new flag necessary
        flagList = _.filter(Game.flags,{ memory: { function: flagFunction, spawn: this.memory.spawn}});
        for (var flag in flagList) {
            this.memory.currentFlag = flagList[flag].name;
            flagCreeps = _.filter(Game.creeps,{memory: { currentFlag: this.memory.currentFlag }});
            console.log(flagCreeps);
            if (flagFunction == "narrowSource") {
                // static volumes
                volume = 1;
            }
            else {
                volume = flagList[flag].memory.volume;
            }
            console.log(flagCreeps.length + "/" + volume);
            if (flagCreeps.length <= volume) {
                //only one stationaryHarvester on this flag -> OK
                return this.memory.currentFlag;
            }
        }
    }
};