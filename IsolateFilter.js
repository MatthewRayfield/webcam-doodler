function IsolateFilter() {
    var self = this;

    self.uniforms = {
        resolution: {
            type: "v2",
            value: new THREE.Vector2(100, 100)
        },
        targetColor: {
            type: "v3",
            value: new THREE.Vector3(214/255, 59/255, 102/255)
        },
        threshold: {
            type: "f",
            value: .162,
        },
        inputImageTexture: {
            type: 't'
        },
    };

    self.material = new THREE.ShaderMaterial({
        uniforms:		self.uniforms,
        vertexShader:   BasicVertexShader,
        fragmentShader: IsolateShader
    });
}
