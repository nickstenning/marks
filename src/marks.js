import svg from './svg';
import events from './events';

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
        events.proxyMouse(this.target, this.marks);

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

    dispatchEvent(e) {
        if (!this.element) return;
        this.element.dispatchEvent(e);
    }

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
        // this.element.setAttribute('fill', 'yellow');
        // this.element.setAttribute('fill-opacity', '0.3');
        this.element.classList.add("annotator-hl");
    }

    render() {
        // Empty element
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }

        var docFrag = this.element.ownerDocument.createDocumentFragment();
        var rects = Array.from(this.range.getClientRects());
        var offset = this.element.getBoundingClientRect();

        // De-duplicate the boxes
        var contains = function (rect1, rect2) {
          return (
            (rect2.right <= rect1.right) &&
            (rect2.left >= rect1.left) &&
            (rect2.top >= rect1.top) &&
            (rect2.bottom <= rect1.bottom)
          );
        };

        var filtered = rects.filter((box) => {
          for (var i = 0; i < rects.length; i++) {
            if (rects[i] === box) {
              return true;
            }
            let contained = contains(rects[i], box);
            if (contained) {
              return false;
            }
          }
          return true;
        })

        for (var i = 0, len = filtered.length; i < len; i++) {
            var r = filtered[i];
            var el = svg.createElement('rect');
            el.setAttribute('x', r.left - offset.left);
            el.setAttribute('y', r.top - offset.top);
            el.setAttribute('height', r.height);
            el.setAttribute('width', r.width);
            docFrag.appendChild(el);
        }

        this.element.appendChild(docFrag);

    }
}


function coords(el) {
    var rect = el.getBoundingClientRect();

    return {
        top: rect.top + el.ownerDocument.body.scrollTop,
        left: rect.left + el.ownerDocument.body.scrollLeft,
        height: rect.height + el.scrollHeight,
        width: rect.width + el.scrollWidth
    };
}


function setCoords(el, coords) {
    el.style.top = `${coords.top}px`;
    el.style.left = `${coords.left}px`;
    el.style.height = `${coords.height}px`;
    el.style.width = `${coords.width}px`;
}
