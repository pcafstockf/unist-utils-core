import {find, findAll, findAncestor} from '../src/find';
import {Parent} from '../src/nodes';
import {visit} from '../src/visit';
import tape from 'tape';


// Define a test fixture.
const tree = {
	'type': 'root',
	'children': [
		{
			'type': 'paragraph',
			'children': [
				{'type': 'text', 'value': 'Some '},
				{
					'type': 'emphasis',
					'children': [{
						'type': 'text', 'value': 'emphasis'
					}]
				},
				{'type': 'text', 'value': ', '},
				{
					'type': 'strong',
					'children': [{
						'type': 'text', 'value': 'strongness'
					}]
				},
				{'type': 'text', 'value': ', and '},
				{'type': 'inlineCode', 'value': 'code'},
				{'type': 'text', 'value': '.'}
			]
		}
	]
} as any as Parent;
// Add parental info to our json tree (normally our parser would generate this).
visit(tree, (node, idx, parents) => {
	node.parent = parents[parents.length - 1];
});

tape('Function: find', function (t) {
	// Thank you to https://github.com/blahah/unist-util-find (the inspiration for our find module) for designing these tests.
	// Our internals for the find function are different, but the surface API is the same.

	t.test('should find with string condition', function (st) {
		let result = find(tree, 'text');

		st.equal(result, (tree.children[0] as Parent).children[0]);

		st.end();
	});

	t.test('should find with object condition', function (st) {
		let result = find(tree, {type: 'emphasis'});

		st.equal(result, (tree.children[0] as Parent).children[1]);

		st.end();
	});

	t.test('should find with function condition', function (st) {
		let result = find(tree, function (node) {
			return node.type === 'inlineCode';
		});

		st.equal(result, (tree.children[0] as Parent).children[5]);

		st.end();
	});

	t.test('should return undefined if no matches', function (st) {
		let result = find(tree, 'nope, nope, nope');

		st.equal(result, undefined);

		st.end();
	});
});

tape('Function: findAll', function (t) {
	t.test('should find with string condition', function (st) {
		let results = findAll(tree, 'text');

		st.equal(results.length, 6);
		st.equal((results[1] as any).value, (((tree.children[0] as Parent).children[1] as Parent).children[0] as any).value);

		st.end();
	});

	t.test('should find with object condition', function (st) {
		let results = findAll(tree, {type: 'emphasis'});

		st.equal(results.length, 1);
		st.equal(results[0], (tree.children[0] as Parent).children[1]);

		st.end();
	});

	t.test('should find with function condition', function (st) {
		let results = findAll(tree, function (node) {
			return node.type === 'inlineCode';
		});

		st.equal(results.length, 1);
		st.equal(results[0], (tree.children[0] as Parent).children[5]);

		st.end();
	});

	t.test('should return an empty array if no matches', function (st) {
		let results = findAll(tree, 'nope, nope, nope');

		st.equal(results.length, 0);

		st.end();
	});
});

tape('Function: findAncestor', function (t) {
	t.test('should find existing ancestor', function (st) {
		let node = ((tree.children[0] as Parent).children[1] as Parent).children[0];
		let results = findAncestor(node, 'paragraph');

		st.equal(results.length, 2);
		st.equal((results[results.length - 1] as any).value, (node.parent as any).value);
		st.equal(results[0].parent.type, 'root');

		st.end();
	});

	t.test('should return empty list when no ancestor found', function (st) {
		let node = ((tree.children[0] as Parent).children[1] as Parent).children[0];
		let results = findAncestor(node, 'foobar');

		st.equal(results.length, 0);

		st.end();
	});
});
