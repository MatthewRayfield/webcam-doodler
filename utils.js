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
