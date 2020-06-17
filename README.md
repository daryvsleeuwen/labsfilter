# Labsfilter

Labsfilter is a module to easily and quickly render 3D filters on your face with your webcam in real-time.

## Installation

```npm i labsfilter```

## Import

```javascript
import labsfilter from './node_modules/labsfilter/index.js'
```

## Functions

`labsfilter.init(<Object> settings, <String> texturepath, <String> modelpath);`

Inits everything to start the filter applying later
The texturepath and modelpath are optional but note that the `labsfilter.start()` function won't work before you specify the two path's with either the `labsfilter.init()` or `labsfilter.setFilterModel()` function\
the settings object can contains the following items
* `video: videoElement //HTML video element for webcam usage` **Required**
* `canvas: canvasElement //HTML canvas element for filter applying` **Required**
* `NCCpath: path //Path to the neural network` **Optional** 'NNC.json' by default
* `facingMode: 'user' //Defines which camera will be used` **Optional** 'user' by default

`labsfilter.start();`
Starts the face detector and filter applying.

`labsfilter.setFilterModel(<String> texturepath, <String> modelpath);`
Sets or updates the 3D filter based on the given texture and 3D model. The texturepath should always be and image (.png, .jpg etc) and the modalpath should always be an .obj file

`labsfilter.stop();`
Completely stops the face detector ands removes the 3D filter

## Neural networks

Available neural networks for the face detector:
* `NNC.json`
* `NNCwideAngles.json`
* `NNClight.json`
* `NNCveryLight.json`
* `NNCviewTop.json`
* `NNCdeprecated.json`
* `NNCdeprecated.json`
* `NNCIntel1536.json`
* `NNCNNC4Expr0.json`

## Sample setup

```javascript
import labsfilter from './node_modules/labsfilter/index.js'
let webcam = document.querySelector('#webcam'); //HTML video element
let canvas = document.querySelector('canvas'); //HTML canvas element

let texture = 'models/tiger/tiger.png'; //Path to the texture for the model (.png, .jpg etc.)
let model = 'models/tiger/tiger.obj'; //Path to the 3D model (must be .obj file)

let settings = {video: webcam, canvas: canvas, facingMode: 'user'};

labsfilter.init(settings, texture, model); //Initializes everything
labsfilter.start(); //Starts the face detector and 3D filter applying.
```

## Demo
[Live demo](https://i410773.hera.fhict.nl/filter-demo/) | [Source code](https://github.com/daryvsleeuwen/Labsfilter-demo)

## License
[ISC](https://choosealicense.com/licenses/isc/)
