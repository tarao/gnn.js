(function(B) {
    Tester.run(function(t) {
        t.isDefined(GNN);
        t.isDefined(GNN.Base);

        t.isDefined(B.global);

        var x = { a: { b: 'hoge' }, c: 1 };
        t.is(B.lookup(null, 'Array'), Array);
        t.is(B.lookup(x, 'a.b'), 'hoge');
    }, 'namespace');

    Tester.run(function(t) {
        t.is(B.isDefined(B.global), true);

        var undef;
        t.is(B.isDefined(undef), false);

        t.is(B.isCallable(function(){}), true);
        t.is(B.isCallable(undef), false);
        t.is(B.isCallable(1), false);
        t.is(B.isCallable({}), false);

        t.is(B.respondTo(undef, 'm'), false);
        t.is(B.respondTo({ m: function(){} }, 'm'), true);
        t.is(B.respondTo({ m: {} }, 'm'), false);
        t.is(B.respondTo({}, 'm'), false);

        t.is(B.isA([], Array), true);
        t.is(B.isA([], 'Array'), true);
        t.is(B.isA({}, Object), true);
        t.is(B.isA({}, 'Object'), true);
        t.is(B.isA([], Object), true);
        t.is(B.isA([], 'Object'), true);
        t.is(B.isA(function(){}, Object), true);
        t.is(B.isA(function(){}, 'Object'), true);
        t.is(B.isA("", Object), false);
        t.is(B.isA("", 'Object'), false);

        var Klass = function Klass(){};
        t.is(B.isA(new Klass(), Klass), true);

        GNN.TestClass1 = Klass;
        t.is(B.isA(new GNN.TestClass1(), GNN.TestClass1), true);
        t.is(B.isA(new GNN.TestClass1(), 'GNN.TestClass1'), true);

        t.is(B.kindOf(undef), 'atom');
        t.is(B.kindOf(null), 'atom');
        t.is(B.kindOf(true), 'atom');
        t.is(B.kindOf(false), 'atom');
        t.is(B.kindOf(1), 'atom');
        t.is(B.kindOf(1.0), 'atom');
        t.is(B.kindOf(NaN), 'atom');
        t.is(B.kindOf(Infinity), 'atom');
        t.is(B.kindOf(""), 'atom');
        t.is(B.kindOf({}), 'object');
        t.is(B.kindOf([]), 'array');
        t.is(B.kindOf(function(){}), 'function');

        t.is(B.funName(function hoge(){}), 'hoge');
        t.is(B.funName(function(){}), undef);
        t.is(B.funName(Array), 'Array');
        t.is(B.funName(Object), 'Object');
        t.is(B.funName(Function), 'Function');

        t.is(B.className([]), 'Array');
        t.is(B.className({}), 'Object');
        t.is(B.className(function(){}), 'Function');
        t.is(B.className(new Klass()), 'Klass');
        t.is(B.className(new (function(){})), '');
    }, 'object properties');

    Tester.run(function(t) {
        var a0 = [ 1, 2, 3 ];
        var a1 = [ 1, 2, 3 ];
        var a2 = [ 1, [ 2, 3 ], 4, [ 5, [ 6, 7 ] ] ];
        var a3 = [ 1, 2, 3 ];
        a3[1] = a3;
        var a4 = [ 1, 2, 3 ];
        a4[1] = a4;
        var a5 = [ 1, 2, 3, 4 ];
        a5[1] = a0;
        a5[3] = a0;
        var a6 = [ 1, 2, 3, 4 ];
        a6[1] = a1;
        a6[3] = a1;
        var a7 = [ 1, 2, 3, 4 ];
        a7[1] = a1;
        a7[3] = [ 1, 2, 3 ];
        var a8 = [ 1, 2, 3 ];
        var a9 = [ 1, 2, 3 ];
        a8[1] = a9;
        a9[1] = a8;
        var aA = [ 1, 2, 3 ];
        aA[1] = aA;
        var aB = [ 1, 2, 3, 4 ];
        aB[1] = aB;

        t.ok(B.eq(a1, [1, 2, 3]));
        t.ok(B.eq(a2, [ 1, [ 2, 3 ], 4, [ 5, [ 6, 7 ] ] ]));
        t.ok(B.eq(a4, a3));
        t.ok(B.eq(a3, a4));
        t.ok(B.eq(a6, a5));
        t.ok(B.eq(a5, a6));
        t.ok(B.eq(a7, a5));
        t.ok(B.eq(a5, a7));
        t.ok(B.eq(a8, a9));
        t.ok(B.eq(a9, a8));
        t.ok(B.eq(aA, a9));

        t.is(B.eq(a1, [1, 2]), false);
        t.is(B.eq(a1, [1, 2, 3, 4]), false);
        t.is(B.eq(a2, [ 1, [ 2, 3 ], 4, [ 5, [ 6 ] ] ]), false);
        t.is(B.eq(a2, [ 1, [ 2, 3 ], 4, [ 5, [ 6, 7 ], 8 ] ]), false);
        t.is(B.eq(a7, a8), false);
        t.is(B.eq(a8, a7), false);
        t.is(B.eq(aB, a8), false);
        t.is(B.eq(a8, aB), false);
        t.is(B.eq(aA, aB), false);
        t.is(B.eq(aB, aA), false);
    }, 'deep equality of array');

    Tester.run(function(t) {
        var h0 = { a: 1, b: 2, c: 3 };
        var h1 = { a: 1, b: 2, c: 3 };
        var h2 = { a: 1, b: { d: 4, e: 5 }, c: 3 };
        var h3 = { a: 1, b: 2, c: 3 };
        h3.b = h3;
        var h4 = { a: 1, b: 2, c: 3 };
        h4.b = h4;
        var h5 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        h5.b = h0;
        h5.d = h0;
        var h6 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        h6.b = h1;
        h6.d = h1;
        var h7 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        h7.b = h1;
        h7.d = { a: 1, b: 2, c: 3 };
        var h8 = { a: 1, b: 2, c: 3 };
        var h9 = { a: 1, b: 2, c: 3 };
        h8.b = h9;
        h9.b = h8;
        var hA = { a: 1, b: 2, c: 3, d: 4 };
        hA.b = hA;

        t.ok(B.eq(h1, { a: 1, b: 2, c: 3 }));
        t.ok(B.eq(h2, { a: 1, b: { d: 4, e: 5 }, c: 3 }));
        t.ok(B.eq(h4, h3));
        t.ok(B.eq(h3, h4));
        t.ok(B.eq(h6, h5));
        t.ok(B.eq(h5, h6));
        t.ok(B.eq(h7, h5));
        t.ok(B.eq(h5, h7));
        t.ok(B.eq(h3, h8));
        t.ok(B.eq(h8, h3));
        t.ok(B.eq(h8, h9));
        t.ok(B.eq(h9, h8));

        t.is(B.eq(h1, { a: 1, b: 2 }), false);
        t.is(B.eq(h1, { a: 1, b: 2, c: 3, d: 4 }), false);
        t.is(B.eq(h2, { a: 1, b: { e: 5 }, c: 3 }), false);
        t.is(B.eq(h2, { a: 1, b: { d: 4, e: 5, f: 6 }, c: 3 }), false);
        t.is(B.eq(h0, h3), false);
        t.is(B.eq(h3, h0), false);
        t.is(B.eq(h3, hA), false);
        t.is(B.eq(hA, h3), false);
        t.is(B.eq(h9, hA), false);
        t.is(B.eq(hA, h9), false);
    }, 'deep equality of hash');

    Tester.run(function(t) {
        var o1 = [ 1, 2, 3, 4, 5 ];
        var o2 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        o1[1] = o2;
        o1[3] = o1;
        o2.b = o2;
        o2.d = o1;
        var o3 = [ 1, 2, 3, 4, 5 ];
        var o4 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        o3[1] = o4;
        o3[3] = o3;
        o4.b = o4;
        o4.d = o3;
        var o5 = [ 1, 2, 3 ];
        var o6 = { a: 1, b: 2, c: 3 };
        var o7 = [ 1, 2, 3 ];
        var o8 = { a: 1, b: 2, c: 3 };
        o5[1] = o5;
        o5[2] = o8;
        o6.b = o7;
        o6.c = o5;
        o7[1] = o7;
        o7[2] = o6;
        o8.b = o5;
        o8.c = o7;
        var o9 = [ 1, 2, 3 ];
        var oA = { a: 1, b: 2, c: 3 };
        o9[1] = o9;
        o9[2] = oA;
        oA.b = o9;
        oA.c = o9;

        t.ok(B.eq(o1, o3));
        t.ok(B.eq(o3, o1));
        t.ok(B.eq(o2, o4));
        t.ok(B.eq(o4, o2));
        t.ok(B.eq(o5, o7));
        t.ok(B.eq(o7, o5));
        t.ok(B.eq(o6, o8));
        t.ok(B.eq(o8, o6));
        t.ok(B.eq(o5, o9));
        t.ok(B.eq(o9, o5));
        t.ok(B.eq(o7, o9));
        t.ok(B.eq(o9, o7));
        t.ok(B.eq(o6, oA));
        t.ok(B.eq(oA, o6));
        t.ok(B.eq(o8, oA));
        t.ok(B.eq(oA, o8));
    }, 'deep equality of object');

    Tester.run(function(t) {
        var Klass = function(){};
        Klass.prototype = { x: 3 };

        var obj = new Klass();
        obj.y = 2;
        obj.z = 1;

        t.is('x' in obj, true);
        t.is('y' in obj, true);
        t.is('z' in obj, true);
        t.is(obj.hasOwnProperty('x'), false);
        t.is(obj.hasOwnProperty('y'), true);
        t.is(obj.hasOwnProperty('z'), true);

        t.is(B.eq(obj, { x: 3, y: 2, z: 1 }), true);
    }, 'deep equality is an observable equivalence');

    Tester.run(function(t) {
        var a0 = [ 1, 2, 3 ];
        var a1 = [ 1, 2, 3 ];
        var a2 = [ 1, [ 2, 3 ], 4, [ 5, [ 6, 7 ] ] ];
        var a3 = [ 1, 2, 3 ];
        a3[1] = a3;
        var a4 = [ 1, 2 ];
        a4[1] = a4;
        var a5 = [ 1, 2, 3, 4 ];
        a5[1] = a0;
        a5[3] = a0;
        var a6 = [ 1, 2, 3 ];
        a6[1] = a1;
        a6[3] = a1;
        var a7 = [ 1, 2, 3, 4 ];
        a7[1] = a1;
        a7[3] = [ 1, 2 ];
        var a8 = [ 1, 2, 3 ];
        var a9 = [ 1, 2, 3 ];
        a8[1] = a9;
        a9[1] = a8;
        var aA = [ 1, 2, 3, 4 ];
        var aB = [ 1, 2, 3 ];
        var aC = [ 1, 2, 3 ];
        aA[1] = aB;
        aB[1] = aA;
        aC[1] = aB;

        t.ok(B.covers(a1, [1, 2, 3]));
        t.ok(B.covers(a1, [1, 2]));
        t.ok(B.covers(a2, [ 1, [ 2, 3 ], 4, [ 5, [ 6, 7 ] ] ]));
        t.ok(B.covers(a2, [ 1, [ 2, 3 ], 4 ]));
        t.ok(B.covers(a2, [ 1 ]));
        t.ok(B.covers(a2, [ 1, [ 2 ], 4, [ 5, [ 6, 7 ] ] ]));
        t.ok(B.covers(a2, [ 1, [ 2 ], 4, [ 5, [ 6 ] ] ]));
        t.ok(B.covers(a2, [ 1, [ 2 ], 4, [ 5 ] ]));
        t.ok(B.covers(a2, [ 1, [], 4, [] ]));
        t.ok(B.covers(a3, a4));
        t.ok(B.covers(a5, a6));
        t.ok(B.covers(a5, a7));
        t.ok(B.covers(a8, a9));

        t.is(B.covers(aA, aB), false);
        t.is(B.covers(aB, aA), false);
        t.is(B.covers(aA, aC), true);
    }, 'partial deep equality of array');

    Tester.run(function(t) {
        var h0 = { a: 1, b: 2, c: 3 };
        var h1 = { a: 1, b: 2, c: 3 };
        var h2 = { a: 1, b: { d: 4, e: 5 }, c: 3 };
        var h3 = { a: 1, b: 2, c: 3 };
        h3.b = h3;
        var h4 = { a: 1, b: 2 };
        h4.b = h4;
        var h5 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        h5.b = h0;
        h5.d = h0;
        var h6 = { a: 1, b: 2, c: 3, d: 4 };
        h6.b = h1;
        h6.d = h1;
        var h7 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        h7.b = h1;
        h7.d = { a: 1, b: 2 };
        var h8 = { a: 1, b: 2, c: 3 };
        var h9 = { a: 1, b: 2 };
        h8.b = h9;
        h9.b = h9;
        var hA = { a: 1, b: 2, c: 3 };
        var hB = { a: 1, b: 2 };
        hA.b = hB;
        hB.b = hA;

        t.ok(B.covers(h1, { a: 1, b: 2, c: 3 }));
        t.ok(B.covers(h1, { a: 1, b: 2 }));
        t.ok(B.covers(h1, { a: 1, c: 3 }));
        t.ok(B.covers(h1, {}));
        t.ok(B.covers(h2, { a: 1, b: { d: 4, e: 5 }, c: 3 }));
        t.ok(B.covers(h2, { a: 1, b: { e: 5 }, c: 3 }));
        t.ok(B.covers(h2, { b: { e: 5 }, c: 3 }));
        t.ok(B.covers(h2, { a: 1, b: {}, c: 3 }));
        t.ok(B.covers(h3, h4));
        t.ok(B.covers(h5, h6));
        t.ok(B.covers(h5, h7));
        t.ok(B.covers(h8, h9));

        t.is(B.covers(hA, hB), false);
        t.is(B.covers(hB, hA), false);
    }, 'partial deep equality of hash');

    Tester.run(function(t) {
        var o1 = [ 1, 2, 3, 4, 5 ];
        var o2 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        o1[1] = o2;
        o1[3] = o1;
        o2.b = o2;
        o2.d = o1;
        var o3 = [ 1, 2, 3, 4 ];
        var o4 = { a: 1, b: 2, d: 4, e: 5 };
        o3[1] = o4;
        o3[3] = o3;
        o4.b = o4;
        o4.d = o3;

        t.ok(B.covers(o1, o3));
        t.ok(B.covers(o2, o4));
    }, 'partial deep equality of object');

    Tester.run(function(t) {
        var Klass = function(){};
        Klass.prototype = { x: 3 };

        var obj = new Klass();
        obj.y = 2;
        obj.z = 1;

        t.is('x' in obj, true);
        t.is('y' in obj, true);
        t.is('z' in obj, true);
        t.is(obj.hasOwnProperty('x'), false);
        t.is(obj.hasOwnProperty('y'), true);
        t.is(obj.hasOwnProperty('z'), true);

        t.is(B.covers(obj, { x: 3, y: 2, z: 1 }), true);
        t.is(B.covers(obj, { x: 3, y: 2 }), true);
        t.is(B.covers({ w: 4, x: 3, y: 2, z: 1 }, obj), true);
    }, 'partial deep equality is an observable equivalence');

    Tester.run(function(t) {
        var undef;
        t.is(B.pp(undef), 'undefined');
        t.is(B.pp(null), 'null');
        t.is(B.pp(true), 'true');
        t.is(B.pp(false), 'false');
        t.is(B.pp(1), '1');
        t.is(B.pp(1.1), '1.1');
        t.is(B.pp(NaN), 'NaN');
        t.is(B.pp(Infinity), 'Infinity');
        t.is(B.pp(""), '""');
        t.is(B.pp({}), '{}');
        t.is(B.pp([]), '[]');
        t.is(B.pp(function(){}).replace(/\s/g, ''), 'function(){}');

        var s1 = 'hoge\nfoo';
        var s2 = 'hoge\\nfoo';
        var s3 = '"hoge"';
        var s4 = '\\"hoge\\"';
        t.is(B.pp(s1), '"hoge\\nfoo"');
        t.is(B.pp(s2), '"hoge\\\\nfoo"');
        t.is(B.pp(s3), '"\\"hoge\\""');
        t.is(B.pp(s4), '"\\\\\\"hoge\\\\\\""');

        var a1 = [ 1, 2, 3 ];
        var a2 = [ 1, 2, [ 3, 4 ], [ 5, [ 6 ] ] ];
        var a3 = [ 1, 2, 3 ];
        a3[1] = a3;
        var a4 = [ 1, [ 2, [ 3, 4 ] ], 5, 6 ];
        a4[1][1][1] = a3;
        a4[2] = a3;
        a4[3] = a4;
        var a5 = [ 1, 2, 3 ];
        var a6 = [ 1, 2, 3 ];
        a5[1] = a6;
        a6[1] = a5;

        t.is(B.pp(a1), '[1, 2, 3]');
        t.is(B.pp(a1,{object:{name:1}}), '[1, 2, 3]');
        t.is(B.pp(a2), '[1, 2, [3, 4], [5, [6]]]');
        t.is(B.pp(a3), '[1, ..., 3]');
        t.is(B.pp(a3,{cyclic:{detail:1}}), '[1, &1, 3]');
        t.is(B.pp(a3,{prettify:1}), '[1, cyclic(1), 3]');
        t.is(B.pp(a4), '[1, [2, [3, [1, ..., 3]]], [1, ..., 3], ...]');
        t.is(B.pp(a4,{cyclic:{detail:1}}),
             '[1, [2, [3, [1, &4, 3]]], [1, &2, 3], &1]');
        t.is(B.pp(a4,{prettify:1}),
             '[1, [2, [3, [1, cyclic(4), 3]]], [1, cyclic(2), 3], cyclic(1)]');
        t.is(B.pp([a5,a6]), '[[1, [1, ..., 3], 3], [1, [1, ..., 3], 3]]');
        t.is(B.pp([a5,a6],{cyclic:{detail:1}}),
             '[[1, [1, &2, 3], 3], [1, [1, &2, 3], 3]]');
        t.is(B.pp([a5,a6],{prettify:1}),
             '[[1, [1, cyclic(2), 3], 3], [1, [1, cyclic(2), 3], 3]]');

        var h1 = { a: 1, b: 2, c: 3 };
        var h2 = { a: 1, b: { d: 4, e: 5 }, c: 3 };
        var h3 = { a: 1, b: 2, c: 3 };
        h3.b = h3;
        var h4 = { '0123': 1 };
        var h5 = { 'a\\bcd': 1 };
        var h6 = { "a\nb'cd": 1 };
        var h7 = { "": 1 };

        t.is(B.pp(h1), '{a: 1, b: 2, c: 3}');
        t.is(B.pp(h1,{object:{name:1}}), '{a: 1, b: 2, c: 3}');
        t.is(B.pp(h1,{prettify:1,object:{name:1}}), '{a: 1, b: 2, c: 3}');
        t.is(B.pp(h2), '{a: 1, b: {d: 4, e: 5}, c: 3}');
        t.is(B.pp(h3), '{a: 1, b: ..., c: 3}');
        t.is(B.pp(h3,{prettify:1}), '{a: 1, b: cyclic(1), c: 3}');
        t.is(B.pp(h4), "{'0123': 1}");
        t.is(B.pp(h5), "{'a\\\\bcd': 1}");
        t.is(B.pp(h6), "{'a\\nb\\'cd': 1}");
        t.is(B.pp(h7), "{'': 1}");

        var Klass = function Klass(){};
        var x = new Klass();
        x.a = 1; x.b = 2; x.c = 3;
        t.is(B.pp(x), '{a: 1, b: 2, c: 3}');
        t.is(B.pp(x,{object:{name:1}}), 'Klass {a: 1, b: 2, c: 3}');
        t.is(B.pp(x,{prettify:1,object:{name:1}}),
             'Klass({a: 1, b: 2, c: 3})');
    }, 'pretty print');

    Tester.run(function(t) {
        t.isDeeply(B.merge(null, {a:1,b:2}), {a:1,b:2});
        t.isDeeply(B.merge(null, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.isDeeply(B.merge({a:1,b:2}, {b:3}), {a:1,b:3});
        t.isDeeply(B.merge({a:1,b:2}, {b:3}, {a:2,c:4}), {a:2,b:3,c:4});

        var a = null; var b = {a:1,b:2};
        t.isDeeply(B.merge(a, {a:1,b:2}), {a:1,b:2});
        t.is(a, null);
        t.isDeeply(B.merge(a, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.is(a, null);
        t.isDeeply(B.merge(b, {b:3}), {a:1,b:3});
        t.isDeeply(b, {a:1,b:3});

        t.isDeeply(B.merge({a:{b:1,c:2},d:{e:3,f:4}},{a:{b:2}}),
                   {a:{b:2},d:{e:3,f:4}});
    });

    Tester.run(function(t) {
        t.isDeeply(B.dmerge(null, {a:1,b:2}), {a:1,b:2});
        t.isDeeply(B.dmerge(null, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.isDeeply(B.dmerge({a:1,b:2}, {b:3}), {a:1,b:3});
        t.isDeeply(B.dmerge({a:1,b:2}, {b:3}, {a:2,c:4}), {a:2,b:3,c:4});

        var a = null; var b = {a:1,b:2};
        t.isDeeply(B.dmerge(a, {a:1,b:2}), {a:1,b:2});
        t.is(a, null);
        t.isDeeply(B.dmerge(a, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.is(a, null);
        t.isDeeply(B.dmerge(b, {b:3}), {a:1,b:3});
        t.isDeeply(b, {a:1,b:3});

        t.isDeeply(B.dmerge({a:{b:1,c:2},d:{e:3,f:4}},{a:{b:2}}),
                   {a:{b:2,c:2},d:{e:3,f:4}});
    });

    Tester.run(function(t) {
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, null, {a:1,b:2}), {a:1,b:2});
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, null, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, {a:1,b:2}, {b:3}), {a:1,b:2});
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, {a:1,b:2}, {b:3}, {a:2,c:4}), {a:1,b:2,c:4});

        var a = null; var b = {a:1,b:2};
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, a, {a:1,b:2}), {a:1,b:2});
        t.is(a, null);
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, a, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.is(a, null);
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, b, {b:3}), {a:1,b:2});
        t.isDeeply(b, {a:1,b:2});

        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, {a:{b:1,c:2},d:{e:3,f:4}},{a:{b:2}}),
                   {a:{b:1,c:2},d:{e:3,f:4}});
    });

    Tester.run(function(t) {
        var Klass = function() {
            this.hoge = 'hoge';
        };
        var obj = new Klass();

        var proto = {
            fun: function() {
                return this.hoge + 'foo';
            }
        };

        var x=0;
        B.setProto(obj, proto, function(o, p) {
            x = p.fun.call(o);
        });
        if (B.isDefined(obj.__proto__)) {
            t.is(obj.fun(), 'hogefoo', '__proto__');
        } else {
            t.is(x, 'hogefoo', 'no __proto__');
        }

        B.addProperty(obj, 'foo', {
            get: function(){ return this.hoge + this.hoge; },
            set: function(v){ this.hoge = v; }
        });
        t.is(obj.foo, 'hogehoge');
        obj.foo = 'foo';
        t.is(obj.foo, 'foofoo');

        B.addProperties(obj, {
            bar: {
                get: function(){ return this.hoge + 'bar' }
            },
            baz: {
                set: function(v){ this.hoge = v+'baz' }
            }
        });
        t.is(obj.bar, 'foobar');
        obj.baz = 'hoge';
        t.is(obj.bar, 'hogebazbar');

        var keys = [];
        for (var k in obj) keys.push(k);
        t.is(keys.indexOf('foo'), -1,
             'addProperty does not add enumerable property')
        t.is(keys.indexOf('bar'), -1,
             'addProperty does not add enumerable property')
        t.is(keys.indexOf('baz'), -1,
             'addProperty does not add enumerable property')

        var methods = {
            a: function(x,y){ return x+y; },
            m: function(x,y){ return x*y; }
        };
        var r1 = { a: 1, b: 2 };
        var r2 = { a: 1, b: 2 };
        var r3 = { a: 1, b: 2 };
        var r4 = { b: 4, m: 3 };
        var r5 = { a: 1, b: 2 };
        B.addInterface(r1, methods);
        B.addInterface(r2, methods, r2);
        B.addInterface(r3, methods, r4);
        B.addInterface(r5, methods, function(a,b){ return b; });
        t.is(r1.a, 1, 'adding interface');
        t.is(r1.b, 2, 'adding interface');
        t.is(r1.m, methods.m, 'adding interface');
        t.is(r2.a, 1, 'adding interface');
        t.is(r2.b, 2, 'adding interface');
        t.is(r2.m, methods.m, 'adding interface');
        t.is(r3.a, methods.a, 'adding interface');
        t.is(r3.b, 2, 'adding interface');
        t.isUndefined(r3.m, 'adding interface');
        t.is(r5.a, methods.a, 'adding interface');
        t.is(r5.b, 2, 'adding interface');
        t.is(r5.m, methods.m, 'adding interface');
    }, 'class definition');
})(GNN.Base);
