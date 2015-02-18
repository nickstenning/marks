import events from '../src/events';

describe('proxyMouse', function () {
    var target;
    var tracked;

    beforeEach(function () {
        target = document.createElement('div');
        document.body.appendChild(target);

        tracked = [];
        events.proxyMouse(target, tracked);
    });

    afterEach(function () {
        document.body.removeChild(target);
    });

    describe('when the target element is clicked', function () {
        beforeEach(function () {
            // [ ]
            tracked.push(fakeTarget({left: 0, top: 0, width: 10, height: 10}));
            //
            //    [ ]
            tracked.push(fakeTarget({left: 10, top: 10, width: 10, height: 10}));
            //          [       ]
            // [       ]
            tracked.push(fakeTarget({left: 30, top: 0, width: 30, height: 10},
                                    {left: 0, top: 10, width: 30, height: 10}));
        });

        it('dispatches events to targets under the mouse', function (done) {
            syn.click(target, {clientX: 5, clientY: 5}, function () {
                assert.called(tracked[0].dispatchEvent);
                done();
            });
        });

        it('dispatches events to targets under the mouse (multirect)', function (done) {
            syn.click(target, {clientX: 5, clientY: 15}, function () {
                assert.called(tracked[2].dispatchEvent);
                done();
            });
        });

        it('does not dispatch events to targets not under the mouse', function (done) {
            syn.click(target, {clientX: 5, clientY: 5}, function () {
                refute.called(tracked[1].dispatchEvent);
                done();
            });
        });

        it('dispatches events to the last matching tracked item', function (done) {
            syn.click(target, {clientX: 15, clientY: 15}, function () {
                assert.called(tracked[2].dispatchEvent);
                refute.called(tracked[1].dispatchEvent);
                done();
            });
        });

        it('dispatches non-bubbling events', function (done) {
            var callArgs = tracked[0].dispatchEvent.args;
            syn.click(target, {clientX: 5, clientY: 5}, function () {
                var evt = callArgs[0][0];
                assert.isFalse(evt.bubbles);
                done();
            });
        });

        it('preserves event ordering', function (done) {
            var callArgs = tracked[0].dispatchEvent.args;
            syn.click(target, {clientX: 5, clientY: 5}, function () {
                assert.equals(callArgs[0][0].type, 'mousedown');
                assert.equals(callArgs[1][0].type, 'mouseup');
                assert.equals(callArgs[2][0].type, 'click');
                done();
            });
        });
    });
});


function fakeTarget(...rects) {
    return {
        rects: rects,

        getClientRects: function getClientRects() {
            var result = [];
            for (let rect of this.rects) {
                let copy = Object.assign({}, rect);
                copy.bottom = copy.top + copy.height;
                copy.right = copy.left + copy.width;
                result.push(copy);
            }
            return result;
        },

        getBoundingClientRect: function getBoundingClientRect() {
            var result = {top: 0, right: 0, bottom: 0, left: 0};
            for (let rect of this.getClientRects()) {
                if (rect.top < result.top) { result.top = rect.top; }
                if (rect.right > result.right) { result.right = rect.right; }
                if (rect.bottom > result.bottom) { result.bottom = rect.bottom; }
                if (rect.left < result.left) { result.left = rect.left; }
            }
            result.height = result.bottom - result.top;
            result.width = result.right - result.left;
            return result;
        },

        dispatchEvent: sinon.stub()
    };
}

