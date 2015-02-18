import svg from './svg';

export class Pane {
    constructor(target, container = document.body) {
        this.target = target;
        this.element = svg.createElement('svg');
        this.marks = [];

        // Match the coordinates of the target element
        this.element.style.position = 'absolute';
        // Disable pointer events
        this.element.setAttribute('pointer-events', 'none');

        // Set up mouse event proxying between the target element and the marks
        proxyMouseEvents(this.target, this.marks);

        container.appendChild(this.element);

        this.render();
    }

    addMark(mark) {
        var g = svg.createElement('g');
        this.element.appendChild(g);
        mark.bind(g);

        this.marks.push(mark);

        mark.render();
        return mark;
    }

    removeMark(mark) {
        var idx = this.marks.indexOf(mark);
        if (idx === -1) {
            return;
        }
        var el = mark.unbind();
        this.element.removeChild(el);
        this.marks.splice(idx, 1);
    }

    render() {
        setCoords(this.element, coords(this.target));
        for (var m of this.marks) {
            m.render();
        }
    }
}


export class Mark {
    constructor() {
        this.element = null;
    }

    bind(element) {
        this.element = element;
    }

    unbind() {
        var el = this.element;
        this.element = null;
        return el;
    }

    render() {}

    getBoundingClientRect() {
        return this.element.getBoundingClientRect();
    }

    getClientRects() {
        var rects = [];
        var el = this.element.firstChild;
        while (el) {
            rects.push(el.getBoundingClientRect());
            el = el.nextSibling;
        }
        return rects;
    }
}


export class Highlight extends Mark {
    constructor(range) {
        super();
        this.range = range;
    }

    bind(element) {
        super.bind(element);
        this.element.setAttribute('fill', 'rgb(255, 10, 10)');
        this.element.setAttribute('fill-opacity', '0.3');
    }

    render() {
        // Empty element
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }

        var rects = this.range.getClientRects();
        var offset = this.element.getBoundingClientRect();

        for (var i = 0, len = rects.length; i < len; i++) {
            var r = rects[i];
            var el = svg.createElement('rect');
            el.setAttribute('x', r.left - offset.left);
            el.setAttribute('y', r.top - offset.top);
            el.setAttribute('height', r.height);
            el.setAttribute('width', r.width);
            this.element.appendChild(el);
        }
    }
}


function proxyMouseEvents(target, marks) {
    function dispatch(e) {
        // We walk through the tracked marks in reverse order so that events
        // are sent to the most recently added (and hence tracked) marks first.
        //
        // This is the least surprising behaviour as it simulates the way the
        // browser would work if later marks were drawn "on top of" earlier
        // ones.
        for (var i = marks.length - 1; i >= 0; i--) {
            var m = marks[i];

            if (!markContains(m, e.clientX, e.clientY)) {
                continue;
            }

            // The event targets this mark, so dispatch a cloned event:
            var clone = cloneMouseEvent(e);
            m.element.dispatchEvent(clone);
            // We only dispatch the cloned event to the first matching mark.
            break;
        }
    }

    for (var ev of ['mouseup', 'mousedown', 'click']) {
        target.addEventListener(ev, (e) => dispatch(e), false);
    }
}


function coords(el) {
    var rect = el.getBoundingClientRect();
    return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft,
        height: rect.height,
        width: rect.width
    };
}


function setCoords(el, coords) {
    el.style.top = `${coords.top}px`;
    el.style.left = `${coords.left}px`;
    el.style.height = `${coords.height}px`;
    el.style.width = `${coords.width}px`;
}

function cloneMouseEvent(e) {
    var clone = new MouseEvent(e.type, {
        // If we allow this event to bubble, then the rest of the document will
        // see duplicate events.
        bubbles: false,
        // All other specified properties are copied from the event being
        // cloned.
        screenX: e.screenX,
        screenY: e.screenY,
        clientX: e.clientX,
        clientY: e.clientY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        button: e.button,
        buttons: e.buttons,
        relatedTarget: e.relatedTarget,
        region: e.region,
        detail: e.detail,
        view: e.view,
        cancelable: e.cancelable
    });
    return clone;
}


function markContains(m, x, y) {
    // Check overall bounding box first
    var rect = m.getBoundingClientRect();
    if (!rectContains(rect, x, y)) {
        return false;
    }

    // Then continue to check each child rect
    var rects = m.getClientRects();
    for (var i = 0, len = rects.length; i < len; i++) {
        if (rectContains(rects[i], x, y)) {
            return true;
        }
    }
    return false;
}


function rectContains(r, x, y) {
    var bottom = r.top + r.height;
    var right = r.left + r.width;
    return (r.top <= y && r.left <= x && bottom > y && right > x);
}
