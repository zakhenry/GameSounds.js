/**
 * gamesounds.js
 * Game sounds for the javascript games, call a sound with gameSounds.triggerSound('soundname')
 *
 * @author Zak Henry - 2013
 */




;
(function(){

    /**
     *
     * @param initSounds
     * @constructor
     */
    this.GameSounds = function (initSounds){

        this.sounds = initSounds; //public
        //Set up the audio context
        var ac = new (window.AudioContext || window.webkitAudioContext),
//            sounds = initSounds,
            masterGain = ac.createGain(),
            mix = ac.createGain(),
            distanceScale = 0.05,
            audioOut = function(){
                mix.connect(masterGain);
                masterGain.connect(ac.destination);
            };


        Sound = (function (){

            /**
             * Initialise a sound. The parameter data is all the params that define the sound. See gamesounds.sounds for examples
             *
             * @param {Object} data
             * @constructor
             */
            return function (data){

                var thisSound = this,
                    data = data,
                    initTime = ac.currentTime,
                    oscillator = ac.createOscillator(),
                    envelope = ac.createGain(),
                    modOsc = ac.createOscillator(),
                    modOscGain = ac.createGain(),
                    panner = ac.createPanner(),
                    soundVol = ac.createGain(),
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

                        panner.connect(soundVol);

                        soundVol.connect(mix);

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
                 * Set the volume of the currently playing sound
                 * @param vol
                 * @returns {*}
                 */
                this.vol = function(vol){
                    soundVol.gain.value = vol;
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

        })();


        /**
         *
         * @param x
         * @param y
         * @returns {*}
         */
        this.playerPosition = function(x, y){
            x*=distanceScale;
            y*=distanceScale;
            ac.listener.setPosition(x, y, 0);
            return this;
        };

        /**
         *
         * @param soundName
         * @returns {Sound}
         */
        this.get = function(soundName){
            return new Sound(this.sounds[soundName]);
        };

        /**
         *
         * @param number
         * @returns {*}
         */
        this.setVolume = function(number){ //volume 0-100, 0 being silent
            masterGain.gain.value = number/100;
            return this;
        };

        /**
         *
         * @param soundData
         * @returns {Sound}
         */
        this.set = function(soundData){
            return new Sound(soundData);
        };

    }; //end GameSounds Constructor

})();




