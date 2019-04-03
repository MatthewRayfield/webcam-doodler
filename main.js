var renderer,
    colorPicked = false,
    pickingColor = false,
    colorPicker = new Picker(),
    colorPickerShown = false;

var wrapperWrapper,
    pickButton,
    thresholdSpan,
    clearButton,
    eraseModeButton,
    paintModeButton,
    colorPickerWrapper,
    colorPickerButton,
    thresholdSlider,
    header, closeLink;

var BasicVertexShader = [
        "varying vec2 textureCoordinate;",

        "void main() {",
            "textureCoordinate = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n");

function loop() {
    if (pickingColor) {
        pickColor();
    }
    else if (!colorPicked) {
        renderer.renderForColorPick();
    }
    else {
        renderer.render();
    }

    requestAnimationFrame(loop);
}

function pickColor() {
    var data = new Uint8Array(renderer.width * renderer.height * 4),
        x = Math.round(renderer.width/2),
        y = Math.round(renderer.height/2),
        r,
        g,
        b;

    renderer.renderForColorPick();
    renderer.tRenderer.readRenderTargetPixels(renderer.renderTargetD, 0, 0, renderer.width, renderer.height, data);

    r = data[((y*renderer.width)+x)*4+0];
    g = data[((y*renderer.width)+x)*4+1];
    b = data[((y*renderer.width)+x)*4+2];

    colorPicked = true;
    pickButton.style.background = 'rgb('+r+','+g+','+b+')';
    renderer.isolateFilter.uniforms.targetColor.value = new THREE.Vector3(r/255, g/255, b/255);
}

function updateThreshold() {
    var threshold = (thresholdSlider.value/100) * .5;

    renderer.isolateFilter.uniforms.threshold.value = threshold;
}

function pickButtonDown() {
    pickingColor = true;
    circle.style.display = 'inline-block';
}

