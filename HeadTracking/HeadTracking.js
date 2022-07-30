//Usage:
//
//Add coords to track to the `coordsToTrack` input, for example:
//'forward.y'
//'up.x'

//Then create script with the following api:
//script.api.onHeadCoordsChanged = function(changes, current) {
//    const forwardYChange = changes['forward.y'];
//    const upXChange = changes['up.x'];
//    const currentForwardY = current['forward.y'];
//}
//And add it to the `scriptsWithApi` input

//@input Component.Head head
//@input string[] coordsToTrack
//@input Component.ScriptComponent[] scriptsWithApi

//@input float updatesPerSecond = -1
//@ui { "widget": "label", "label": "If set to -1 updates happen as fast as possible" }

if (script.updatesPerSecond === 0) {
    return;
}

const headTransform = (script.head === undefined)
     ? script.getTransform()
     : script.head.getTransform();

var oldCoords;

const secondsPerUpdate = (script.updatesPerSecond === -1)
     ? 0
     : 1 / script.updatesPerSecond;

var elapsedSeconds = 0;

script.createEvent('UpdateEvent').bind(function(e) {
    elapsedSeconds += e.getDeltaTime();

    if (elapsedSeconds < secondsPerUpdate) {
        return;
    }

    if (oldCoords === undefined) {
        oldCoords = getAllCoords();
        return;
    }

    const currentCoords = getAllCoords();
    const changes = {};

    script.coordsToTrack.forEach(function(c) {
        changes[c] = currentCoords[c] - oldCoords[c];
    });

    script.scriptsWithApi.forEach(function(s) {
        s.api.onHeadCoordsChanged(changes, currentCoords);
    });

    oldCoords = currentCoords;
    elapsedSeconds = 0;
});

function getAllCoords() {
    const result = {};

    script.coordsToTrack.forEach(function(c) {
        result[c] = get(headTransform, c);
    });

    return result;
}

function get(obj, propertyPath) {
    const props = propertyPath.split('.');
    var result = obj;

    props.forEach(function(p) {
       result = result[p];
    });

    return result;
}
