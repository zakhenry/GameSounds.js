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
                    mouseY
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

                    ctx.fillStyle="#3f3fff";
                    ctx.fillRect(mouseX-3, mouseY-3, 6, 6);

                };

                canvas.onmousemove = function(){
                    mouseX = event.clientX - canvasOffset.left + window.scrollX;
                    mouseY = event.clientY - canvasOffset.top + window.scrollY;

                    self.draw();
                };

                self.draw();

            };


        })(),
        TestInterface = (function(){
            return function(width, height){
                var self = this,
                    container = document.createElement('div'),
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

                this.showSounds = function(){
                    for (var sound in gs.sounds){
                        var soundButton = document.createElement('button');
                        soundButton.setAttribute('data-soundname', sound);
                        soundButton.innerText = sound;
                        container.appendChild(soundButton);

                        soundButton.onclick = function(event){
                            testSoundName = event.srcElement.getAttribute('data-soundname');
                        };
                    }
                };

                self.updateListenerPosition(canvasWidth/2, canvasHeight/2); //default to middle of canvas

                self.draw();
                self.showSounds();
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