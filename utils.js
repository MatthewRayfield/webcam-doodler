function extend(target, source) {
    var key;

    for (key in source) {

        if (typeof target[key] == 'object' && typeof source[key] == 'object') {
            extend(target[key], source[key]);
        }
        else {
            target[key] = source[key];
        }
    }

    return target;
}

function createElement(tagName, properties, children) {
    var element = document.createElement(tagName),
        key;

    extend(element, properties);

    if (children) {
        children.forEach(function (child) {
            element.appendChild(child);
        });
    }

    return element;
}

// modified from original at https://stackoverflow.com/questions/1517924/javascript-mapping-touch-events-to-mouse-events
function touchRedirect(event) {
    var touches = event.changedTouches,
        first = touches[0],
        type = "";

    switch(event.type) {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    var simulatedEvent = new MouseEvent(
        type,
        {
            bubbles: true,
            cancelable: true,
            view: window,
            detail: 1,
            screenX: first.screenX,
            screenY: first.screenY,
            clientX: first.clientX,
            clientY: first.clientY,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            button: 0,
            buttons: 1,
            relatedTarget: null
        }
    );

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function mouseOrTouch(type) {
    if ('ontouchstart' in document.documentElement) {
        if (type == 'down') {
            return 'touchstart';
        }
        else if (type == 'up') {
            return 'touchend';
        }
        else if (type == 'move') {
            return 'touchmove';
        }
    }
    else {
        if (type == 'down') {
            return 'mousedown';
        }
        else if (type == 'up') {
            return 'mouseup';
        }
        else if (type == 'move') {
            return 'mousemove';
        }
    }
}
