import * as THREE from './node_modules/three/build/three.module.js';
import './node_modules/facefilter/dist/jeelizFaceFilterES6.js';
import {
    OBJLoader
} from './node_modules/three/examples/jsm/loaders/OBJLoader.js';

const labsfilter = (function () {
    let NNCprefix = './node_modules/facefilter/dist/';
    let NNCpath = NNCprefix + 'NNC.json';
    let video;
    let canvasID;
    let objectloader = new OBJLoader();
    let textureloader = new THREE.TextureLoader();
    let w;
    let h;
    let scalefactor = 0.13;
    let filtermodel;
    let renderer;
    let scene;
    let camera;
    let running = false;

    const initThreeObjects = function () {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(30, w / h, 1, 5000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        renderer.setSize(w, h);
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

                canvasID = settings.canvasID
                w = parseFloat(getComputedStyle(settings.video).getPropertyValue('width'));
                h = parseFloat(getComputedStyle(settings.video).getPropertyValue('height'));

                navigator.mediaDevices.getUserMedia({
                        video: true,
                        facingMode: settings.facingMode || 'user'
                    })
                    .then(stream => {
                        settings.video.srcObject = stream;
                        initThreeObjects();
                        if (texturepath == null || modelpath == null) {
                            console.error('Invalid texture path or model path');
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
        if(!running){
            JEEFACEFILTERAPI.init({
                canvasId: canvasID,
                NNCpath: NNCpath,
                callbackReady: function (errCode) {
                    if (errCode) {
                        console.log(errCode);
                    }
                    running = true;
                },
    
                callbackTrack: function (detectState) {
                    if (detectState.detected < 0.8) {
                        filtermodel.scale.set(0, 0, 0);
                        renderer.render(scene, camera);
                    } else {
                        let s = detectState.s;
                        filtermodel.position.x = detectState.x;
                        filtermodel.position.y = detectState.y - 0.2;
    
                        filtermodel.scale.set(s * scalefactor, s * scalefactor, s * scalefactor);
    
                        filtermodel.rotation.x = detectState.rx;
                        filtermodel.rotation.y = detectState.ry;
                        filtermodel.rotation.z = detectState.rz;
    
                        renderer.render(scene, camera);
                    }
                }
            });
        }
        else{
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