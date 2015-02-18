import svg from '../src/svg';

describe('svg', function () {
    describe('createElement', function () {
        it('creates an element with the correct name', function () {
            var elem = svg.createElement('g');
            assert.equals(elem.tagName, 'g');
        });
    });
});
