function FireFilter() {
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
        resolution: {
            type: 'v2',
            value: new THREE.Vector2(100, 100)
        }
    };

    self.material = new THREE.ShaderMaterial({
        uniforms:		self.uniforms,
        vertexShader:   BasicVertexShader,
        fragmentShader: FireShader
    });
}
