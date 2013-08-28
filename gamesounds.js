/**
 * gamesounds.js Game sounds for the javascript games, call a sound with gameSounds.triggerSound('soundname')
 *
 * @author Zak Henry - 2013
 */

function Sound(data){
    this.ac = gameSounds.ac;

    this.data = data;
    this.initTime = this.ac.currentTime;
    this.oscillator = this.ac.createOscillator();
    this.envelope = this.ac.createGain();
    this.modOsc = this.ac.createOscillator();
    this.modOscGain = this.ac.createGain();
    this.panner = this.ac.createPanner();

    this.hasRun = false;
}

Sound.prototype.playSingle = function(x, y){

    if (this.hasRun){
        console.log('this sound has already been run once; it must be recreated to be run again');
        return false;
    }

    var now = this.ac.currentTime;

    console.log('this.data',this.data);

    console.log('playing sound at ', x, y);

    /* Set values from data */
    this.oscillator.type = this.data.wave;

    for (var volNode in this.data.vol.points){
        var type = gameSounds.getRampType(this.data.vol.points[volNode][2]);
        this.envelope.gain[type](this.data.vol.points[volNode][1], now + this.data.vol.points[volNode][0]);
    }

    for (var freqNode in this.data.freq.points){
        var type = gameSounds.getRampType(this.data.freq.points[freqNode][2]);
        this.oscillator.frequency[type](this.data.freq.points[freqNode][1], now+ this.data.freq.points[freqNode][0]);
    }

    this.modOsc.type = this.data.mod.wave;
    this.modOsc.frequency.value = this.data.mod.freq;
    this.modOscGain.gain.value = this.data.mod.gain;
    /* Connect the sounds */

    this.connect();

    this.updateLocation(x, y);

    this.start(now);
    this.stop(now + this.data.duration);

    this.hasRun = true;

    return true;
};

Sound.prototype.connect = function(){
    this.modOsc.connect( this.modOscGain );
    this.modOscGain.connect( this.oscillator.frequency );	// connect tremolo to oscillator frequency
    this.oscillator.connect(this.envelope);
    this.envelope.connect(this.panner);
    this.panner.connect(this.ac.destination); //connect master volume to outputvolume to output
};

Sound.prototype.updateLocation = function(x, y){
    var panX = (typeof x == 'number') ? x : 0;
    var panY = (typeof y == 'number') ? y : 0;

    this.panner.setPosition(panX, panY, 0);
};

Sound.prototype.start = function(time){
    this.oscillator.start(time);
    this.modOsc.start(time);
};

Sound.prototype.stop = function(time){
    this.oscillator.stop(time);
    this.modOsc.stop(time);
};

Sound.prototype.isPlaying = function(){

    return (this.ac.currentTime-this.initTime) < this.data.duration;

};

var gameSounds = {

    ac: new (window.AudioContext || window.webkitAudioContext),
    sounds: {

        rand3: {
            duration: 1.5,
            wave: 0,
            freq: {
                points: [
                    [0.0, 900, 0], //time, frequency, 0=set, 1=linear ramp, 2= exp ramp
                    [0.5, 400, 2],
                    [0.5, 900, 0],
                    [1.0, 400, 2],
                    [1.0, 900, 0],
                    [1.5, 400, 2]
                ]
            },
            vol: {
                points: [
                    [0.0, 5.0, 0],
                    [0.5, 0.0, 1],
                    [0.5, 2.0, 0],
                    [1.0, 0.0, 1],
                    [1.0, 0.5, 0],
                    [1.5, 0.0, 1]
                ]
            },
            mod: {
                wave: 3,
                freq: 90,
                gain: 100
            }
        },

        pulse: {
            duration: 1.8,
            wave: 0,
            freq: {
                points: [
                    [0.0, 900, 0], //time, frequency, 0=set, 1=linear ramp, 2= exp ramp
                    [1.8, 400, 2]
                ]
            },
            vol: {
                points: [
                    [0.0, 5.0, 0],
                    [1.7, 5.0, 0],
                    [1.8, 1.0, 1]
                ]
            },
            mod: {
                wave: 3,
                freq: 90,
                gain: 100
            }
        },

        rand1: {
            duration: 6.0,
            wave: 0,
            freq: {
                points: [
                    [0.0, 600, 0], //time, frequency, 0=set, 1=linear ramp, 2= exp ramp
                    [1.5, 800, 1],
                    [1.6, 700, 0],
                    [3.0, 950, 1],
                    [3.1, 850, 0],
                    [4.5, 1100, 1],
                    [6.0, 100, 2]
                ]
            },
            vol: {
                points: [
                    [0.0, 5.0, 0],
                    [4.0, 4.0, 1],
                    [5.9, 0.0, 1]
                ]
            },
            mod: {
                wave: 1,
                freq: 9,
                gain: 100
            }
        },

        rand2: {
            duration: 2.0,
            wave: 0,
            freq: {
                points: [
                    [0.0, 80, 0], //time, frequency, 0=set, 1=linear ramp, 2= exp ramp
//                                    [0.9, 50, 2],
                    [1.0, 70, 0]
//                                    [2.0, 40, 2]
                ]
            },
            vol: {
                points: [
                    [0.0, 5.0, 0],
                    [1.0, 5.0, 0],
                    [2.0, 0.0, 1]
                ]
            },
            mod: {
                wave: 1,
                freq: 100,
                gain: 50
            }
        },

        yesThisIsPhone: {
            duration: 2.0,
            wave: 3,
            freq: {
                points: [
                    [0.0, 700, 0] //time, frequency, 0=set, 1=linear ramp, 2= exp ramp
                ]
            },
            vol: {
                points: [
                    [0.0, 5.0, 0],
                    [1.0, 5.0, 0],
                    [1.1, 0.0, 1],
                    [1.2, 5.0, 1]
                ]
            },
            mod: {
                wave: 1,
                freq: 10,
                gain: 100
            }
        },

        siren: {
            duration: 2.0,
            wave: 3,
            freq: {
                points: [
                    [0.0, 700, 0] //time, frequency, 0=set, 1=linear ramp, 2= exp ramp
                ]
            },
            vol: {
                points: [
                    [0.0, 5.0, 0]
                ]
            },
            mod: {
                wave: 3,
                freq: 2,
                gain: 100
            }
        },

        alert: {
            duration: 2.0,
            wave: 3,
            freq: {
                points: [
                    [0.0, 700, 0] //time, frequency, 0=set, 1=linear ramp, 2= exp ramp
                ]
            },
            vol: {
                points: [
                    [0.0, 5.0, 0]
                ]
            },
            mod: {
                wave: 1,
                freq: 2,
                gain: 100
            }
        }

    },

    getSound: function(sound){
        var data = gameSounds.sounds[sound]; //a copy

        var sound = new Sound(data);

        return sound;
    },


    triggerSound: function(sound, x, y){

        var data = gameSounds.sounds[sound]; //a copy

        var sound = new Sound(data);

        sound.playSingle(x, y);

        return sound;

    },

    getRampType: function(number){
        var type = null;
        switch (number){
            case 0:
                type = 'setValueAtTime';
                break;
            case 1:
                type = 'linearRampToValueAtTime';
                break;
            case 2:
                type = 'exponentialRampToValueAtTime';
                break;
            default:
                type = 'setValueAtTime';
        }

        return type;
    }

}