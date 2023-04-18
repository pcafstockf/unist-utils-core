import {Node, Parent} from './nodes';
import {test, Test} from './test';
import {EXIT, PostTraversalIndex, PreTraversalIndex, SKIP, VisitOptions, VisitorResult, visitorResultToTuple} from './visit';

export type AsyncVisitor<T extends Node, P extends Parent, C extends any = never> = (node: T, index: number, parents: P[], ctx: C) => Promise<VisitorResult>;


// Various call overload forms.
export function visitAsync<T extends Node<any>, P extends Parent<T>, C extends any = never>(tree: T | T[], visitor: AsyncVisitor<T, P, C>);
export function visitAsync<T extends Node<any>, P extends Parent<T>, C extends any = never>(tree: T | T[], visitor: AsyncVisitor<T, P, C>, options: boolean | VisitOptions<C>);
export function visitAsync<T extends Node<any>, P extends Parent<T>, C extends any = never>(tree: T | T[], tst: Test<T>, visitor: AsyncVisitor<T, P, C>);
export function visitAsync<T extends Node<any>, P extends Parent<T>, C extends any = never>(tree: T | T[], tst: Test<T>, visitor: AsyncVisitor<T, P, C>, options: boolean | VisitOptions<C>);
/**
 *  The only difference between this function and @see visit, is that this function waits for the result returned by an AsyncVisitor to each node.
 *  NOTE: This is not the same as visiting all nodes in parallel.  Each node is still visited in sequence, just not until the AsyncVisitor callback has completed it's visit of the previous node.
 */
export async function visitAsync<T extends Node<any>, P extends Parent<T>, C extends any = never>(tree: T | T[], tst: Test<T> | AsyncVisitor<T, P, C>, visitor?: AsyncVisitor<T, P, C> | boolean | VisitOptions<C>, options?: boolean | VisitOptions<C>): Promise<void> {
	if (typeof tst === 'function' && typeof visitor !== 'function') {
		options = <any>visitor;
		visitor = <AsyncVisitor<T, P, C>>tst;
		tst = null;
	}
	let opts: VisitOptions<C>;
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
			let aResult = await (<AsyncVisitor<T, P, C>>visitor)(node, index, parents, opts.context);
			result = visitorResultToTuple(aResult);
			if (result[0] === EXIT)
				return result;
		}
		if (result[0] !== SKIP) {
			let c = (node as any).children as T[];
			if (c) {
				let aSubResult = await all(c, parents.concat(<any>node));
				subResult = visitorResultToTuple(aSubResult);
				return subResult[0] === EXIT ? subResult : result;
			}
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
			await (<AsyncVisitor<T, P, C>>visitor)(undefined, PreTraversalIndex, parents, opts.context);
		while (index > min && index < children.length) {
			result = await one(children[index], index, parents);
			if (result[0] === EXIT)
				break;
			index = typeof result[1] === 'number' ? result[1] : index + step;
		}
		if (opts.postTraverse)
			await (<AsyncVisitor<T, P, C>>visitor)(undefined, PostTraversalIndex, parents, opts.context);
		if (result)
			return result;
	}

	// Begin
	if (Array.isArray(tree))
		await all(tree, []);
	else
		await one(tree, null, []);
}
