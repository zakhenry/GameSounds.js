/**
 * gamesounds.js Game sounds for the javascript games, call a sound with gameSounds.triggerSound('soundname')
 *
 * @author Zak Henry - 2013
 */

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
    triggerSound: function(sound, x, y){

        var playingSound = gameSounds.sounds[sound]; //a copy

        playingSound.startTime = gameSounds.ac.currentTime;

        var oscillator = gameSounds.ac.createOscillator();



        var now = gameSounds.ac.currentTime;

        var envelope = gameSounds.ac.createGain();

        for (var volNode in playingSound.vol.points){
            var type = gameSounds.getRampType(playingSound.vol.points[volNode][2]);
            envelope.gain[type](playingSound.vol.points[volNode][1], now+ playingSound.vol.points[volNode][0]);
        }

        console.log(gameSounds.ac, oscillator);

        oscillator.type = playingSound.wave;

        for (var freqNode in playingSound.freq.points){

            var type = gameSounds.getRampType(playingSound.freq.points[freqNode][2]);

            oscillator.frequency[type](playingSound.freq.points[freqNode][1], now+ playingSound.freq.points[freqNode][0]);
        }

        var modOsc = gameSounds.ac.createOscillator();
        modOsc.type = playingSound.mod.wave;
        modOsc.frequency.value = playingSound.mod.freq;

        var modOscGain = gameSounds.ac.createGain();
        modOsc.connect( modOscGain );
        modOscGain.gain.value = playingSound.mod.gain;


        modOscGain.connect( oscillator.frequency );	// connect tremolo to oscillator frequency



        var panner = gameSounds.ac.createPanner();

        var panX = (typeof x == 'number') ? x : 0;
        var panY = (typeof y == 'number') ? y : 0;
        console.log(typeof x);
        panner.setPosition(panX, panY, 0);


        oscillator.connect(envelope);

        envelope.connect(panner);

        panner.connect(gameSounds.ac.destination); //connect master volume to output


        oscillator.start(playingSound.startTime);
        oscillator.stop(playingSound.startTime + playingSound.duration);

        modOsc.start(playingSound.startTime);
        modOsc.stop(playingSound.startTime + playingSound.duration);

        console.log('playing sound', playingSound);


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
