import type {Node, Parent} from 'unist';

declare module 'unist' {
	interface Node {
		parent?: Parent;
	}
}
export * from 'unist';
