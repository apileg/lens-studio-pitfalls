//@input Component.Camera orthographicCamera
//@input float radius = 0.07
//@input Component.ScriptComponent[] scriptsWithApi

//@ui {"widget":"group_start", "label": "Internal properties"}
//@input Component.ScreenTransform plate
//@input Component.ScreenTransform dot
//@ui {"widget":"group_end"}

//Positions naming convention:
//
//Joystick - 2D position of the center of an object relative to the bounds of joystick
//(x = -1 means at left edge of joystick, x = 1 means at right edge of joysticl, y = 1 
//means at top and y = -1 at bottom edge of joystick)
//
//Screen - 2D position on screen where (0, 0) is top left corner of the screen and (1, 1) - its bottom right 
//corner
//
//Normal - normalized screen position where (-1, -1) is top left corner of the sceen
//
//World - 3D position in the world (on the scene)

if (!script.orthographicCamera) {
    print('Orthographic Camera is not set');
    return;
}

const self = script.getSceneObject();
const screenTransform = self.getComponent('Component.ScreenTransform');

const orthographicCamera = script.orthographicCamera;

const plate = script.plate;
const dot = script.dot;
const radius = script.radius;

var currentTouchId = null;
var centeringDot = false;

// Enable full screen touches
global.touchSystem.touchBlocking = true;

// Allow double-tap to be passed through to Snapchat to flip the camera.
global.touchSystem.enableTouchBlockingException('TouchTypeDoubleTap', true);
    
script.createEvent("TouchStartEvent").bind(onTouchStart);
script.createEvent("TouchMoveEvent").bind(onTouchMove);
script.createEvent("TouchEndEvent").bind(onTouchEnd);
script.createEvent('UpdateEvent').bind(onUpdate);

callOnJoystickPosChanged(new vec2(0, 0));

function onTouchStart(e) {
    const touchScreenPos = e.getTouchPosition();
    
    if (plate.containsScreenPoint(touchScreenPos)) {  
        currentTouchId = e.getTouchId();    
        centeringDot = false;
        
        moveDot(touchScreenPos);
        callTouchStarted();
    }
}

function onTouchMove(e) {
    if (currentTouchId !== e.getTouchId()) {
        return;
    }
    
    const touchScreenPos = e.getTouchPosition();
    moveDot(touchScreenPos);
}

function onTouchEnd(e) {
    if (currentTouchId !== e.getTouchId()) {
        return;
    }
    
    currentTouchId = null;
    centeringDot = true;
    
    callTouchEnded();
}

function onUpdate() {
    if (centeringDot) {
        moveDotTowardsCenter();
    }
}

function moveDot(touchScreenPos) {
    const plateJoystickPos = plate.anchors.getCenter();
    const plateScreenPos = screenTransform.localPointToScreenPoint(plateJoystickPos);    
    
    const dotScreenPos = plateScreenPos.moveTowards(touchScreenPos, radius);
    const dotJoystickPos = dot.screenPointToParentPoint(dotScreenPos);
    
    dot.anchors.setCenter(dotJoystickPos);
    
    notifyJoystickPosChanged(plateScreenPos, dotScreenPos);
}

function moveDotTowardsCenter() {
    const dotJoystickPos = dot.anchors.getCenter();    
    const plateJoystickPos = plate.anchors.getCenter();
    
    const distance = dotJoystickPos.distance(plateJoystickPos);
    
    if (distance < 0.01) {
        centeringDot = false;
        callOnJoystickPosChanged(new vec2(0, 0));
        return;
    }
    
    const nextDotJoystickPos = vec2.lerp(dotJoystickPos, plateJoystickPos, 0.2);
    dot.anchors.setCenter(nextDotJoystickPos);
    
    const plateScreenPos = screenTransform.localPointToScreenPoint(plateJoystickPos);
    const nextDotScreenPos = screenTransform.localPointToScreenPoint(nextDotJoystickPos);
    
    notifyJoystickPosChanged(plateScreenPos, nextDotScreenPos);
}

function notifyJoystickPosChanged(plateScreenPos, dotScreenPos) {
    const leftX = plateScreenPos.x - radius;
    const rightX = plateScreenPos.x + radius;
    
    const topY = plateScreenPos.y + radius;
    const bottomY = plateScreenPos.y - radius;
    
    const minusOneOnePos = screenToMinusOneOnePos(dotScreenPos, leftX, rightX, topY, bottomY);
    
    callOnJoystickPosChanged(minusOneOnePos);
}

function callOnJoystickPosChanged(joystickPos) {
    callScriptsWithApi('onJoystickPositionChanged', [joystickPos]);
}

function callTouchStarted() {
    callScriptsWithApi('onJoystickTouchStarted', []);
}

function callTouchEnded() {
    callScriptsWithApi('onJoystickTouchEnded', []);
}

function callScriptsWithApi(funcName, args) {
    script.scriptsWithApi.forEach(function(s) {
        if (typeof s.api[funcName] === 'function') {
            s.api[funcName].apply(s.api, args);
        }
    })
}

//Convert X: (leftX, rightX) to (-1, 1)
//Convert Y: (topY, bottomY) to (-1, 1)
function screenToMinusOneOnePos(pos, leftX, rightX, topY, bottomY) {
    //(a, b) to (-1, 1):
    //
    //(a, b) - a = (0, b - a)
    //(0, b - a) / (b - a) = (0, 1)
    //(0, 1) * 2 = (0, 2)
    //(0, 2) - 1 = (-1, 1)
    
    const x = (pos.x - leftX) / (rightX - leftX) * 2 - 1;
    const y = (pos.y - topY) / (bottomY - topY) * 2 - 1;
    
    return new vec2(x, y);
}
