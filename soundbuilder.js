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
    this.SoundBuilder = function(parentElement){

        var gs = new GameSounds({
            example: {
                duration: 1.5,
                wave: 0,
                freq: {
                    points: [
                        [0.0, 900, 0], //time, frequency, 0=set, 1=linear ramp, 2= exp ramp
                        [0.5, 400, 2],
                        [0.6, 900, 2],
                        [1.0, 400, 2],
                        [1.1, 900, 2],
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
            }
        });

        var BuildInterface = (function(){

            return function(width, height){

                var self = this,
                    canvas = document.createElement('canvas'),
                    canvasId = 'sound_builder_canvas',
                    ctx = canvas.getContext("2d"),
                    canvasWidth = null,
                    canvasHeight = null,
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
                        vol: {}
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

                    ctx.fillStyle="#a7ef01";
                    ctx.fillRect(mouseX-10, mouseY-10, 20, 20);

                    ctx.lineWidth = 5;
                    ctx.lineCap = 'round';
                    ctx.beginPath();

                    var lineX = 0, lineY = 0;

                    for(var soundElementType in elements){

                        for(var soundElement in elements[soundElementType]){
                            var element = elements[soundElementType][soundElement];
                            element.drawElement(ctx);

                            ctx.moveTo(lineX, lineY);
                            lineX = element.cX;
                            lineY = element.cY;
                            ctx.lineTo(lineX, lineY);
                        }

                    }
                    ctx.strokeStyle = '#7f720a';
                    ctx.stroke();
                    ctx.closePath();

                };



                canvas.onmousemove = function(){
                    mouseX = quantiseCoordinates( event.clientX - canvasOffset.left + window.scrollX );
                    mouseY = quantiseCoordinates( event.clientY - canvasOffset.top + window.scrollY );

                    self.draw();
                };

                canvas.onmousedown = function(){
                    var newSoundElement = new SoundElement(currentTool).at(mouseX, mouseY);
                    elements[currentTool][mouseX] = newSoundElement; //replace the mouseY coord (cant be more than one stacked)

                    console.log(elements);

                    self.draw();
                };

                self.draw();

                var SoundElement = (function(){

                    return function(type){
                        var time, magnitude
                        ;

                        this.cX = null;
                        this.cY = null;

                        this.at = function(x, y){
                            this.cX = x;
                            this.cY = y;

                            return this;
                        };

                        this.drawElement = function(ctx){
                            ctx.fillStyle="#773a0e";
                            ctx.fillRect(this.cX-10, this.cY-10, 20, 20);
                        };

                        return this;
                    }
                })();

                this.loadSound = function(sound){
                    var soundData = gs.sounds[sound];
                    console.log(soundData);

                    for(var freqId in soundData.freq.points){
                        var freqElement = soundData.freq.points[freqId];

                        console.log(soundData.freq, freqElement);

                        var newSoundElement = new SoundElement(currentTool).at(freqElement[0] * 300, freqElement[1]/2);
                        elements[currentTool][freqElement[0] * 300] = newSoundElement;

                        console.log(elements);
                    }
                };


                self.loadSound('example');


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
                    testSound = gs.get(testSoundName).at(mouseX, mouseY).start();
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

                this.createSoundButtons = function(){
                    for (var sound in gs.sounds){
                        var soundButton = document.createElement('button');
                        soundButton.setAttribute('data-soundname', sound);
                        soundButton.innerText = sound;
                        container.appendChild(soundButton);

                        soundButton.onclick = function(event){
                            testSoundName = event.srcElement.getAttribute('data-soundname');
                        };
                    }
                }();

                this.createVolumeSlider = function(){
                    var volumeSlider = document.createElement('input');
                    volumeSlider.setAttribute('type', 'range')
                    volumeSlider.setAttribute('min', 0);
                    volumeSlider.setAttribute('max', 100);
                    container.appendChild(volumeSlider);

                    volumeSlider.onchange = function(event){
                        var volume = event.srcElement.value;
                        gs.setVolume(volume);
                    }
                }();

                self.updateListenerPosition(canvasWidth/2, canvasHeight/2); //default to middle of canvas

                self.draw();
            }
        })();

        this.createBuildInterface = function(width, height){
            return new BuildInterface(width, height);
        };

        this.createTestInterface = function(width, height){
            return new TestInterface(width, height);
        };



    };



})();