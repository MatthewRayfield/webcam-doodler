var renderer,

    audioContext = new (window.AudioContext || window.webkitAudioContext)(),
    streamDestination,
    sourceNode,
    audioTrack;

var pickButton, thresholdRange, thresholdSpan, clearButton;

var BasicVertexShader = [
        "varying vec2 textureCoordinate;",

        "void main() {",
            "textureCoordinate = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n");

function loop() {
    renderer.render();

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

window.addEventListener('load', function () {
    pickButton = document.getElementById('pick-button');
    thresholdRange = document.getElementById('threshold-range');
    thresholdSpan = document.getElementById('threshold-span');
    clearButton = document.getElementById('clear-button');

    pickButton.addEventListener('click', pickColor);
    thresholdRange.addEventListener('input', updateThreshold);

    renderer = new Renderer();

    clearButton.addEventListener('click', renderer.resize);

    loop();

    useWebcam(function (success) {
        if (success) {
            //document.getElementById('message').innerHTML = 'loading webcam...';
        }
    });
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
                audioTracks = stream.getAudioTracks(),
                newStream;

            if (videoTracks && videoTracks.length) {
                if (callback) callback(true);

                newStream = new MediaStream(stream.getVideoTracks()),
                cleanupAudio();

                //video.src = window.URL.createObjectURL(newStream);
                video.srcObject = newStream;
                video.play();

                if (audioTracks && audioTracks.length) {
                    audioTrack = audioTracks[0];
                }

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

function cleanupAudio() {
    if (sourceNode) {
        sourceNode.disconnect();
    }

    sourceNode = null;
    audioTrack = null;
}
