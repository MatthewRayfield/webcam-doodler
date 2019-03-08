function Renderer() {
    var self = this,

        inputTexture,
        inputWidth = 0,
        inputHeight = 0,
        needsUpdating = false,

        container = document.getElementById('video-container'),

        isolateFilter,
        isolateMaterial,
        overlayFilter,
        overlayMaterial,
        fireFilter,
        fireMaterial,
        basicMaterial = new THREE.MeshBasicMaterial({transparent: true});

    isolateFilter = new IsolateFilter();
    isolateMaterial = isolateFilter.material;

    overlayFilter = new OverlayFilter();
    overlayMaterial = overlayFilter.material;

    fireFilter = new FireFilter();
    fireMaterial = fireFilter.material;

    self.overlayFilter = overlayFilter;
    self.isolateFilter = isolateFilter;
    self.fireFilter = fireFilter;
    self.erase = false;

    self.input = null;

    self.width = 800;
    self.height = 600;

    self.tRenderer = new THREE.WebGLRenderer({alpha: true, preserveDrawingBuffer: true});
    //self.tRenderer.setClearColor(new THREE.Color(0xffffff));
    container.appendChild(self.tRenderer.domElement);

    self.camera = new THREE.OrthographicCamera(self.width / - 2, self.width / 2, self.height / 2, self.height / - 2, 1, 1000);
    self.camera.position.z = 300;
    
    self.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1));
    self.mesh.scale.x = self.width;
    self.mesh.scale.y = self.height;

    self.scene = new THREE.Scene();
    self.scene.add(self.mesh);

    self.renderTargetA = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
    self.renderTargetB = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
    self.renderTargetC = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
    self.renderTargetD = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});

    self.resize = function () {
        var pageWidth = wrapperWrapper.offsetWidth,
            pageHeight = wrapperWrapper.offsetHeight;
        /*var pageWidth = window.innerWidth * .9,
            pageHeight = window.innerHeight * .9;*/

        if (!inputWidth || !inputHeight) return;
        container.className = 'show';

        if (inputWidth > inputHeight) {
            self.width = pageWidth;
            self.height = pageWidth * (inputHeight/inputWidth);
        }
        else {
            self.width = pageHeight * (inputWidth/inputHeight);
            self.height = pageHeight;
        }

        if (self.height > pageHeight) {
            self.width = pageHeight * (inputWidth/inputHeight);
            self.height = pageHeight;
        }
        if (self.width > pageWidth) {
            self.width = pageWidth;
            self.height = pageWidth * (inputHeight/inputWidth);
        }

        if (inputWidth > inputHeight) {
            self.width = pageWidth;
            self.height = pageWidth * (inputHeight/inputWidth);
        }
        else {
            self.width = pageHeight * (inputWidth/inputHeight);
            self.height = pageHeight;
        }

        if (self.height > pageHeight) {
            self.width = pageHeight * (inputWidth/inputHeight);
            self.height = pageHeight;
        }
        if (self.width > pageWidth) {
            self.width = pageWidth;
            self.height = pageWidth * (inputHeight/inputWidth);
        }

        self.width = Math.round(self.width);
        self.height = Math.round(self.height);

        self.tRenderer.setSize(self.width, self.height);

        self.camera.left = self.width / - 2;
        self.camera.right = self.width / 2;
        self.camera.top = self.height / 2;
        self.camera.bottom = self.height / - 2;
        self.camera.updateProjectionMatrix();

        self.renderTargetA = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
        self.renderTargetB = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
        self.renderTargetC = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
        self.renderTargetD = new THREE.WebGLRenderTarget(self.width, self.height, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});

        self.mesh.scale.x = self.width;
        self.mesh.scale.y = self.height;

        fireMaterial.uniforms.resolution.value = new THREE.Vector2(self.width, self.height);
    };
    window.addEventListener('resize', self.resize);

    self.useInput = function (input, needsFlip) {
        if (input.tagName == 'VIDEO') {
            if (input.readyState != input.HAVE_ENOUGH_DATA) {
                setTimeout(function () {self.useInput(input, needsFlip);}, 0);
                return;
            }

            needsUpdating = true;
        }
        else {
            needsUpdating = false;
        }

        if (self.input && self.input.tagName == 'VIDEO') {
            self.input.pause();
            self.input.src = '';
            self.input.load();
        }

        self.input = input;

        inputTexture = new THREE.Texture(input);
        inputTexture.minFilter = THREE.LinearFilter;
        inputTexture.magFilter = THREE.LinearFilter;
        inputTexture.needsUpdate = true;

        inputWidth = input.videoWidth || input.naturalWidth || input.width;
        inputHeight = input.videoHeight || input.naturalHeight || input.height;

        self.resize();
    };

    var flip = 0;
    self.render = function render() {
        var oldRT, newRT;

        if (flip) {
            oldRT = self.renderTargetB;
            newRT = self.renderTargetC;
        }
        else {
            oldRT = self.renderTargetC;
            newRT = self.renderTargetB;
        }

        if (!inputTexture) return;

        if (needsUpdating) inputTexture.needsUpdate = true;

        isolateFilter.uniforms.inputImageTexture.value = inputTexture;
        self.mesh.material = isolateMaterial;
        self.tRenderer.render(self.scene, self.camera, self.renderTargetA);

        overlayFilter.uniforms.inputImageTexture.value = oldRT.texture;
        overlayFilter.uniforms.overlayTexture.value = self.renderTargetA.texture;
        overlayFilter.uniforms.flipX.value = false;
        overlayFilter.uniforms.erase.value = self.erase;
        self.mesh.material = overlayMaterial;
        self.tRenderer.render(self.scene, self.camera, newRT);

        overlayFilter.uniforms.inputImageTexture.value = inputTexture;
        overlayFilter.uniforms.overlayTexture.value = newRT.texture;
        overlayFilter.uniforms.flipX.value = true;
        overlayFilter.uniforms.erase.value = false;
        self.mesh.material = overlayMaterial;
        self.tRenderer.render(self.scene, self.camera);

        flip = !flip;
    };

    self.renderForColorPick = function renderForColorPick() {
        if (!inputTexture) return;
        if (needsUpdating) inputTexture.needsUpdate = true;

        overlayFilter.uniforms.inputImageTexture.value = inputTexture;
        overlayFilter.uniforms.overlayTexture.value = null;
        overlayFilter.uniforms.flipX.value = true;
        overlayFilter.uniforms.erase.value = false;
        self.mesh.material = overlayMaterial;
        self.tRenderer.render(self.scene, self.camera, self.renderTargetD);
        self.tRenderer.render(self.scene, self.camera);
    };
}
