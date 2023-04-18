import type {Node, Parent} from 'unist';

declare module 'unist' {
	interface Node<TData extends object = Data> {
		parent?: Parent<Node<TData>>;
	}
}
export * from 'unist';
