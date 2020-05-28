import {Node, Parent} from './nodes';
import {Test as uuTest, TestFunction as uuTestFunction} from 'unist-util-is';
import convert from 'unist-util-is/convert';

type BoolTestFn = (node: unknown, index?: number, parent?: Parent) => boolean;
export type TestFunction<T extends Node> = uuTestFunction<T> | BoolTestFn;
export type Test<T extends Node> = uuTest<T> | TestFunction<T>;
type convertFn = <T extends Node>(test: Test<T>) => TestFunction<T>;

export const test = <convertFn>convert;
