import {Node, Parent} from './nodes';
import {test, Test} from './test';
import {EXIT, SKIP, VisitOptions, VisitorResult, vistorResultToTuple} from './visit';

export type AsyncVisitor<T extends Node, P extends Parent> = (node: T, index: number, parents: P[]) => Promise<VisitorResult>;


// Various call overload forms.
export function visitAsync<T extends Node, P extends Parent>(tree: T | T[], visitor: AsyncVisitor<T, P>);
export function visitAsync<T extends Node, P extends Parent>(tree: T | T[], visitor: AsyncVisitor<T, P>, options: boolean | VisitOptions);
export function visitAsync<T extends Node, P extends Parent>(tree: T | T[], tst: Test<T>, visitor: AsyncVisitor<T, P>);
export function visitAsync<T extends Node, P extends Parent>(tree: T | T[], tst: Test<T>, visitor: AsyncVisitor<T, P>, options: boolean | VisitOptions);
/**
 *  The only difference between this function and @see visit, is that this function waits for the result returned by an AsyncVisitor to each node.
 *  NOTE: This is not the same as visiting all nodes in parallel.  Each node is still visited in sequence, just not until the AsyncVisitor callback has completed it's visit of the previous node.
 */
export async function visitAsync<T extends Node, P extends Parent>(tree: T | T[], tst: Test<T> | AsyncVisitor<T, P>, visitor?: AsyncVisitor<T, P> | boolean | VisitOptions, options?: boolean | VisitOptions): Promise<void> {
	if (typeof tst === 'function' && typeof visitor !== 'function') {
		options = <any>visitor;
		visitor = <AsyncVisitor<T, P>>tst;
		tst = null;
	}
	let opts: VisitOptions;
	if (typeof options === 'boolean')
		opts = {reverse: options};
	else if (!options)
		opts = {};
	else
		opts = options;
	let is = test(<Test<T>>tst);

	// Visit a single node.
	async function one(node: T, index: number, parents: P[]) {
		let result = [];
		let subResult;
		if (!tst || is(node, index, parents[parents.length - 1] || null)) {
			let aResult = await (<AsyncVisitor<T, P>>visitor)(node, index, parents);
			result = vistorResultToTuple(aResult);
			if (result[0] === EXIT)
				return result;
		}
		if (node.children && result[0] !== SKIP) {
			let aSubResult = await all(<T[]>node.children, parents.concat(<any>node));
			subResult = vistorResultToTuple(aSubResult);
			return subResult[0] === EXIT ? subResult : result;
		}
		return result;
	}

	// Visit children in `parent`.
	async function all(children: T[], parents: P[]) {
		let min = -1;
		let step = opts.reverse ? -1 : 1;
		let index = (opts.reverse ? children.length : min) + step;
		let result;
		if (opts.preTraverse)
			await (<AsyncVisitor<T, P>>visitor)(undefined, Number.MIN_SAFE_INTEGER, parents);
		while (index > min && index < children.length) {
			result = await one(children[index], index, parents);
			if (result[0] === EXIT)
				break;
			index = typeof result[1] === 'number' ? result[1] : index + step;
		}
		if (opts.postTraverse)
			await (<AsyncVisitor<T, P>>visitor)(undefined, Number.MAX_SAFE_INTEGER, parents);
		if (result)
			return result;
	}

	// Begin
	if (Array.isArray(tree))
		await all(tree, []);
	else
		await one(tree, null, []);
}
