/**
 * soundbuilder.js
 * Build game sounds for the gamesounds.js library (Required dependency)
 *
 * @author Zak Henry - 2013
 */



;
(function(){

    /**
     *
     * @constructor
     */
    this.SoundBuilder = function(parentElement, BIwidth, BIheight, TIwidth, TIheight){



        /**
         * Helper function to create a <select> input
         * @param appendNode
         * @param id
         * @param selectOptions
         * @param labelText
         * @param onchangefunction
         */
        this.addSelect = function(appendNode, id, selectOptions, labelText, onchangefunction){
            var select = document.createElement('select'),
                label = document.createElement('label');

            select.setAttribute('id', id);
            label.setAttribute('for', id);

            label.innerText = labelText;

            for(var optionId in selectOptions){
                var option = document.createElement('option');
                option.setAttribute('val', optionId);
                option.innerText = selectOptions[optionId];

                select.appendChild(option);
            }

            appendNode.appendChild(label);
            appendNode.appendChild(select);

            select.onchange = onchangefunction;

            return select;
        };

        /**
         * Helper function to create an <input type="slider"> element
         * @param appendNode
         * @param id
         * @param min
         * @param max
         * @param labelText
         * @param onchangefunction
         */
        this.addSlider = function (appendNode, id, min, max, labelText, onchangefunction){
            var slider = document.createElement('input'),
                sliderLabel = document.createElement('label');
            slider.setAttribute('id', id);
            slider.setAttribute('type', 'range');
            slider.setAttribute('min', min);
            slider.setAttribute('max', max);
            sliderLabel.innerText = labelText;
            sliderLabel.setAttribute('for', id);

            appendNode.appendChild(sliderLabel);
            appendNode.appendChild(slider);

            slider.onchange = onchangefunction;

            return slider;
        };

        var savedSoundContainer = document.createElement('div');
        savedSoundContainer.setAttribute('id', 'soundBuilder-SavedSounds');
        savedSoundContainer.setAttribute('id', 'soundBuilder-SavedSounds');


        var codeContainer = document.createElement('pre');
        codeContainer.setAttribute('id', 'soundBuilder-BuildInterfaceCode');



        var sb = this,
            gs = new GameSounds({
                shipSound: {wave:0,freq:{points:[[0,114,1]]},vol:{points:[[0,5,1]]},mod:{wave:0,freq:26,gain:11}},
                itemPickup: {wave:1,duration:0.9,freq:{points:[[0,646,1],[0.1,342,1],[0.4,304,1]]},vol:{points:[[0,0,1],[0.1,0.68,1],[0.2,0.76,1],[0.3,0.6,1],[0.5,0.48,1],[0.6,0.68,1],[0.9,0,1]]},mod:{wave:1,freq:43,gain:41}},
                itemSpawn:{wave:0,duration:0.5,freq:{points:[[0,114,1],[0.2,646,1],[0.3,380,1]]},vol:{points:[[0,0,1],[0.1,0.6,1],[0.5,0,1]]},mod:{wave:0,freq:51,gain:51}},
                pulse: {wave:0,duration:2.6,freq:{points:[[0,114,1],[0.1,646,1],[0.2,456,1],[0.5,760,1],[1.5,646,1],[2.4,266,1],[2.5,0,1]]},vol:{points:[[0,0,1],[0.1,0.6,1],[0.5,0.12,1],[0.6,0.4,1],[2.6,0,1]]},mod:{wave:2,freq:49,gain:78}},
                speedBoostUp: {wave:0,duration:1.8,freq:{points:[[0,76,1],[0.4,114,1],[0.8,228,1],[1,380,1],[1.1,494,1]]},vol:{points:[[0,0.56,1],[0.7,0.64,1],[1.3,0.84,1],[1.8,0,1]]},mod:{wave:1,freq:43,gain:41}},
                speedBoostDown: {wave:0,duration:1.1,freq:{points:[[0,456,1],[0.4,418,1],[0.8,304,1],[1,190,1],[1.1,0,1]]},vol:{points:[[0,0.56,1],[0.7,0.64,1],[1.1,0,1]]},mod:{wave:1,freq:43,gain:41}},
                invisibilityOn: {wave:1,duration:1.6,freq:{points:[[0,608,1],[0.1,646,1],[0.4,494,1],[0.8,456,1],[0.9,456,1],[1.5,380,1]]},vol:{points:[[0,0,1],[0.8,0.6,1],[1.6,0,1]]},mod:{wave:2,freq:22,gain:69}},
                invisibilityOff: {wave:1,duration:1.6,freq:{points:[[0,380,1],[0.4,494,1],[0.8,456,1],[0.9,456,1],[1.2,494,1],[1.5,646,1]]},vol:{points:[[0,0,1],[0.8,0.6,1],[1.6,0,1]]},mod:{wave:2,freq:22,gain:69}},
                wallHit:{wave:1,duration:0.1,freq:{points:[[0,0,1]]},vol:{points:[[0,0.68,1],[0.1,0.68,1]]},mod:{wave:1,freq:43,gain:41}},
                ded: {wave:1,duration:1.4,freq:{points:[[0,228,1],[0.5,228,1],[0.7,152,1],[1.4,114,1]]},vol:{points:[[0,0,1],[0.1,0.4,1],[0.2,0.4,1],[0.4,0,1],[0.6,0,1],[0.7,0.24,1],[0.9,0.24,1],[1.4,0,1]]},mod:{wave:0,freq:22,gain:89}},
                siren: {wave:3,freq:{points:[[0,700,1]]},vol:{points:[[0,5,1]]},mod:{wave:3,freq:2,gain:100}}
            }),

            BuildInterface = (function(){

                return function(width, height){

                    var bi = this,
                        canvas = document.createElement('canvas'),
                        buildContainer = document.createElement('div'),
                        canvasId = 'soundBuilder-BuildInterfaceCanvas',
                        ctx = canvas.getContext("2d"),
                        canvasWidth = width,
                        canvasHeight = height,
                        canvasOffset = null,
                        mouseX,
                        mouseY,
                        quantiseCoordinates = function(val){
                            var quantaSize = 20,
                                quantised = null,
                                mod = val % quantaSize
                            ;

                            if (mod > quantaSize/2){
                                quantised = val + (quantaSize - mod);
                            }else{
                                quantised = val - mod;
                            }

                            return quantised;
                        },
                        currentTool = 'freq',
                        elements = {
                            freq: {},
                            vol: {},
                            wave: null,
                            duration: null,
                            mod: {
                                wave: null,
                                freq: null,
                                gain: null
                            },

                            loop: false,

                            toGameSoundsObject: function(){

                                var freqPoints = [], volPoints = [];

                                for (var timePoint in elements.freq){
                                    freqPoints.push([elements.freq[timePoint].time, elements.freq[timePoint].magnitude, 1]);
                                }

                                for (var timePoint in elements.vol){
                                    volPoints.push([elements.vol[timePoint].time, elements.vol[timePoint].magnitude, 1]);
                                }

                                var soundData =  {
                                    wave: elements.wave,
                                    freq: {
                                        points: freqPoints
                                    },
                                    vol: {
                                        points: volPoints
                                    },
                                    mod: {
                                        wave: elements.mod.wave,
                                        freq: elements.mod.freq,
                                        gain: elements.mod.gain
                                    }
                                };

                                if (elements.loop){
                                    soundData.duration = elements.vol[timePoint].time; //the last one
                                }

                                return soundData;
                            },
                            toJsonString: function(){
                                var object = this.toGameSoundsObject();
                                return JSON.stringify(object);
                            }
                        },
                        limits = {
                            time: {
                                upper: 5,
                                lower: 0
                            },
                            freq: {
                                upper: 1000,
                                lower: 50
                            },
                            vol: {
                                upper: 1,
                                lower: 0
                            }
                        },
                        getScale = function(magnitude, limit, axis, flip, toCanvas){
                            var range = limit.upper - limit.lower;
                            var scale = axis/range;

                            if (toCanvas){
                                if (flip){
                                    return axis - (magnitude * scale);
                                }else{
                                    return magnitude * scale;
                                }
                            }else{
                                if (flip){
                                    return (axis - magnitude) / scale;
                                }else{
                                    return magnitude / scale;
                                }
                            }

                        },
                        timeScale = function(time, toCanvas){
                            return getScale(time, limits.time, canvasWidth, false, toCanvas);
                        },
                        freqScale = function(freq, toCanvas){
                            return getScale(freq, limits.freq, canvasHeight, true, toCanvas);
                        },
                        volScale = function(vol, toCanvas){
                            return getScale(vol, limits.vol, canvasHeight, true, toCanvas);
                        },
                        inputControls = {
                            loop: null,
                            wave: null,
                            modWave: null,
                            modFreq: null,
                            modGain: null
                        },
                        waveOptions = {
                            0:'sine',
                            1:'square',
                            2:'triangle',
                            3:'sawtooth'
                        }
                        ;

                    canvasWidth = width;
                    canvasHeight = height;

                    canvas.setAttribute('id', 'soundBuilder-BuildInterfaceCanvas');
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    buildContainer.setAttribute('id', 'soundBuilder-BuildInterfaceContainer');

                    buildContainer.appendChild(canvas);
                    parentElement.appendChild(buildContainer);

                    canvasOffset = canvas.getBoundingClientRect();


                    this.draw = function(){
                        ctx.fillStyle="#222222";
                        ctx.fillRect(0,0,canvasWidth,canvasHeight);

//                        blue = 0x0098D4;
//                        green = 0x01BB00;
//                        lightGrey = 0xDEE8E9;
//                        orange = 0xFE4F00;
//                        darkGrey = 0xC3C9C9;
//                        black = 0x000000;
//                        white = 0xFFFFFF;

                        switch(currentTool){
                            case 'freq':
                                ctx.fillStyle="#0098D4";
                                break;
                            case 'vol':
                                ctx.fillStyle="#01BB00";
                                break;
                        }
                        ctx.fillRect(mouseX-10, mouseY-10, 20, 20);

                        ctx.lineWidth = 5;
                        ctx.lineCap = 'round';


                        var lineX = 0, lineY = 0;

                        var elementsToDraw = ['freq', 'vol'];

                        for(var soundElementType in elements){

                            if (elementsToDraw.indexOf(soundElementType) >= 0){

                                var first = true;
                                for(var soundElement in elements[soundElementType]){


                                    var element = elements[soundElementType][soundElement];
                                    element.drawElement(ctx);

                                    ctx.moveTo(lineX, lineY);
                                    if (first){
                                        ctx.beginPath();
                                        first = false;
                                    }
                                    lineX = element.cX;
                                    lineY = element.cY;
                                    ctx.lineTo(lineX, lineY);
                                }

                                switch(soundElementType){
                                    case 'freq':
                                        ctx.strokeStyle = '#3682A1';
                                        break;
                                    case 'vol':
                                        ctx.strokeStyle = '#2F8E2F';
                                        break;
                                }


                                ctx.stroke();
                            } //end if draw element

                        }

                    };

                    canvas.oncontextmenu = function(){
                        return false;
                    };

                    canvas.onmousemove = function(){
                        mouseX = quantiseCoordinates( event.clientX - canvasOffset.left + window.scrollX );
                        mouseY = quantiseCoordinates( event.clientY - canvasOffset.top + window.scrollY );

                        bi.draw();
                    };

                    canvas.onmousedown = function(event){

                        if (event.which == 1){ //left click


                            if (typeof elements[currentTool][mouseX] == "object" && elements[currentTool][mouseX].cY == mouseY){
                                delete elements[currentTool][mouseX];
                            }else{
                                var newSoundElement = new SoundElement(currentTool).at(mouseX, mouseY);
                                elements[currentTool][mouseX] = newSoundElement; //replace the mouseY coord (cant be more than one stacked)
                            }


                        }else if (event.which == 3){
                            currentTool = currentTool == 'freq' ? 'vol':'freq';
                        }


                        bi.draw();
                        bi.updateCode();
                    };

                    document.onkeydown = function(event) {

                        if (event.keyCode == 32) { //spacebar
                            var newSound = gs.set(elements.toGameSoundsObject()).fire();
                        }
                    };

                    var addControls = function(){

                        var controls = document.createElement('div');
                        controls.setAttribute('id', 'soundBuilder-Controls');

                        inputControls.loop = sb.addSelect(controls, 'soundBuilder-SoundLoopSelect', {true:'True',false:'False'}, 'Loop sound: ', function(event){
                            elements.loop = event.target.selectedIndex;
                            bi.updateCode();
                        });

                        inputControls.wave = sb.addSelect(controls, 'soundBuilder-WaveSelect', waveOptions, 'Oscillator wave shape: ', function(event){
                            elements.wave = event.target.selectedIndex;
                            bi.updateCode();
                        });

                        inputControls.modWave = sb.addSelect(controls, 'soundBuilder-ModWaveSelect', waveOptions, 'Oscillator Modulator wave shape: ', function(event){
                            elements.mod.wave = event.target.selectedIndex;
                            bi.updateCode();
                        });

                        inputControls.modFreq = sb.addSlider(controls, 'soundBuilder-ModOscFreqSlider', 0, 100, 'Oscillator Modulator Frequency', function(event){
                            elements.mod.freq = Number(event.srcElement.value);
                            bi.updateCode();
                        });

                        inputControls.modGain = sb.addSlider(controls, 'soundBuilder-ModOscGainSlider', 0, 100, 'Oscillator Modulator Gain', function(event){
                            elements.mod.gain = Number(event.srcElement.value);
                            bi.updateCode();
                        });


                        buildContainer.appendChild(controls);

                    }();

                    this.updateCode = function(){
                        codeContainer.innerText = elements.toJsonString();
                        sb.testInterface.setTestSound(elements.toGameSoundsObject());
                    };



                    var SoundElement = (function(){

                        return function(type){
                            var  se = this;
                            this.cX = null;
                            this.cY = null;
                            this.time = null;
                            this.magnitude = null;
                            this.type = type;

                            this.set = function(time, magnitude){ //set based on the values

                                this.time = time;
                                this.magnitude = magnitude;

                                this.cX = quantiseCoordinates(timeScale(time, true));
                                if (type == 'freq'){
                                    this.cY = quantiseCoordinates(freqScale(magnitude, true));
                                }else if (type == 'vol'){
                                    this.cY = quantiseCoordinates(volScale(magnitude, true));
                                }



                                return this;
                            };

                            this.at = function(canvasX, canvasY){ //set based on the canvas

                                if (type == 'freq'){
                                    return se.set(timeScale(canvasX, false), freqScale(canvasY), false);
                                }else if (type == 'vol'){
                                    return se.set(timeScale(canvasX, false), volScale(canvasY), false);
                                }


                            };

                            this.drawElement = function(ctx){
                                switch(type){
                                    case 'freq':
                                        ctx.fillStyle="#0098D4";
                                        break;
                                    case 'vol':
                                        ctx.fillStyle="#01BB00";
                                        break;
                                }
                                ctx.fillRect(this.cX-10, this.cY-10, 20, 20);
                            };

                            return this;
                        }
                    })();

                    this.loadSound = function(soundData){
                        elements.freq = {};
                        elements.vol = {}; //clear data
                        elements.wave = soundData.wave;
                        elements.duration = soundData.duration;
                        elements.mod = soundData.mod;
                        elements.loop = (typeof soundData.duration != 'undefined');

                        inputControls.loop.value = (typeof soundData.duration == 'undefined') ? 'True':'False';
                        inputControls.wave.value = waveOptions[elements.wave];

                        inputControls.modWave.value = waveOptions[elements.mod.wave];
                        inputControls.modFreq.value = elements.mod.freq;
                        inputControls.modGain.value = elements.mod.gain;


                        for(var freqId in soundData.freq.points){
                            var freqElement = soundData.freq.points[freqId];

                            var canvasX = quantiseCoordinates(timeScale(freqElement[0], true));

                            var newSoundElement = new SoundElement('freq').set(freqElement[0], freqElement[1]);
                            elements['freq'][canvasX] = newSoundElement;

                        }

                        for(var volId in soundData.vol.points){
                            var volElement = soundData.vol.points[volId];

                            var canvasX = quantiseCoordinates(timeScale(volElement[0], true));

                            var newSoundElement = new SoundElement('vol').set(volElement[0], volElement[1]);
                            elements['vol'][canvasX] = newSoundElement;

                        }

                        bi.draw();

                    };


                    bi.loadSound(gs.sounds['ded']);
                    bi.draw();


                };


            })(),
            TestInterface = (function(){
                return function(width, height){
                    var self = this,
                        testContainer = document.createElement('div'),
                        canvas = document.createElement('canvas'),
                        ctx = canvas.getContext("2d"),
                        canvasWidth = null,
                        canvasHeight = null,
                        canvasOffset = null,
                        mouseX,
                        mouseY,
                        listenerX,
                        listenerY,
                        testSoundName = function(){
                            for (var defaultSound in gs.sounds) break; //get the first sound as default
                            return defaultSound;
                        }(),
                        testSoundData = gs.sounds[testSoundName],
                        testSound = null
                    ;

                    testContainer.setAttribute('id', 'soundBuilder-TestInterfaceContainer')

                    canvas.onmousemove = function(event){

                        mouseX = event.clientX - canvasOffset.left + window.scrollX;
                        mouseY = event.clientY - canvasOffset.top + window.scrollY;

                        if (testSound && testSound.isPlaying()){
                            testSound.at(mouseX, mouseY);
                        }

                        self.draw();

                    };

                    canvas.onmousedown = function(event){
                        testSound = gs.set(testSoundData).at(mouseX, mouseY).start();
                    };

                    canvas.onmouseup = function(event){
                        testSound.stop();
                    };

                    canvasWidth = width;
                    canvasHeight = height;

                    canvas.setAttribute('id', 'soundBuilder-TestInterfaceCanvas')
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    parentElement.appendChild(testContainer);
                    testContainer.appendChild(canvas);

                    canvasOffset = canvas.getBoundingClientRect();

                    this.draw = function(){
                        ctx.fillStyle="#333333";
                        ctx.fillRect(0,0,canvasWidth,canvasHeight);

                        ctx.fillStyle="#3f3fff";
                        ctx.fillRect(mouseX-3, mouseY-3, 6, 6);

                        ctx.fillStyle="#f43f6f";
                        ctx.fillRect(listenerX-3, listenerY-3, 6, 6);

                    };

                    this.updateListenerPosition = function(x, y){
                        listenerX = x;
                        listenerY = y;
                        gs.playerPosition(x, y);
                    };

                    this.setTestSound = function(soundData){
                        testSoundData = soundData;
                    };

                    self.updateListenerPosition(canvasWidth/2, canvasHeight/2); //default to middle of canvas

                    self.draw();
                }
            })();

        this.buildInterface = new BuildInterface(BIwidth, BIheight);
        this.testInterface = new TestInterface(TIwidth, TIheight);

        sb.buildInterface.updateCode();


        this.createSoundButtons = function(){
            for (var sound in gs.sounds){
                var soundButton = document.createElement('button');
                soundButton.setAttribute('data-soundname', sound);
                soundButton.innerText = sound;
                savedSoundContainer.appendChild(soundButton);

                soundButton.onclick = function(event){
                    var soundName = event.srcElement.getAttribute('data-soundname');
                    sb.testInterface.setTestSound(gs.sounds[soundName]);
                    sb.buildInterface.loadSound(gs.sounds[soundName]);
                    sb.buildInterface.updateCode();
                };
            }
        }();

        sb.addSlider(savedSoundContainer, 'soundBuilder-VolumeSlider', 0, 100, "Master volume: ", function(event){
            gs.setVolume(Number(event.srcElement.value));
        });

        savedSoundContainer.appendChild(codeContainer);
        parentElement.appendChild(savedSoundContainer);



    };


})();