function pickButtonUp() {
    pickingColor = false;
    circle.style.display = 'none';
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function Picker() {
    var self = this,
        boxHeight = 150, boxWidth = 150,
        sliderMargin = 5, sliderWidth = 20,
        cursorRadius = 5, cursorBorderWidth = 2,
        outputHeight = 20, outputMargin = 5,
        backgroundCanvas = createElement('canvas', {width: boxWidth+sliderMargin+sliderWidth, height: boxHeight}),
        cursorCanvas = createElement('canvas', {width: boxWidth+sliderMargin+sliderWidth, height: boxHeight, style: {position: 'absolute', top: 0, left: 0}}),
        outputBox = createElement('div', {style: {width: boxHeight+sliderMargin+sliderWidth, height: outputHeight, marginTop: outputMargin}}),
        backgroundContext = backgroundCanvas.getContext('2d'),
        cursorContext = cursorCanvas.getContext('2d'),
        renderedSlider = false;

    outputBox.style.display = 'none';

    self.element = createElement('div', {style: {position: 'relative'}}, [backgroundCanvas, cursorCanvas, outputBox]);
    self.h = .5;
    self.s = 1;
    self.v = 1;

    self.onChange = null;

    function renderBackground() {
        var rgb, x, y;

        for (x = 0; x < boxWidth; x ++) {
            for (y = 0; y < boxHeight; y ++) {
                // BOX
                rgb = HSVtoRGB(self.h, x/boxWidth, (boxHeight-y)/boxHeight);
                backgroundContext.fillStyle = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
                backgroundContext.fillRect(x, y, 1, 1);

                if (!renderedSlider) {
                    // SLIDER
                    rgb = HSVtoRGB(y/boxHeight, 1, 1);
                    backgroundContext.fillStyle = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
                    backgroundContext.fillRect(boxWidth+sliderMargin, y, sliderWidth, 1);
                }
            }
        }

        renderedSlider = true;
    }

    function renderCursors() {
        var rgb;

        cursorContext.clearRect(0, 0, boxWidth+sliderMargin+sliderWidth, boxHeight);

        // BOX CURSOR
        cursorContext.beginPath();
        cursorContext.arc(self.s*boxWidth, boxHeight-(self.v*boxHeight), cursorRadius, 0, 2 * Math.PI);
        rgb = HSVtoRGB(self.h, self.s, self.v);
        cursorContext.fillStyle = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
        cursorContext.fill();
        cursorContext.strokeStyle = 'black';
        cursorContext.strokeWidth = cursorBorderWidth;
        cursorContext.stroke();

        // SLIDER CURSOR
        cursorContext.beginPath();
        cursorContext.arc(boxWidth+sliderMargin+(sliderWidth/2), self.h*boxHeight, cursorRadius, 0, 2 * Math.PI);
        rgb = HSVtoRGB(self.h, 1, 1);
        cursorContext.fillStyle = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
        cursorContext.fill();
        cursorContext.strokeStyle = 'black';
        cursorContext.strokeWidth = cursorBorderWidth;
        cursorContext.stroke();
    }

    function setOutput() {
        var rgb = HSVtoRGB(self.h, self.s, self.v);

        self.r = rgb.r;
        self.g = rgb.g;
        self.b = rgb.b;

        outputBox.style.background = 'rgb('+self.r+','+self.g+','+self.b+')';

        if (self.onChange) {
            self.onChange();
        }
    }

    renderBackground();
    renderCursors();
    setOutput();

    function mouseInput(event) {
        var rect = cursorCanvas.getBoundingClientRect(),
            x = event.pageX - rect.left,
            y = event.pageY - rect.top;

        event.preventDefault();

        if (event.buttons != 1) return;

        if (x < boxWidth) {
            self.s = x/boxWidth;
            self.v = (boxHeight-y)/boxHeight;
        }
        else if (x > boxWidth+sliderMargin) {
            self.h = y/boxHeight;
            renderBackground();
        }

        renderCursors();
        setOutput();
    }

    cursorCanvas.addEventListener('mousedown', mouseInput);
    cursorCanvas.addEventListener('mousemove', mouseInput);
}

function Slider(minimum, maximum, value, increment, label, padding) {
    var self = this;

    self.minimum = minimum || 0;
    self.maximum = maximum || 1;
    self.value = value || .5;
    self.increment = increment || .001;
    self.labelText = label || 'label';
    self.padding = padding;

    self.label = createElement('span', {className: 'label'});
    self.innerLabel = createElement('span', {className: 'label'});
    self.inner = createElement('span', {className: 'inner'}, [self.innerLabel]);
    self.element = createElement('span', {className: 'slider'}, [self.label, self.inner]);
    self.onchange = null;

    function pad(value) {
        var s = value + '';

        while (s.length < self.padding) {
            s = ' ' + s;
        }

        s = s.replace(/ /g, '&nbsp;');

        return s;
    }

    self.render = function () {
        var percent = (self.value - self.minimum) / (self.maximum - self.minimum);

        self.inner.style.width = self.element.offsetWidth * percent;
        // yeahhhh the next line is kinda gross... :p
        self.innerLabel.innerHTML = self.label.innerHTML = self.labelText + '<span class="number">' + pad(self.value) + '</span>';
    };

    self.render();

    function handleMouse(event) {
        var percent;

        event.preventDefault();

        if (event.buttons != 1) return;

        percent = (event.pageX - self.element.offsetLeft) / self.element.offsetWidth;
        percent = Math.min(Math.max(0, percent), 1);
        self.value = (percent * (self.maximum - self.minimum)) + self.minimum;
        self.value = Math.round(self.value / self.increment) * self.increment;

        self.render();

        if (self.onchange) {
            self.onchange();
        }
    }

    self.element.addEventListener('mousemove', handleMouse);
    self.element.addEventListener('mousedown', handleMouse);
}

function colorPickerButtonClick() {
    var rect = colorPickerButton.getBoundingClientRect();

    colorPickerWrapper.style.left = rect.left;
    colorPickerWrapper.style.bottom = window.innerHeight - rect.top;

    colorPickerShown = !colorPickerShown;
    if (colorPickerShown) {
        colorPickerWrapper.style.display = 'block';
    }
    else {
        colorPickerWrapper.style.display = 'none';
    }
}

function colorPickerChange() {
    colorPickerButton.style.background = 'rgb('+colorPicker.r+','+colorPicker.g+','+colorPicker.b+')';
    renderer.isolateFilter.uniforms.outputColor.value = new THREE.Vector3(colorPicker.r/255, colorPicker.g/255, colorPicker.b/255);
}

function eraseModeClick() {
    renderer.erase = true;
    eraseModeButton.style.textDecoration = 'underline';
    paintModeButton.style.textDecoration = 'none';
}

function paintModeClick() {
    renderer.erase = false;
    eraseModeButton.style.textDecoration = 'none';
    paintModeButton.style.textDecoration = 'underline';
}

window.addEventListener('load', function () {
    wrapperWrapper = document.getElementById('wrapper-wrapper');
    pickButton = document.getElementById('pick-button');
    thresholdSpan = document.getElementById('threshold-span');
    clearButton = document.getElementById('clear-button');
    eraseModeButton = document.getElementById('erase-button');
    paintModeButton = document.getElementById('paint-button');
    colorPickerWrapper = document.getElementById('color-picker-wrapper');
    colorPickerButton = document.getElementById('color-picker-button');
    header = document.getElementById('header');
    closeLink = document.getElementById('close-link');

    pickButton.addEventListener('mousedown', pickButtonDown);
    document.addEventListener('mouseup', pickButtonUp);
    eraseModeButton.addEventListener('click', eraseModeClick);
    paintModeButton.addEventListener('click', paintModeClick);
    colorPickerButton.addEventListener('click', colorPickerButtonClick);

    thresholdSlider = new Slider(0, 100, 40, 1, 'sensitivity', 3);
    thresholdSpan.appendChild(thresholdSlider.element);
    setTimeout(thresholdSlider.render, 100);
    thresholdSlider.onchange = updateThreshold;

    renderer = new Renderer();

    clearButton.addEventListener('click', renderer.resize); // TODO fix ?
    closeLink.addEventListener('click', function () {header.style.display = 'none';});

    loop();

    useWebcam(function (success) {
        if (success) {
            //document.getElementById('message').innerHTML = 'loading webcam...';
        }
    });
    
    colorPickerChange();
    colorPickerWrapper.appendChild(colorPicker.element);
    colorPicker.onChange = colorPickerChange;
});

function useWebcam(callback) {
    var video = document.createElement('video');

    video.loop = true;

    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (!navigator.getUserMedia) {
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            //document.getElementById('message').innerHTML = 'now available in the <a href="https://itunes.apple.com/us/app/timewiggler/id1273499503?ls=1&mt=8">App Store</a><br />or open this site on desktop';
        }
        else {
            //document.getElementById('message').innerHTML = 'your browser doesn\'t support webcam access... try chrome.';
        }
        return;
    }

    navigator.getUserMedia(
        {
            video: true,
            audio: false
        },
        function (stream) {
            var videoTracks = stream.getVideoTracks(),
                newStream;

            if (videoTracks && videoTracks.length) {
                if (callback) callback(true);

                newStream = new MediaStream(stream.getVideoTracks()),

                video.srcObject = newStream;
                video.play();

                renderer.useInput(video, true);
            }
            else {
                if (callback) callback(false);
            }
        },
        function (error) {
            if (callback) callback(false);
        }
    );
}
