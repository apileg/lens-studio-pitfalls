// -----JS CODE-----
//@input Component.ScriptComponent[] scriptsWithApi

const screenTransform = script.getSceneObject()
    .getComponent('Component.ScreenTransform');

var currentTouchId = null;

script.createEvent('TouchStartEvent').bind(function(e) {
    const touchScreenPos = e.getTouchPosition();
    
    if (screenTransform.containsScreenPoint(touchScreenPos)) {
        currentTouchId = e.getTouchId();
        callTouchStarted();
    }
});

script.createEvent('TouchEndEvent').bind(function(e) {
    if (currentTouchId !== e.getTouchId()) {
        return;
    }
    
    currentTouchId = null;
    callTouchEnded();
});

function callTouchStarted() {
    callScriptsWithApi('onButtonTouchStarted', []);
}

function callTouchEnded() {
    callScriptsWithApi('onButtonTouchEnded', []);
}

function callScriptsWithApi(funcName, args) {
    script.scriptsWithApi.forEach(function(s) {
        if (typeof s.api[funcName] === 'function') {
            s.api[funcName].apply(s.api, args);
        }
    })
}