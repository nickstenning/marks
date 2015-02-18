import svg from '../src/svg';

describe('svg', function () {
    describe('createElement', function () {
        it('creates an element with the correct name', function () {
            var elem = svg.createElement('g');
            assert.equals(elem.tagName, 'g');
        });

        it('creates an element with the SVG namespace URI', function () {
            var elem = svg.createElement('g');
            assert.equals(elem.namespaceURI, 'http://www.w3.org/2000/svg');
        });
    });
});
