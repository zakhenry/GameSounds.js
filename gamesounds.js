/**
 * gamesounds.js Game sounds for the javascript games, call a sound with gameSounds.triggerSound('soundname')
 *
 * @author Zak Henry - 2013
 */




;
(function(){


    /**
     * Construct
     */
    function _construct(initSounds){

        //Set up the audio context
        var ac = new (window.AudioContext || window.webkitAudioContext),
            sounds = initSounds,
            masterGain = ac.createGain(),
            mix = ac.createGain(),
            distanceScale = 0.05,
            audioOut = function(){

                var compressor = ac.createDynamicsCompressor(),
                    delay = ac.createDelayNode();

                delay.delayTime.value = 0.2;

                mix.connect(delay);
                mix.connect(masterGain); //bypass the delay node
                delay.connect(masterGain);
                masterGain.connect(compressor);

                compressor.connect(ac.destination);
            };

        /**
         * Initialise a sound. The parameter data is all the params that define the sound. See gamesounds.sounds for examples
         *
         * @param {Object} data
         * @constructor
         */
        Sound = (function (){

            function _constructSound(data){

                var thisSound = this,
                    data = data,
                    initTime = ac.currentTime,
                    oscillator = ac.createOscillator(),
                    envelope = ac.createGain(),
                    modOsc = ac.createOscillator(),
                    modOscGain = ac.createGain(),
                    panner = ac.createPanner(),
                    hasRun = false,
                    now = ac.currentTime,
                    getRampType = function(number){
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
                    },
                    /**
                     * Connects the audio nodes together
                     */
                        connectNodes = function(){
                        modOsc.connect(modOscGain );
                        modOscGain.connect(oscillator.frequency );	// connect tremolo to oscillator frequency
                        oscillator.connect(envelope);
                        envelope.connect(panner);

                        panner.connect(mix);

                    };

                oscillator.type = data.wave;

                for (var volNode in data.vol.points){
                    var type = getRampType(data.vol.points[volNode][2]);
                    envelope.gain[type](data.vol.points[volNode][1], now + data.vol.points[volNode][0]);
                }

                for (var freqNode in data.freq.points){
                    var type = getRampType(data.freq.points[freqNode][2]);
                    oscillator.frequency[type](data.freq.points[freqNode][1], now+ data.freq.points[freqNode][0]);
                }



                modOsc.type = data.mod.wave;
                modOsc.frequency.value = data.mod.freq;
                modOscGain.gain.value = data.mod.gain;
                /* Connect the sounds */

                connectNodes();
                audioOut();


                /**
                 * Updates the game environment location. This is used in conjuction with gamesounds.ac.listener.setLocation() to
                 * determine volume/pan
                 *
                 * @param {Number} x
                 * @param {Number} y
                 * @returns {Sound}
                 */
                this.at = function(x, y){
                    var panX = (typeof x == 'number') ? x : 0;
                    var panY = (typeof y == 'number') ? y : 0;

                    panY*=distanceScale;
                    panX*=distanceScale;

                    panner.setPosition(panX, panY, 0);

                    return thisSound;
                };
                /**
                 * Starts a sound playing at specified time, if no time is specified play starts immediately
                 *
                 * @param {Number} [time]
                 * @returns {Sound}
                 */
                this.start = function(time){

                    if (hasRun){
                        console.log('this sound has already been run once; it must be recreated to be run again');
                        return false;
                    }

                    if (typeof time == 'undefined'){
                        time = ac.currentTime; //now
                    }

                    oscillator.start(time);
                    modOsc.start(time);

                    if (typeof data.duration != 'undefined'){
                        thisSound.stop(time + data.duration);
                    }

                    return thisSound;
                };
                /**
                 * Alias function to Sound.start();
                 */
                this.fire = function(){
                    thisSound.start();
                    return thisSound;
                };
                /**
                 * Stops sound playing at a certain time. If no time is set it will stop immediately
                 *
                 * @param {Number} [time]
                 * @returns {Sound}
                 */
                this.stop = function(time){

                    if (typeof time == 'undefined'){
                        time = ac.currentTime; //now
                    }

                    oscillator.stop(time);
                    modOsc.stop(time);

                    hasRun = true;

                    return thisSound;
                };

                /**
                 * Checks if a sound is (still) playing
                 * @returns {boolean}
                 */
                this.isPlaying = function(){
                    return typeof data.duration == 'undefined' || (ac.currentTime-initTime) < data.duration; //if no duration set, it is always playing
                };

            }

            return _constructSound;
        })();



        this.playerPosition = function(x, y){
            x*=distanceScale;
            y*=distanceScale;
            ac.listener.setPosition(x, y, 0);
        };

        this.get = function(soundName){
            return new Sound(sounds[soundName]);
        };

        this.setVolume = function(number){ //volume 0-100, 0 being silent
            masterGain.gain.value = number/100;
        };

    } //end GameSounds Constructor


    this.GameSounds = _construct;

}).call(function () {
    return this || (typeof window !== 'undefined' ? window : global);
}());




