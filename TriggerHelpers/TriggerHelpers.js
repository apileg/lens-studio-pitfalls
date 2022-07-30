// -----JS CODE-----
//NOTE:
//To this scipt to work you need to:
// - Put *the custom* 'Behavior' script on the very top of Objects hierarchy. 
//  You can leave that script to work 'On Awake'

// - Put this script on top of the Objects hierarchy, AFTER behavior. Bind
//   this script to 'On Start', NOT 'On Awake'

global.send = function(triggerName) {
    global.behaviorSystem.sendCustomTrigger(triggerName);
};

global.subscribe = function(triggerName, handler) {
    global.behaviorSystem.addCustomTriggerResponse(triggerName, handler);
};

global.unsubscribe = function(triggerName, handler) {
    global.behaviorSystem.removeCustomTriggerResponse(triggerName, handler);
};

global.subscribeOnce = function(triggerName, handler) {
    var callback;

    callback = function() {
        handler();
        global.unsubscribe(triggerName, callback);
    };

    global.subscribe(triggerName, callback);
};

global.subscribeFirst = function(triggers, handler) {
    var unsubscribers = [];

    var unsubscribeFromAll = function() {
        unsubscribers.forEach(function(u) {
            u();
        });
    };

    triggers.forEach(function(triggerName) {
        var callback = function() {
            handler(triggerName);
            unsubscribeFromAll();
        };

        global.subscribe(triggerName, callback);

        unsubscribers.push(function() {
            global.unsubscribe(triggerName, callback);
        });
    });
};
