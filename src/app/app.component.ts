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
  cube; any;
  pointcloud: any;
  selectedProjection = 'P';
  selectedView = '';

  constructor() {

  }

  ngAfterViewInit() {
    this.init(this.selectedProjection);
  }

  init(projection = "P") {
    var w = document.getElementById("mycanvas-wrapper").offsetWidth
    var h = document.getElementById("mycanvas-wrapper").offsetHeight
    var viewSize = h;
    var aspectRatio = w / h;

    var viewport = {
      viewSize: viewSize,
      aspectRatio: aspectRatio,
      left: (-aspectRatio * viewSize) / 2,
      right: (aspectRatio * viewSize) / 2,
      top: viewSize / 2,
      bottom: -viewSize / 2,
      near: -100,
      far: 1000
    }
    //three.js
    this.scene = new THREE.Scene();
    if (projection === "P") {
      this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
    } else {
      this.camera = new THREE.OrthographicCamera(
        viewport.left,
        viewport.right,
        viewport.top,
        viewport.bottom
      );
      this.camera.zoom = 9;
      this.camera.updateProjectionMatrix();
    }

    document.getElementById("mycanvas-wrapper").innerHTML = "";
    var canvas = document.createElement("canvas");
    canvas.width = document.getElementById("mycanvas-wrapper").offsetWidth;
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

    this.scene.add(new THREE.AmbientLight(0xffffff));

    this.controls = new OrbitControls(this.camera, canvas);
    this.camera.position.z = 70;

    var raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 1e-2;
    var normalized = new THREE.Vector2();

    canvas.onmousemove = (event) => {
      normalized.set((event.clientX / canvas.width) * 2 - 1, -(event.clientY / canvas.height) * 2 + 1);
      raycaster.setFromCamera(normalized, this.camera);
    }

    canvas.onclick = (evt) => {
    
      evt.preventDefault();
      var mousePosition = new THREE.Vector2();

      mousePosition.x = ((evt.clientX - canvas.offsetLeft) / canvas.width) * 2 - 1;
      mousePosition.y = -((evt.clientY - canvas.offsetTop) / canvas.height) * 2 + 1;

      raycaster.setFromCamera(mousePosition, this.camera);
      var intersects = raycaster.intersectObjects(this.scene, true);
      console.log(intersects);

      if (intersects.length > 0)
        return intersects[0].point;
    }
    var geometry = new THREE.SphereBufferGeometry(0.1, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0xAA4444 });
    var sphere = new THREE.Mesh(geometry, material);
    //sphere.position.copy(intesects[0].point);
    this.scene.add(sphere);

    Potree.Global.workerPath = "../assets/lib/potree-core/source";

    this.loadPointCloud("../assets/lib/potree-core/data/firstFloor/cloud.js", new THREE.Vector3(0.0, 0.0, 0.0));

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
      points.name = "Potree_Points";
      points.material.wireframe = true;


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
      new THREE.Box3().setFromObject(points).getCenter(points.position).multiplyScalar(- 1);

      this.scene.add(points);
    });
  }

  loop = () => {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop);
  }

  changeProjection(projection) {
    this.selectedProjection = projection;
    this.init(projection);
  }

  setProjectionView(view) {
    this.selectedView = view;
    switch (view) {
      case 'top':
        this.topView(this.camera);
        break;
      case 'bottom':
        this.bottomView(this.camera);
        break;
      case 'left':
        this.leftView(this.camera);
        break;
      case 'right':
        this.rightView(this.camera);
        break;
      case 'front':
        this.frontView(this.camera);
        break;
      case 'back':
        this.backView(this.camera);
        break;
      default:
        break;
    }
  }

  topView(camera) {
    camera.position.set(0, 70, 0);
    camera.rotation.set(-Math.PI / 2, 0, 0);
    //camera.zoomTo(node, 1);
  }
  bottomView(camera) {
    camera.position.set(0, -70, 0);
    camera.rotation.set(Math.PI / 2, 0, 0);
    //camera.zoomTo(node, 1);
  }

  frontView(camera) {
    camera.position.set(0, 0, 70);
    camera.rotation.set(0, 0, 0);
    //camera.zoomTo(node, 1);
  }

  backView(camera) {
    camera.position.set(0, 0, -70);
    camera.rotation.set(0, 0, 0);
    //camera.zoomTo(node, 1);
  }

  leftView(camera) {
    camera.position.set(-70, 0, 0);
    camera.rotation.set(0, -Math.PI / 2, 0);
    //camera.zoomTo(node, 1);
  }

  rightView(camera) {
    camera.position.set(70, 0, 0);
    camera.rotation.set(0, Math.PI / 2, 0);
    //camera.zoomTo(node, 1);
  }

}
