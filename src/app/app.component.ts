import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Potree from '../assets/lib/potree-core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  renderer: any;
  camera: any;
  controls: any;
  scene: any;
  cube;any;
  pointcloud:any;

  constructor() {

  }

  ngAfterViewInit() {
    //three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

    var canvas = document.createElement("canvas");
    canvas.width  = document.getElementById("mycanvas-wrapper").offsetWidth;
    canvas.height = document.getElementById("mycanvas-wrapper").offsetHeight;
    document.getElementById("mycanvas-wrapper").appendChild(canvas);

    this.renderer = new THREE.WebGLRenderer(
      {
        canvas: canvas,
        alpha: true,
        logarithmicDepthBuffer: true,
        context: null,
        precision: "highp",
        premultipliedAlpha: true,
        antialias: true,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance"
      });

    //var geometry = new THREE.BoxBufferGeometry(25, 1, 25);
    //var material = new THREE.MeshBasicMaterial({ color: 0x44AA44 });
    //this.cube = new THREE.Mesh(geometry, material);
    //this.cube.position.y = -2;
    //this.scene.add(this.cube);

    this.scene.add(new THREE.AmbientLight(0xffffff));

    this.controls = new OrbitControls(this.camera, canvas);
    this.camera.position.z = 10;

    var raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 1e-2;
    var normalized = new THREE.Vector2();

    canvas.onmousemove = (event) => {
      normalized.set((event.clientX / canvas.width) * 2 - 1, -(event.clientY / canvas.height) * 2 + 1);
      raycaster.setFromCamera(normalized, this.camera);
    }

    canvas.onclick = (event) => {
      var intesects = raycaster.intersectObject(this.scene, true);


      if (intesects.length > 0) {
        var geometry = new THREE.SphereBufferGeometry(0.1, 32, 32);
        var material = new THREE.MeshBasicMaterial({ color: 0xAA4444 });
        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(intesects[0].point);
        this.scene.add(sphere);
      }
    }

    Potree.Global.workerPath = "../assets/lib/potree-core/source";

    //this.loadPointCloud("../assets/lib/potree-core/data/lion_takanawa_ept_laz/ept.json", new THREE.Vector3(-4, -4, 3.0));
    //this.loadPointCloud("../assets/lib/potree-core/data/lion_takanawa_ept_bin/ept.json", new THREE.Vector3(-11, -4, 3.0));
    //this.loadPointCloud("../assets/lib/potree-core/data/lion_takanawa/cloud.js", new THREE.Vector3(0.0, 0.0, 0.0));
    this.loadPointCloud("../assets/lib/potree-core/data/firstFloor/cloud.js", new THREE.Vector3(0.0, 0.0, 0.0));
    //this.loadPointCloud("../assets/lib/potree-core/data/lion_takanawa_las/cloud.js", new THREE.Vector3(3, -3, 0.0));
    //this.loadPointCloud("../assets/lib/potree-core/data/lion_takanawa_laz/cloud.js", new THREE.Vector3(8, -3, 0.0));
    //loadPointCloud("http://arena4d.uksouth.cloudapp.azure.com:8080/4e5059c4-f701-4a8f-8830-59e78a2c0816/BLK360 Sample.vpc");
    //"http://5.9.65.151/mschuetz/potree/resources/pointclouds/faro/skatepark/cloud.js"
    //"http://5.9.65.151/mschuetz/potree/resources/pointclouds/weiss/subseamanifold2/cloud.js"

    this.loop();
    window.dispatchEvent(new Event('resize'));
  }

  @HostListener('window:resize', ['$event'])
  onResize = (event) => {
    var width = document.getElementById("mycanvas-wrapper").offsetWidth;;
    var height = document.getElementById("mycanvas-wrapper").offsetHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  loadPointCloud(url, position) {

    Potree.loadPointCloud(url, "pointcloud", (e) => {
      var points = new Potree.Group();
      //points.material.opacity = 1.0;
      points.material.wireframe = true;
      //points.translateX(-30);
      //points.translateY(-30);
      //points.translateZ(-30);
      this.scene.add(points);

      this.pointcloud = e.pointcloud;

      if (position !== undefined) {
        this.pointcloud.position.copy(position);
      }

      var material = this.pointcloud.material;
      material.size = 1;
      material.pointColorType = Potree.PointColorType.RGB; //RGB | DEPTH | HEIGHT | POINT_INDEX | LOD | CLASSIFICATION
      material.pointSizeType = Potree.PointSizeType.ADAPTIVE; //ADAPTIVE | FIXED
      material.shape = Potree.PointShape.CIRCLE; //CIRCLE | SQUARE

      points.add(this.pointcloud);
    });
  }

  loop = () => {
    //this.cube.rotation.y += 0.01;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop);
  }

  setProjection() {
    this.camera.position.set(20, 0, 0);
			this.camera.rotation.set(0, Math.PI / 2, 0);
      //camera.zoomTo(node, 1);
      //this.fitToScreen();
      this.setCameraMode(0)
  }
  setCameraMode(mode){
		this.scene.cameraMode = mode;

			this.pointcloud.material.useOrthographicCamera = true;
	}


}
