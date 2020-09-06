var container = document.getElementById("content");
var width = container.offsetWidth;
var height = screen.height * .4;
var gl = GL.create({
    width: width, height: height
});
function resizeCanvas() {
    width = container.offsetWidth;
    height = screen.height * .4;
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
    mat4.perspective(proj, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, 0.1, 1000);
}
window.addEventListener("resize", resizeCanvas);
container.appendChild(gl.canvas);
gl.animate();
var mesh = GL.Mesh.fromURL("models/Walkman.obj");

var proj = mat4.create();
var view = mat4.create();
var model = mat4.create();
var mvp = mat4.create();
var temp = mat4.create();

var camPos = [0, .3, .7];
var camOrbitPos = [0, 0, 0];

// Set the camera position
mat4.perspective(proj, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, 0.1, 1000);

// Basic phong shader
var shader = new Shader('\
	precision highp float;\
	attribute vec3 a_vertex;\
	attribute vec3 a_normal;\
	varying vec3 v_normal;\
	uniform mat4 u_mvp;\
	uniform mat4 u_model;\
	void main() {\
		v_normal = (u_model * vec4(a_normal,0.0)).xyz;\
		gl_Position = u_mvp * vec4(a_vertex,1.0);\
	}\
	', '\
	precision highp float;\
	varying vec3 v_normal;\
	uniform vec3 u_lightvector;\
	uniform vec4 u_camera_position;\
	uniform vec4 u_color;\
	void main() {\
	  vec3 N = normalize(v_normal);\
	  //fake half light\n\
	  float NdotL = dot(u_lightvector,N) * 0.5 + 0.5;\
	  NdotL *= NdotL;\
	  gl_FragColor = u_color * max(0.0, NdotL);\
	}\
');

gl.clearColor(1, 1, 1, 1);
gl.enable(gl.DEPTH_TEST);

// Rendering loop
gl.ondraw = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.lookAt(view, camPos, camOrbitPos, [0, 1, 0]);
    // Create modelview and projection matrices
    mat4.multiply(temp, view, model);
    mat4.multiply(mvp, proj, temp);

    // Render mesh using the shader
    if (mesh)
        shader.uniforms({ // Set uniforms
            u_color: [1, 1, 1, 1],
            u_lightvector: vec3.normalize(vec3.create(), [1, 1, 1]),
            u_camera_position: camPos,
            u_model: model,
            u_mvp: mvp
        }).draw(mesh); // Draw mesh
};

gl.onupdate = function (dt) {
    mat4.rotateY(model, model, dt * .2);
};