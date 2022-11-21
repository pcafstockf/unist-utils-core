import {Node, Parent} from './nodes';
import {Test, test} from './test';

/**
 * Continue traversing as normal.
 */
export const CONTINUE = true;
/**
 * Do not traverse this node’s children
 */
export const SKIP = 'skip';
/**
 * Stop traversing immediately
 */
export const EXIT = false;

/**
 * Union of the action types
 */
export type Action = true | false | 'skip'

/**
 * Move to the sibling at index next (after node itself is completely traversed).
 * Useful if mutating the tree, such as removing the node the visitor is currently on,
 * or any of its previous siblings (or next siblings, in case of reverse)
 * Results less than 0 or greater than or equal to children.length stop traversing the parent
 */
export type Index = number

/**
 * List with one or two values, the first an action, the second an index.
 */
export type ActionTuple = [Action, Index]

export type VisitorResult = void | Action | Index | ActionTuple;

/**
 * Invoked when a node (matching test, if given) is found.
 * Visitors are free to transform node. They can also transform the parent of node (the last of ancestors).
 * Replacing node itself, if visit.SKIP is not returned, still causes its descendants to be visited.
 * If adding or removing previous siblings (or next siblings, in case of reverse) of node, visitor should return a new index (number) to specify the sibling to traverse after node is traversed.
 * Adding or removing next siblings of node (or previous siblings, in case of reverse) is handled as expected without needing to return a new index.
 * Removing the children property of an ancestor still results in them being traversed.
 *
 * @param node  The active Node
 * @param index Index of Node within it's Parent's list of children.
 * @param parents   Ancestors of node (parent of node will be parents[parents.length-1])
 * @returns The return value can have the following forms:
 *          index (number) — Treated as a tuple of [CONTINUE, index]
 *               Move to the sibling at index next (after node itself is completely traversed).
 *               Useful if mutating the tree, such as removing the node the visitor is currently on, or any of its previous siblings (or next siblings, in case of reverse)
 *               Results less than 0 or greater than or equal to children.length stop traversing the parent
 *          action (*) — Treated as a tuple of [action]
 *              CONTINUE:   Continue traversing as normal (same behaviour as not returning anything)
 *              SKIP:   Do not traverse this node’s children (continue with the specified index)
 *              EXIT:   Stop traversing immediately
 *          tuple (Array.<*>) — List with one or two values, the first an action, the second and index.
 *              Note that passing a tuple only makes sense if the action is SKIP. If the action is EXIT, that action can be returned. If the action is CONTINUE, index can be returned.
 */
export type Visitor<T extends Node, P extends Parent> = (node: T, index: number, parents: P[]) => VisitorResult;


/**
 * Options for more control over visitation.
 */
export interface VisitOptions {
	/**
	 * When false, the tree is traversed in preorder (NLR), visiting the node itself, then its head, etc.
	 * When true, the tree is traversed in reverse preorder (NRL): the node itself is visited, then its tail, etc.
	 * (default: false)
	 */
	reverse?: boolean;
	/**
	 *  When true, the Visitor will be called once for every Node which has children, before those children are visited.
	 *  The Visitor will be invoked as:
	 *      Visitor(undefined, PreTraversalIndex (aka Number.MIN_SAFE_INTEGER), parents);
	 *          NOTE: parents[parents.length-1] will be the Node whose children are about to be visited.
	 * (default: false)
	 */
	preTraverse?: boolean;
	/**
	 *  When true, the Visitor will be called once for every Node which has children, after those children have been visited.
	 *  The Visitor will be invoked as:
	 *      Visitor(undefined, PostTraversalIndex (aka Number.MAX_SAFE_INTEGER), parents);
	 *          NOTE: parents[parents.length-1] will be the Node whose children have just been visited
	 * (default: false)
	 */
	postTraverse?: boolean;
}
export const PreTraversalIndex = Number.MIN_SAFE_INTEGER;
export const PostTraversalIndex = Number.MAX_SAFE_INTEGER;

export function vistorResultToTuple(value) {
	if (value !== null && typeof value === 'object' && 'length' in value)
		return value;
	if (typeof value === 'number')
		return [CONTINUE, value];
	return [value];
}

// Various call overload forms.
export function visit<T extends Node, P extends Parent>(tree: T | T[], visitor: Visitor<T, P>);
export function visit<T extends Node, P extends Parent>(tree: T | T[], visitor: Visitor<T, P>, options: boolean | VisitOptions);
export function visit<T extends Node, P extends Parent>(tree: T | T[], tst: Test<T>, visitor: Visitor<T, P>);
export function visit<T extends Node, P extends Parent>(tree: T | T[], tst: Test<T>, visitor: Visitor<T, P>, options: boolean | VisitOptions);
/**
 *  Visit nodes (inclusive descendants of tree), with ancestral information. Optionally filtering nodes. Optionally in reverse, Optionally wrapping child visitation with pre/post visits.
 *  This algorithm performs depth-first tree traversal in preorder (NLR), or if reverse is given, in reverse preorder (NRL).
 *
 * @param tree  Tree to traverse (this may be a Node, or an array of Nodes).
 * @param tst  (optional) 'is-compatible' test (such as a type).
 * @param visitor    Function invoked when a node is found that passes test @see Visitor
 * @param options   Options for controlling the visit @see VisitOptions.  If you pass a boolean, it is used for {VisitOptions.reverse}.  default is false
 */
export function visit<T extends Node, P extends Parent>(tree: T | T[], tst: Test<T> | Visitor<T, P>, visitor?: Visitor<T, P> | boolean | VisitOptions, options?: boolean | VisitOptions) {
	if (typeof tst === 'function' && typeof visitor !== 'function') {
		options = <any>visitor;
		visitor = <Visitor<T, P>>tst;
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
	function one(node: T, index: number, parents: P[]) {
		let result = [];
		let subResult;
		if (!tst || is(node, index, parents[parents.length - 1] || null)) {
			let aResult = (<Visitor<T, P>>visitor)(node, index, parents);
			result = vistorResultToTuple(aResult);
			if (result[0] === EXIT)
				return result;
		}
		if (result[0] !== SKIP) {
			let c = (node as any).children as T[];
			if (c) {
				let aSubResult = all(c, parents.concat(<any>node));
				subResult = vistorResultToTuple(aSubResult);
				return subResult[0] === EXIT ? subResult : result;
			}
		}
		return result;
	}

	// Visit children in `parent`.
	function all(children: T[], parents: P[]) {
		let min = -1;
		let step = opts.reverse ? -1 : 1;
		let index = (opts.reverse ? children.length : min) + step;
		let result;
		if (opts.preTraverse)
			(<Visitor<T, P>>visitor)(undefined, PreTraversalIndex, parents);
		while (index > min && index < children.length) {
			result = one(children[index], index, parents);
			if (result[0] === EXIT)
				break;
			index = typeof result[1] === 'number' ? result[1] : index + step;
		}
		if (opts.postTraverse)
			(<Visitor<T, P>>visitor)(undefined, PostTraversalIndex, parents);
		if (result)
			return result;
	}

	// Begin
	if (Array.isArray(tree))
		return all(tree, []);
	else
		return one(tree, null, []);
}
