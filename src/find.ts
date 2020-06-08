import {Node, Parent} from './nodes';
import {Test, test} from './test';
import {CONTINUE, EXIT, visit} from './visit';

/**
 * Return the first node that matches test, or undefined if no node matches.
 *
 * @param {Node} tree - Node(s) to search
 * @param [tst] - 'is-compatible' test (such as a type).
 */
export function find<T extends Node>(tree: T | T[], tst: Test<T>) {
	let is = test(tst);
	let result: T = undefined;
	visit(tree, is, function (node) {
		result = node;
		return EXIT;
	});
	return result;
}

/**
 * Return all nodes that match test, or an empty array if no node matches.
 *
 * @param {Node} tree - Node(s) to search
 * @param [tst] - 'is-compatible' test (such as a type).
 * @returns an Array of zero or more Nodes in the tree that matched the condition.
 */
export function findAll<T extends Node>(tree: T | T[], tst: Test<T>) {
	let is = test(tst);
	let results: T[] = [];
	visit(tree, is, function (node) {
		results.push(node);
		return CONTINUE;
	});
	return results;
}

/**
 * Search upward (using the Node.parent property) for an ancestor that meets a supplied test.
 *
 * @param node  The node from which to start the upward search.
 * @param [tst] - 'is-compatible' test to apply to each parent along the upward walk.
 * @returns An array representing the "path" to the first ancestor that matched the condition.
 *          The first element in the "path" array will be the ancestor that matched the condition, and the node's immediate parent will be the last element of the array.
 *          If no ancestors were found (or none passed the test), an empty array will be returned.
 */
export function findAncestor<T extends Parent>(node: Node, tst: Test<T>) {
	let is = test(tst);
	let results: T[] = [];
	while (node && node.parent) {
		results.unshift(<T>node.parent);
		if (is(<T>node.parent))
			return results;
		node = <T>node.parent;
	}
	return [];
}
