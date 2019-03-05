var renderer,
    pickingColor = false,
    colorPicker = new Picker();

var pickButton, thresholdRange, thresholdSpan, clearButton;

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

    document.body.style.background = 'rgb('+r+','+g+','+b+')';
    console.log('rgb('+r+','+g+','+b+')');

    renderer.isolateFilter.uniforms.targetColor.value = new THREE.Vector3(r/255, g/255, b/255);
}

function updateThreshold() {
    var threshold = thresholdRange.value;

    renderer.isolateFilter.uniforms.threshold.value = threshold;
    thresholdSpan.innerHTML = threshold;
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
        cursorContext = cursorCanvas.getContext('2d');

    self.element = createElement('div', {style: {position: 'relative'}}, [backgroundCanvas, cursorCanvas, outputBox]);
    self.h = .5;
    self.s = .5;
    self.v = .5;

    function renderBackground() {
        var rgb, x, y;

        for (x = 0; x < boxWidth; x ++) {
            for (y = 0; y < boxHeight; y ++) {
                // BOX
                rgb = HSVtoRGB(self.h, x/boxWidth, (boxHeight-y)/boxHeight);
                backgroundContext.fillStyle = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
                backgroundContext.fillRect(x, y, 1, 1);

                // SLIDER
                rgb = HSVtoRGB(y/boxHeight, 1, 1);
                backgroundContext.fillStyle = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
                backgroundContext.fillRect(boxWidth+sliderMargin, y, sliderWidth, 1);
            }
        }
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

window.addEventListener('load', function () {
    pickButton = document.getElementById('pick-button');
    thresholdRange = document.getElementById('threshold-range');
    thresholdSpan = document.getElementById('threshold-span');
    clearButton = document.getElementById('clear-button');

    pickButton.addEventListener('mousedown', pickButtonDown);
    document.addEventListener('mouseup', pickButtonUp);
    thresholdRange.addEventListener('input', updateThreshold);

    renderer = new Renderer();

    clearButton.addEventListener('click', renderer.resize);

    loop();

    useWebcam(function (success) {
        if (success) {
            //document.getElementById('message').innerHTML = 'loading webcam...';
        }
    });

    document.getElementById('picker').appendChild(colorPicker.element);
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
