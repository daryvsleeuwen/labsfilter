import * as THREE from '../three/build/three.module.js';
import '../facefilter/dist/jeelizFaceFilterES6.js';
import {
    OBJLoader
} from '../three/examples/jsm/loaders/OBJLoader.js';

const labsfilter = (function () {
    let NNCprefix = 'node_modules/facefilter/dist/';
    let NNCpath = NNCprefix + 'NNC.json';
    let video;
    let canvas;
    let objectloader = new OBJLoader();
    let textureloader = new THREE.TextureLoader();
    let width;
    let height;
    let rect;
    let scalefactor = 0.185;
    let filtermodel;
    let renderer;
    let scene;
    let camera;
    let running = false;

    const initThreeObjects = function () {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(30, width / height, 1, 5000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        renderer.setSize(width, height);
        document.body.appendChild(renderer.domElement);
        renderer.setClearColor(0x000000, 0);
    }

    const init = function (settings, texturepath, modelpath) {
        if (settings) {
            if (settings.video != null) {
                video = settings.video;

                if (settings.NNCpath != null) {
                    NNCpath = NNCprefix + settings.NNCpath;
                }

                width = parseFloat(getComputedStyle(settings.video).getPropertyValue('width'));
                height = parseFloat(getComputedStyle(settings.video).getPropertyValue('height'));
                canvas = settings.canvas;
                rect = video.getBoundingClientRect();

                navigator.mediaDevices.getUserMedia({
                        video: true,
                        facingMode: settings.facingMode || 'user'
                    })
                    .then(stream => {
                        settings.video.srcObject = stream;
                        initThreeObjects();
                        if (texturepath == null || modelpath == null) {
                            console.error('There was no texturepath or modelpath include');
                        } else {
                            setFilterModel(texturepath, modelpath);
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }

        } else {
            console.error("No valid settings were passed");
        }
    }

    const start = function () {
        if (!running) {
            JEEFACEFILTERAPI.init({
                canvasId: canvas.id,
                NNCpath: NNCpath,
                callbackReady: function (errCode, canvasElement) {
                    if (errCode) {
                        console.log(errCode);
                    }
                    canvas.parentNode.removeChild(canvas);
                    canvas = document.body.lastChild;
                    canvas.id = canvasElement.canvasElement.id;
                    canvas.style.left = rect.left + 'px';
                    canvas.style.top = rect.top + 'px';

                    window.addEventListener('resize', () => {
                        rect = video.getBoundingClientRect();
                        canvas.style.left = rect.left + 'px';
                        canvas.style.top = rect.top + 'px';
                    });
                    running = true;
                },

                callbackTrack: function (detectState) {
                    if (detectState.detected < 0.9) {
                        filtermodel.scale.set(0, 0, 0);
                        renderer.render(scene, camera);
                    } else {
                        let s = detectState.s;
                        filtermodel.position.x = detectState.x;
                        filtermodel.position.y = detectState.y - 0.4;

                        filtermodel.scale.set(s * scalefactor, s * scalefactor, s * scalefactor);

                        filtermodel.rotation.x = detectState.rx;
                        filtermodel.rotation.y = detectState.ry;
                        filtermodel.rotation.z = detectState.rz;

                        renderer.render(scene, camera);
                    }
                }
            });
        } else {
            console.log('The face detector is already running');
        }
    }

    const stop = function () {
        JEEFACEFILTERAPI.destroy();
        filtermodel.scale.set(0, 0, 0);
        renderer.render(scene, camera);
        running = false;
    }

    const setFilterModel = function (texturepath, modelpath) {
        textureloader.load(texturepath, (texture) => {
            const material = new THREE.MeshBasicMaterial({
                map: texture
            });
            objectloader.load(modelpath, function (object) {
                object.children.forEach(mesh => {
                    mesh.material = material;
                });
                if (filtermodel != null) {
                    scene.remove.apply(scene, scene.children);
                }
                scene.add(object);
                filtermodel = object;
            });
        });
    }

    return {
        init: init,
        start: start,
        stop: stop,
        setFilterModel: setFilterModel
    }
})();

export default labsfilter;
