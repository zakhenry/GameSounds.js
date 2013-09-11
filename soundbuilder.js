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
        };


        var sb = this,
            gs = new GameSounds({
                example: {"wave":2,"duration":5,"freq":{"points":[[0,874,1],[0.6,874,1],[1.2,912,1],[1.6,114,1],[2.1,0,1]]},"vol":{"points":[[0,0,1],[0.1,1,1],[0.2,0.08,1],[0.3,0.08,1],[0.4,0.88,1],[0.5,0.88,1],[0.8,0.08,1],[1,0.8,1],[2.7,0,1]]},"mod":{"wave":3,"freq":2,"gain":0}},
                siren: {
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
                yesThisIsPhone: {
                    duration: 5.0,
                    wave: 3,
                    freq: {
                        points: [
                            [0.0, 700, 0] //time, frequency, 0=set, 1=linear ramp, 2= exp ramp
                        ]
                    },
                    vol: {
                        points: [
                            [0.0, 1.0, 0],
                            [1.0, 1.0, 0],
                            [1.1, 0.0, 1],
                            [1.2, 1.0, 1]
                        ]
                    },
                    mod: {
                        wave: 1,
                        freq: 10,
                        gain: 100
                    }
                }
            }),

            BuildInterface = (function(){

                return function(width, height){

                    var bi = this,
                        canvas = document.createElement('canvas'),
                        canvasId = 'sound_builder_canvas',
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
                        currentTool = 'vol',
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

                                console.log('creating new gamesounds object');

                                var freqPoints = [], volPoints = [];

                                for (var timePoint in elements.freq){
                                    freqPoints.push([elements.freq[timePoint].time, elements.freq[timePoint].magnitude, 1]);
                                }

                                for (var timePoint in elements.vol){
                                    volPoints.push([elements.vol[timePoint].time, elements.vol[timePoint].magnitude, 1]);
                                }

                                var soundData =  {
                                    wave: this.wave,
                                    duration: this.duration,
                                    freq: {
                                        points: freqPoints
                                    },
                                    vol: {
                                        points: volPoints
                                    },
                                    mod: {
                                        wave: this.mod.wave,
                                        freq: this.mod.freq,
                                        gain: this.mod.gain
                                    }
                                };

                                if (!this.loop){
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
                        }
                        ;

                    canvasWidth = width;
                    canvasHeight = height;

                    canvas.setAttribute('id', 'sound_builder_canvas')
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    parentElement.appendChild(canvas);

                    canvasOffset = canvas.getBoundingClientRect();


                    this.draw = function(){
                        ctx.fillStyle="#222222";
                        ctx.fillRect(0,0,canvasWidth,canvasHeight);

                        switch(currentTool){
                            case 'freq':
                                ctx.fillStyle="#773a0e";
                                break;
                            case 'vol':
                                ctx.fillStyle="#83a9f0";
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
                                        ctx.strokeStyle = '#7f720a';
                                        break;
                                    case 'vol':
                                        ctx.strokeStyle = '#63ff92';
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

                        console.log('mousedownevent', event)

                        if (event.which == 1){ //left click


                            if (typeof elements[currentTool][mouseX] == "object" && elements[currentTool][mouseX].cY == mouseY){
                                delete elements[currentTool][mouseX];
                            }else{
                                var newSoundElement = new SoundElement(currentTool).at(mouseX, mouseY);
                                elements[currentTool][mouseX] = newSoundElement; //replace the mouseY coord (cant be more than one stacked)
                            }

                            sb.testInterface.setTestSound(elements.toGameSoundsObject());
                        }else if (event.which == 3){
                            currentTool = currentTool == 'freq' ? 'vol':'freq';
                        }


                        bi.draw();
                    };

                    document.onkeydown = function(event) {

                        console.log(event.keyCode);
                        if (event.keyCode == 32) { //spacebar
                            var newSound = gs.set(elements.toGameSoundsObject()).fire();

                            console.log(newSound);
                            console.log(elements.toJsonString());
                        }
                    };

                    var addControls = function(){



                        var waveOptions = {0:'sine',1:'square',2:'triangle',3:'sawtooth'};

                        sb.addSelect(parentElement, 'soundBuilder-SoundLoopSelect', {true:'True',false:'False'}, 'Loop sound: ', function(event){
                            elements.loop = event.target.selectedIndex;
                        });

                        sb.addSelect(parentElement, 'soundBuilder-WaveSelect', waveOptions, 'Oscillator wave shape: ', function(event){
                            elements.wave = event.target.selectedIndex;
                        });

                        sb.addSelect(parentElement, 'soundBuilder-ModWaveSelect', waveOptions, 'Oscillator Modulator wave shape: ', function(event){
                            elements.mod.wave = event.target.selectedIndex;
                        });

                        sb.addSlider(parentElement, 'soundBuilder-ModOscFreqSlider', 0, 100, 'Oscillator Modulator Frequency', function(event){
                            elements.mod.freq = event.srcElement.value;
                        });

                        sb.addSlider(parentElement, 'soundBuilder-ModOscGainSlider', 0, 100, 'Oscillator Modulator Gain', function(event){
                            elements.mod.gain = event.srcElement.value;
                        });

                    }();

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


                                console.log('adding node of type ' + se.type + ' with time at '+time+' with magnitude of '+magnitude+'at canvas position '+this.cX+','+this.cY)

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
                                        ctx.fillStyle="#773a0e";
                                    break;
                                    case 'vol':
                                        ctx.fillStyle="#83a9f0";
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

                        console.log(soundData);

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

                        console.log('loaded', soundData, elements);

                        bi.draw();

                    };


                    bi.loadSound(gs.sounds['example']);
                    bi.draw();


                };


            })(),
            TestInterface = (function(){
                return function(width, height){
                    var self = this,
                        container = document.createElement('span'),
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

                    canvas.setAttribute('id', 'sound_tester_canvas')
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    parentElement.appendChild(container);
                    container.appendChild(canvas);

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

                    sb.addSlider(container, 'soundBuilder-VolumeSlider', 0, 100, "Master volume: ", function(event){
                        gs.setVolume(event.srcElement.value);
                    });

                    self.updateListenerPosition(canvasWidth/2, canvasHeight/2); //default to middle of canvas

                    self.draw();
                }
            })();

        this.buildInterface = new BuildInterface(BIwidth, BIheight);
        this.testInterface = new TestInterface(TIwidth, TIheight);

        this.createSoundButtons = function(){
            for (var sound in gs.sounds){
                var soundButton = document.createElement('button');
                soundButton.setAttribute('data-soundname', sound);
                soundButton.innerText = sound;
                parentElement.appendChild(soundButton);

                soundButton.onclick = function(event){
                    var soundName = event.srcElement.getAttribute('data-soundname');
                    sb.testInterface.setTestSound(gs.sounds[soundName]);
                    sb.buildInterface.loadSound(gs.sounds[soundName]);
                };
            }
        }();


    };



})();