(function(B, H) {
    Tester.run(function(t) {
        var undef;
        var undef1;

        t.ok(Test.instance({ a: 1, b: 2 }) instanceof Object, 'instance');
        t.isDeeply(Test.instance({ a: 1, b: 2 }), { a: 1, b: 2 }, 'value');

        // indexOf
        Test.testMethod('indexOf', [
            [ { a:1, b:2, c:3 }, [ 1 ], 'a' ],
            [ { a:1, b:2, c:3 }, [ 2 ], 'b' ],
            [ { a:1, b:2, c:3 }, [ 3 ], 'c' ],
            [ { a:1, b:2, c:3 }, [ 4 ], undef ],
        ]);

        // filter
        Test.testMethod('filter', [
            [ { a:1, b:2, c:3, d:4, e:5 }, [ function(k, v){return v%2!=0;} ],
              { a:1, c:3, e:5 } ],
            [ { a:1, b:2, c:3, d:4, e:5 }, [ function(k, v){return k=='c';} ],
              { c:3 } ],
            [ { a:1, b:2, c:3, d:4, e:5 }, [ function(k, v, o) {
                o[k] = 0;
                return v%2!=0;
            } ],
              { a:1, c:3, e:5 } ],
        ]);
        try {
            var tmp = Test.instance({ a:1, b:2, c:3 });
            Test.call(tmp, 'filter', function(k, v, o) {
                o[k] = 0;
                return v%2!=0;
            });
            t.isDeeply(tmp, { a:0, b:0, c:0 },
                       Test.sig('filter')+' side effect');
        } catch (e) {
            t.error(e, Test.sig('filter')+' side effect');
        }
        t.isThrown(function() {
            Test.call(Test.instance({ a:1, b:2, c:3 }), 'filter', {});
        }, TypeError, Test.sig('filter')+' throws');

        // forEach
        var forEachR = { x: 0, y: 0, z: 0};
        Test.testMethod('forEach', [
            [ { a:1, b:2, c:3, d:4, e:5, f:6 },
              [ function(k, v){forEachR.x += v*v;} ],
              undef ],
            [ { a:6, b:5, c:4, d:3, e:2, f:1 },
              [ function(k,v){forEachR.y += v*v+k;} ],
              undef ],
            [ { a:1, b:2, c:3, d:4, e:5, f:6 }, [ function(k,v,o){o[k]=0;} ],
              undef ],
            [ { a:1, b:2, c:3, d:4, e:5, f:6 },
              [ function(k,v){this.z += v*v;}, forEachR ],
              undef ],
        ]);
        t.is(forEachR.x, 91, Test.sig('forEach')+' side effect (1)');
        t.is(forEachR.y, '036a25b16c9d4e1f',
             Test.sig('forEach')+' side effect with key');
        try {
            var tmp = Test.instance({ a:1, b:2, c:3, d:4, e:5, f:6 });
            Test.call(tmp, 'forEach', function(k,v,o){o[k]=0;});
            t.isDeeply(tmp, { a:0, b:0, c:0, d:0, e:0, f:0 },
                       Test.sig('forEach')+' side effect (2)');
        } catch (e) {
            t.error(e, Test.sig('forEach')+' side effect (2)');
        }
        t.is(forEachR.z, 91, Test.sig('forEach')+' side effect with this');
        t.isThrown(function() {
            Test.call(Test.instance({ a:1, b:2, c:3 }), 'forEach', {});
        }, TypeError, Test.sig('forEach')+' throws');

        // every
        Test.testMethod('every', [
            [ { a:1, b:2, c:3, d:4 }, [ function(k, v){return v%2==0;} ],
              false ],
            [ { b:2, d:4 }, [ function(k, v){return v%2==0;} ],
              true ],
            [ { a:1, b:3, c:5, d:7 }, [ function(k, v) {
                return v%2==1 && k.length==1;
            } ],
              true ],
            [ { a:1, b:2, c:3, d:4 },
              [ function(k,v,o){o[k]=0;return v%2==0;} ],
              false ],
        ]);
        try {
            var tmp = Test.instance({ a:1, b:2, c:3, d:4 });
            Test.call(tmp, 'every', function(k, v, o){o[k]=0;return true;});
            t.isDeeply(tmp, { a:0, b:0, c:0, d:0 },
                       Test.sig('every')+' side effect');
        } catch (e) {
            t.error(e, Test.sig('every')+' side effect');
        }
        t.isThrown(function() {
            Test.call(Test.instance({ a:1, b:2, c:3 }), 'every', {});
        }, TypeError, Test.sig('every')+' throws');

        // map
        Test.testMethod('map', [
            [ { a:1, b:2, c:3, d:4 }, [ function(k,v){return v*v;} ],
              { a:1, b:4, c:9, d:16 } ],
            [ { a:1, b:2, c:3, d:4 }, [ function(k,v,o){o[k]=0;return v+k;} ],
              { a:'1a', b:'2b', c:'3c', d:'4d' } ],
        ]);
        try {
            var tmp = Test.instance({ a:1, b:2, c:3 });
            Test.call(tmp, 'map', function(k, v, o){o[k]=0;return v*k;});
            t.isDeeply(tmp, { a:0, b:0, c:0 },
                       Test.sig('map')+' side effect');
        } catch (e) {
            t.error(e, Test.sig('map')+' side effect');
        }
        t.isThrown(function() {
            Test.call(Test.instance({ a:1, b:2, c:3 }), 'map', {});
        }, TypeError, Test.sig('map')+' throws');

        // some
        Test.testMethod('some', [
            [ { a:1, b:2, c:3, d:4, e:5 }, [ function(k, v){return v%2==0;} ],
              true ],
            [ { a:1, c:3, e:5 }, [ function(k, v){return v%2==0;} ],
              false ],
            [ { a:1, b:2, c:3, d:4, e:5 },
              [ function(k,v,o){o[k]=0;return v%2==0;} ],
              true ],
        ]);
        try {
            var tmp = Test.instance({ a:1, b:2, c:3 });
            Test.call(tmp, 'some', function(k, v, o){o[k]=0;return false;});
            t.isDeeply(tmp, { a:0, b:0, c:0 },
                       Test.sig('some')+' side effect');
        } catch (e) {
            t.error(e, Test.sig('some')+' side effect');
        }
        t.isThrown(function() {
            Test.call(Test.instance({ a:1, b:2, c:3 }), 'some', {});
        }, TypeError, Test.sig('some')+' throws');

        // reduce
        Test.testMethod('reduce', [
            [ { a:1, b:2, c:3, d:4 }, [ function(r, k, v){return r+v}, 0 ],
              10 ],
            [ { a:1, b:2, c:3, d:4 },
              [ function(r, k, v){return [ r[0]+k, r[1]*v ];}, [ '', 1 ] ],
              [ 'abcd', 24 ] ],
        ]);
        t.isThrown(function() {
            Test.call(Test.instance({ a:1, b:2, c:3 }), 'reduce', {});
        }, TypeError, Test.sig('reduce')+' throws');

        // merge
        Test.testMethod('merge', [
            [ { a:1, b:2, c:3 }, [ { d:4, e:5 } ],
              { a:1, b:2, c:3, d:4, e:5 } ],
            [ { a:1, b:2, c:3 }, [ { d:4, e:5 }, { f:6 } ],
              { a:1, b:2, c:3, d:4, e:5, f:6 } ],
            [ { a:1, b:2, c:3 }, [ { d:4, e:5 }, {}, { f:6 } ],
              { a:1, b:2, c:3, d:4, e:5, f:6 } ],
            [ { a:1, b:2, c:3 }, [ { a:3 }, { d:4, e:5, c:4 }, { f:6, e:8 } ],
              { a:3, b:2, c:4, d:4, e:8, f:6 } ],
        ]);

        // find
        Test.testMethod('find', [
            [ { a:1, b:2, c:3 }, [ function(k, v){return v%2==0;} ],
              [ 'b', 2 ] ],
            [ { a:1, b:2, c:3 }, [ function(k, v){return v%2==0;} ],
              { key: 'b', value: 2 } ],
            [ { a:1, bb:2, c:3 }, [ function(k, v){return k.length > 1;} ],
              [ 'bb', 2 ] ],
            [ { a:1, bb:2, c:3 }, [ function(k, v){return k.length > 1;} ],
              { key: 'bb', value: 2 } ],
            [ { a:1, b:2, c:3 }, [ 2 ],
              [ 'b', 2 ] ],
            [ { a:1, b:2, c:3 }, [ 2 ],
              { key: 'b', value: 2 } ],
        ], 'atleast');
        Test.testMethod('find', [
            [ { a:1, b:3, c:5 }, [ function(k, v){return v%2==0;} ],
              undef ],
            [ { a:1, b:3, c:5 }, [ function(k, v){return k.length > 1;}, 10 ],
              10 ],
            [ { a:1, b:2, c:3 }, [ 0, 10 ],
              10 ],
        ]);

        // invert
        Test.testMethod('invert', [
            [ { a:1, b:2, c:3 }, [],
              { '1': 'a', '2': 'b', '3': 'c' } ],
            [ { a:[1,2], b:[2,3], c:[3,4] }, [],
              { '1,2': 'a', '2,3': 'b', '3,4': 'c' } ],
        ]);

        // tap
        Test.testMethod('tap', [
            [ { a:1, b:2, c:3 }, [ function(){} ], { a:1, b:2, c:3 } ],
        ]);
        try {
            var tmp = Test.instance({ a:1, b:2, c:3 });
            t.is(Test.call(tmp, 'tap', function(){}), tmp,
                 Test.sig('tap')+' identity (1)');
            Test.call(tmp, 'tap', function(x){
                t.is(x, tmp, Test.sig('tap')+' identity (2)');
            });
            Test.call(tmp, 'tap', function(x){
                t.is(this, tmp, Test.sig('tap')+' identity (3)');
            });
        } catch (e) {
            t.error(e, Test.sig('tap')+' identity');
        }
        t.isThrown(function() {
            Test.call(Test.instance({ a:1, b:2, c:3 }), 'tap', {});
        }, TypeError, Test.sig('tap')+' throws');

        // fetch
        Test.testMethod('fetch', [
            [ { a:1, b:2, c:3, d:4 }, [ 'c' ], 3 ],
            [ { a:1, b:2, c:3, d:4 }, [ 'c', undef ], 3 ],
            [ { a:1, b:2, c:3, d:4 }, [ 'c', null ], 3 ],
            [ { a:1, b:2, c:3, d:4 }, [ 'c', 5 ], 3 ],
            [ { a:1, b:2, c:3, d:4 }, [ 'x', undef ], undef ],
            [ { a:1, b:2, c:3, d:4 }, [ 'x', null ], null ],
            [ { a:1, b:2, c:3, d:4 }, [ 'x', 5 ], 5 ],
        ]);
        t.isThrown(function() {
            Test.call(Test.instance({ a:1, b:2, c:3 }), 'fetch', 'x');
        }, H.IndexError, Test.sig('fetch')+' throws');
        t.noThrow(function() {
            Test.call(Test.instance({ a:1, b:2, c:undef }), 'fetch', 'c');
        }, Test.sig('fetch')+' does not throw for empty element');

        // store
        Test.testMethod('store', [
            [ { a:1, b:2, c:3 }, [ 'c', 5 ], { a:1, b:2, c:5 } ],
            [ { a:1, b:2, c:3 }, [ 'c', undef ], { a:1, b:2, c:undef } ],
            [ { a:1, b:2, c:3 }, [ 'x', 1 ], { a:1, b:2, c:3, x:1 } ],
        ]);
        try {
            var tmp = Test.instance({ a:1, b:2, c:3 });
            t.is(Test.call(tmp, 'store', 'c', 5), tmp,
                 Test.sig('store')+' mutates this (1)');
            t.isDeeply(tmp, { a:1, b:2, c:5 },
                 Test.sig('store')+' mutates this (2)');
        } catch (e) {
            t.error(e, Test.sig('store')+' mutates this');
        }

        // isEmpty
        Test.testMethod('isEmpty', [
            [ {}, [], true ],
            [ { a:1 }, [], false ],
            [ { '': null }, [], false ],
            [ { '': undef }, [], false ],
        ]);

        // clone
        Test.testMethod('clone', [
            [ { a:1, b:2, c:3 }, [],
              { a:1, b:2, c:3 } ],
        ]);
        try {
            var tmp = Test.instance({ a:1, b:{ x:2, y:3 }, c:5 });
            var clone = Test.call(tmp, 'clone');
            t.ok(clone != tmp,
                 Test.sig('clone')+' returns new object');
            clone.b.x = 5;
            t.is(clone.b.x, tmp.b.x, Test.sig('clone')+' is shallow copy');
        } catch (e) {
            t.error(e, Test.sig('clone'));
        }

        // member
        Test.testMethod('member', [
            [ { a:1, b:2, c:3 }, [ 3 ],
              true ],
            [ { a:1, b:2, c:3 }, [ 10 ],
              false ],
            [ { '':1, b:2, c:3 }, [ 1 ],
              true ],
        ]);

        // toArray
        Test.testMethod('toArray', [
            [ {}, [],
              [] ],
            [ { a:1, b:2, c:3 }, [],
              [ [ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ] ] ],
        ]);
    });
})(GNN.Base, GNN.Hash);
