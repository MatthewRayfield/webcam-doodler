function OverlayFilter() {
    var self = this;

    self.uniforms = {
        inputImageTexture: {
            type: 't'
        },
        overlayTexture: {
            type: 't'
        },
        flipX: {
            type: 'b'
        },
        erase: {
            type: 'b'
        }
    };

    self.material = new THREE.ShaderMaterial({
        uniforms:		self.uniforms,
        vertexShader:   BasicVertexShader,
        fragmentShader: OverlayShader
    });
}
