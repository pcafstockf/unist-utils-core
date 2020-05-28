import {Node} from 'unist';
import {select as uuSelect, selectAll as uuSelectAll} from 'unist-util-select';

type selectFn = <T extends Node>(selector: string, tree: Node) => T | null;
/**
 * Find first Node that matches selector
 *
 * @param selector CSS-like selector
 * @param tree Unist node or tree of nodes to search
 */
export const select = <selectFn>uuSelect;

type selectAllFn = <T extends Node>(selector: string, tree: Node) => T[];
/**
 * Find all Nodes that match selector
 *
 * @param selector CSS-like selector
 * @param tree Unist node or tree of nodes to search
 */
export const selectAll = <selectAllFn>uuSelectAll;
