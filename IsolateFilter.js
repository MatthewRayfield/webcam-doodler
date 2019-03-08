function IsolateFilter() {
    var self = this;

    self.uniforms = {
        resolution: {
            type: "v2",
            value: new THREE.Vector2(100, 100)
        },
        targetColor: {
            type: "v3",
            value: new THREE.Vector3(1, .996, 1)
        },
        threshold: {
            type: "f",
            value: .162,
        },
        inputImageTexture: {
            type: 't'
        },
        outputColor: {
            type: "v3",
            value: new THREE.Vector3(0, 1, 1)
        },
    };

    self.material = new THREE.ShaderMaterial({
        uniforms:		self.uniforms,
        vertexShader:   BasicVertexShader,
        fragmentShader: IsolateShader
    });
}
