Tester.run(function(t) {
    var a; var b; var c=null;
    var e=true; var f=false;
    var g=1; var h=1.3; var i=0.0; var j=Infinity; var k=-Infinity;
    var l='hoge';
    var m=function(){};
    var n=[1,2,3];
    var o={};

    t.ok(true);
    t.ok(!null);
    t.ok(!a);
    t.ok(!c);
    t.ok(e);
    t.ok(!f);

    t.is(a, b);
    t.is(a, null);
    t.is(c, null);
    t.is(e, true);
    t.is(f, false);

    t.is(g, 1);
    t.is(g, 1.0);
    t.is(h, 1.3);
    t.is(i, 0);
    t.is(i, -0.0);
    t.is(j, Infinity);
    t.is(k, -Infinity);

    t.is(l, 'hoge');

    t.isUndefined(a);

    t.isa(m, Function);
    t.isa(m, Object);
    t.isa(n, Array);
    t.isa(n, Object);
    t.isa(o, Object);
});

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

    t.isDeeply(a1, [1, 2, 3]);
    t.isDeeply(a2, [ 1, [ 2, 3 ], 4, [ 5, [ 6, 7 ] ] ]);
    t.isDeeply(a4, a3);
    t.isDeeply(a3, a4);
    t.isDeeply(a6, a5);
    t.isDeeply(a5, a6);
    t.isDeeply(a7, a5);
    t.isDeeply(a5, a7);
    t.isDeeply(a8, a9);
    t.isDeeply(a9, a8);
});

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

    t.isDeeply(h1, { a: 1, b: 2, c: 3 });
    t.isDeeply(h2, { a: 1, b: { d: 4, e: 5 }, c: 3 });
    t.isDeeply(h4, h3);
    t.isDeeply(h3, h4);
    t.isDeeply(h6, h5);
    t.isDeeply(h5, h6);
    t.isDeeply(h7, h5);
    t.isDeeply(h5, h7);
});

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

    t.isDeeply(o1, o3);
    t.isDeeply(o3, o1);
    t.isDeeply(o2, o4);
    t.isDeeply(o4, o2);
});

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

    t.isAtLeast(a1, [1, 2, 3]);
    t.isAtLeast(a1, [1, 2]);
    t.isAtLeast(a2, [ 1, [ 2, 3 ], 4, [ 5, [ 6, 7 ] ] ]);
    t.isAtLeast(a2, [ 1, [ 2, 3 ], 4 ]);
    t.isAtLeast(a2, [ 1 ]);
    t.isAtLeast(a2, [ 1, [ 2 ], 4, [ 5, [ 6, 7 ] ] ]);
    t.isAtLeast(a2, [ 1, [ 2 ], 4, [ 5, [ 6 ] ] ]);
    t.isAtLeast(a2, [ 1, [ 2 ], 4, [ 5 ] ]);
    t.isAtLeast(a2, [ 1, [], 4, [] ]);
    t.isAtLeast(a3, a4);
    t.isAtLeast(a5, a6);
    t.isAtLeast(a5, a7);
    t.isAtLeast(a8, a9);
});

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

    t.isAtLeast(h1, { a: 1, b: 2, c: 3 });
    t.isAtLeast(h1, { a: 1, b: 2 });
    t.isAtLeast(h1, { a: 1, c: 3 });
    t.isAtLeast(h1, {});
    t.isAtLeast(h2, { a: 1, b: { d: 4, e: 5 }, c: 3 });
    t.isAtLeast(h2, { a: 1, b: { e: 5 }, c: 3 });
    t.isAtLeast(h2, { b: { e: 5 }, c: 3 });
    t.isAtLeast(h2, { a: 1, b: {}, c: 3 });
    t.isAtLeast(h3, h4);
    t.isAtLeast(h5, h6);
    t.isAtLeast(h5, h7);
});

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

    t.isAtLeast(o1, o3);
    t.isAtLeast(o2, o4);
});

Tester.run(function(t) {
    var a = [ 1, 2, 3, 4 ];
    a.x = 3;
    a.y = 4;
    a.z = 5;

    t.isAtLeast(a, [ 1, 2 ]);
    t.isAtLeast(a, { x: 3, z: 5 });
});
