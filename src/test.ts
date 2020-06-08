import {Node, Parent} from './nodes';
import {Test as uuTest, TestFunction as uuTestFunction} from 'unist-util-is';
import convert from 'unist-util-is/convert';

type BoolTestFn<T extends Node> = (node: T, index?: number, parent?: Parent) => boolean;
export type TestFunction<T extends Node> = BoolTestFn<T> | uuTestFunction<T>;
export type Test<T extends Node> = uuTest<T> | TestFunction<T>;
type ConvertFn = <T extends Node>(test: Test<T>) => TestFunction<T>;

export const test: ConvertFn = <any>convert;
