//@input SceneObject sceneObject
//@input string tweenName
//@input bool playAutomatically
//@input bool playAllAtOnce = false
//@input string[] tweenNames

const obj = script.sceneObject || script.getSceneObject();

script.api.tweenName = script.tweenName;

script.api.setupTween = function() {
    var onCompleteCallback = null;
    
    //Mock the Tween.js `Tween` object to support nested `TweenChain` objects
    return {
        onComplete(callback) {
            onCompleteCallback = callback;
        },
        
        start() {
            if (script.playAllAtOnce) {
                playAll(onCompleteCallback);
            }
            else {
                playSequentially(onCompleteCallback);
            }
        }
    };
};

if (script.playAutomatically) {
    const tweenObject = script.api.setupTween();
    tweenObject.start();
}


function playAll(onComplete) {
    var tweensInProgress = 0;
    
    script.tweenNames.forEach(function(name) {        
        const tween = global.tweenManager.findTween(obj, name);
        
        //setupTween() returns either a single tween or an array of tweens
        var result = tween.api.setupTween();
        const tweenArray = wrapInArray(result);
        
        tweenArray.forEach(function(t) {
            t.onComplete(onTweenComplete);
            
            ++tweensInProgress;
            t.start();
        });
    });

    function onTweenComplete() {
        --tweensInProgress;

        if (tweensInProgress === 0 && onComplete) {
            onComplete();
        }
    }
}

function playSequentially(onComplete) {
    const tweens = [];
    
    script.tweenNames.forEach(function(name) {        
        const t = global.tweenManager.findTween(obj, name);
        tweens.push(t);
    });
    
    if (tweens.length === 0) {
        return;
    }
        
    runIthTween(0);
    
    function runIthTween(index) {
        if (index >= tweens.length) {
            if (onComplete) {
                onComplete();
            }
            
            return;
        }

        const t = tweens[index];        
        const tweenArray = wrapInArray( t.api.setupTween() );
        
        const callback = function() {
            runIthTween(index + 1);
        };
        
        tweenArray.forEach(function(i) {
            i.onComplete(callback);
            i.start();
        });
    }
}

//If `value` is an array, return it. Otherwise, wraps `value` into array
function wrapInArray(value) {
    return (value instanceof Array) ? value : [value];
}
