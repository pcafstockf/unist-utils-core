import {Node} from './nodes';
import {Test, test} from './test';
import {CONTINUE, EXIT, visit} from './visit';

/**
 * Return the first node that matches test, or undefined if no node matches.
 *
 * @param {Node} tree - Node(s) to search
 * @param [tst] - 'is-compatible' test (such as a type).
 */
export function find<T extends Node>(tree: T | T[], tst: Test<T>) {
	let is = test(<Test<T>>tst);
	let result = undefined;
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
	let is = test(<Test<T>>tst);
	var results = [];
	visit(tree, is, function (node) {
		results.push(node);
		return CONTINUE;
	});
	return results;
}
