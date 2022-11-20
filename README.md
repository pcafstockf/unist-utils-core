# unist-utils-core
[![Actions Status](https://github.com/pcafstockf/unist-utils-core/workflows/CI/badge.svg)](https://github.com/pcafstockf/unist-utils-core/actions)
[![Actions Status](https://github.com/pcafstockf/unist-utils-core/workflows/NPM%20Publish/badge.svg)](https://github.com/pcafstockf/unist-utils-core/actions)
[![npm version](https://badge.fury.io/js/unist-utils-core.svg)](https://badge.fury.io/js/unist-utils-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A collection of commonly used (albeit enhanced) algorithms based on [unist](https://github.com/syntax-tree/unist) and [unist-util-xxx](https://github.com/syntax-tree/unist#list-of-utilities).

## Why???
A few core unist-utils algorithms (combined with ES6), satisfy most of my needs.  They are:  
* test
* visit
* find
* select  

But I wanted a more uniform API and enhanced functionality.  Maybe you will like them too.

## Installation

You can get the latest release using npm:

```
$ npm install unist-utils-core --save
```

# Modifications / Enhancements

## Node
Not having a strongly typed parent field was just frustrating.  
Given that my parser already knows the parent, [unist-util-parents](https://github.com/syntax-tree/unist-util-parents) was just to much overhead.
```
import {Node} from 'unist-utils-core';

let node: Node;
...
node.parent.children.find(n => Object.is(n, node));
```

## Visit
[unist-util-visit](https://github.com/syntax-tree/unist-util-visit) is nice, but has no ancestral info, and you can't pass an array of nodes.  
[unist-util-visit-children](https://github.com/syntax-tree/unist-util-visit-children) can pass an array of nodes, but incurs overhead with narrow applicability.  
[unist-util-visit-parents](https://github.com/syntax-tree/unist-util-visit-parents) takes extra processing to determine a node's index in the list of children.  
Also, I wanted an easy way to hook begin/end visitation of a node's children.  
```
import {visit} from 'unist-utils-core';

visit(tree.children, (node, idx, parents) => {
    if (node) {
        // Normal visitation of 'node'.
        return whatever;
    }
    else if (idx === Number.MIN_SAFE_INTEGER) {
        // beginning traversal of parents[parents.length-1].children
    }
    else if (idx === Number.MAX_SAFE_INTEGER) {
        // finished traversal of parents[parents.length-1].children
    }
});
```

## Test
[unist-util-is](https://github.com/syntax-tree/unist-util-is) is a great core utility.  
But I also needed a TestFunction that could return true/false, not just a type predicate.  
And, I don't use anything except 'is.convert', and that just doesn't sound right. :-)
```
import {Test, test} from 'unist-utils-core';

if (test(node, (n) => !!n)) {
    ...
}
```

## Find
[unist-util-find](https://github.com/blahah/unist-util-find) is usefule, but doesn't use [unist-util-is](https://github.com/syntax-tree/unist-util-is) for it's tests (maybe because of the true/false thing mentioned above).  
I also needed findAll and findAncestor.
```
import {find, findAll, findAncestor} from 'unist-utils-core';

findAll(tree, (node) => node.type === 'foo').map(n => whatever(n));
```

## Select
[unist-util-select](https://github.com/syntax-tree/unist-util-select) may well be my favorite unist utility.  
But, I use TypeScript and wanted to be able to type the return value(s).
```
import {select, selectAll} from 'unist-utils-core';

selectAll<LoopST>('loop', tree).filter(n => !n.forever);
```

## Acknowledgements
Thanks to all the packages mentioned above.  
If any of these ideas sound useful, feel free to merge them in and I'll phase these out.

## MIT License

Copyright (c) 2020 Frank Stock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
