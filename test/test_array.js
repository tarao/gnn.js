(function(B, A) {
    Tester.run(function(t) {
        var undef;
        var undef1;

        t.ok(Test.instance(1, 2, 3) instanceof Array, 'instance');
        t.isDeeply(Test.instance(1, 2, 3), [1, 2, 3], 'value');

        // indexOf
        Test.testMethod('indexOf', [
            [ [ 1, 2, 3, 4, 1, 4 ], [ 0 ], -1 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 1 ], 0 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 2 ], 1 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 3 ], 2 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 4 ], 3 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 5 ], -1 ],
            [ [ [ 1, 2 ], [ 3, 4 ] ], [ [ 3, 4 ] ], -1 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 2, 2 ], -1 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 3, 2 ], 2 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 2, 2.3 ], -1 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 3, 2.3 ], 2 ],
            [ [ undef, null, 3, undef, 1, null ], [ null ], 1 ],
            [ [ undef, null, 3, undef, 1, null ], [ undef1 ], 0 ],
        ]);

        // lastIndexOf
        Test.testMethod('lastIndexOf', [
            [ [ 1, 2, 3, 4, 1, 4 ], [ 0 ], -1 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 1 ], 4 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 2 ], 1 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 3 ], 2 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 4 ], 5 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 5 ], -1 ],
            [ [ [ 1, 2 ], [ 3, 4 ] ], [ [ 3, 4 ] ], -1 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 3, 2 ], 2 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 4, 2 ], -1 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 3, 2.3 ], 2 ],
            [ [ 1, 2, 3, 4, 1, 4 ], [ 4, 2.3 ], -1 ],
            [ [ undef, null, 3, undef, 1, null ], [ null ], 5 ],
            [ [ undef, null, 3, undef, 1, null ], [ undef1 ], 3 ],
        ]);

        // filter
        Test.testMethod('filter', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x){return x%2!=0;} ],
              [ 1, 3, 5 ] ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x, i){return i%2!=0;} ],
              [ 2, 4, 6 ] ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x, i, t) {
                t[i] = 0;
                return i%2!=0;
            } ],
              [ 2, 4, 6 ] ],
        ]);
        try {
            var tmp = Test.instance(1, 2, 3, 4, 5, 6);
            Test.call(tmp, 'filter', function(x, i, t) {
                t[i] = 0;
                return i%2!=0;
            });
            t.isDeeply(tmp, [ 0, 0, 0, 0, 0, 0 ],
                       Test.sig('filter')+' side effect');
        } catch (e) {
            t.error(e, Test.sig('filter')+' side effect');
        }
        t.isThrown(function() {
            Test.call(Test.instance(1, 2, 3), 'filter', {});
        }, TypeError, Test.sig('filter')+' throws');

        // forEach
        var forEachR = { a: 0, b: 0, c: 0};
        Test.testMethod('forEach', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x){forEachR.a += x*x;} ],
              undef ],
            [ [ 6, 5, 4, 3, 2, 1 ], [ function(x,i){forEachR.b+=x*i;} ],
              undef ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x,i,t){t[i]=0;} ],
              undef ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x){this.c+=x*x;}, forEachR ],
              undef ],
        ]);
        t.is(forEachR.a, 91, Test.sig('forEach')+' side effect (1)');
        t.is(forEachR.b, 35, Test.sig('forEach')+' side effect with index');
        try {
            var tmp = Test.instance(1, 2, 3, 4, 5, 6);
            Test.call(tmp, 'forEach', function(x,i,t){t[i]=0;});
            t.isDeeply(tmp, [ 0, 0, 0, 0, 0, 0 ],
                       Test.sig('forEach')+' side effect (2)');
        } catch (e) {
            t.error(e, Test.sig('forEach')+' side effect (2)');
        }
        t.is(forEachR.c, 91, Test.sig('forEach')+' side effect with this');
        t.isThrown(function() {
            Test.call(Test.instance(1, 2, 3, 4), 'forEach', {});
        }, TypeError, Test.sig('forEach')+' throws');

        // every
        Test.testMethod('every', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x){return x%2==0;} ],
              false ],
            [ [ 2, 4, 6 ], [ function(x){return x%2==0;} ],
              true ],
            [ [ 6, 5, 4, 3, 2, 1 ], [ function(x,i){return (x+i)%2==0;} ],
              true ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x,i,t){t[i]=0;return x%2==0;} ],
              false ],
        ]);
        try {
            var tmp = Test.instance(1, 2, 3, 4, 5, 6);
            Test.call(tmp, 'every', function(x, i, t){t[i]=0;return x<3;});
            t.isDeeply(tmp, [ 0, 0, 0, 4, 5, 6 ],
                       Test.sig('every')+' side effect');
        } catch (e) {
            t.error(e, Test.sig('every')+' side effect');
        }
        t.isThrown(function() {
            Test.call(Test.instance(1, 2, 3, 4), 'every', {});
        }, TypeError, Test.sig('every')+' throws');

        // map
        Test.testMethod('map', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x){return x*x;} ],
              [ 1, 4, 9, 16, 25, 36 ] ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x,i,t){t[i]=0;return x*i;} ],
              [ 0, 2, 6, 12, 20, 30 ] ],
        ]);
        try {
            var tmp = Test.instance(1, 2, 3, 4, 5, 6);
            Test.call(tmp, 'map', function(x, i, t){t[i]=0;return x*i;});
            t.isDeeply(tmp, [ 0, 0, 0, 0, 0, 0 ],
                       Test.sig('map')+' side effect');
        } catch (e) {
            t.error(e, Test.sig('map')+' side effect');
        }
        t.isThrown(function() {
            Test.call(Test.instance(1, 2, 3, 4), 'map', {});
        }, TypeError, Test.sig('map')+' throws');

        // some
        Test.testMethod('some', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x){return x%2==0;} ],
              true ],
            [ [ 1, 3, 5 ], [ function(x){return x%2==0;} ],
              false ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x,i,t){t[i]=0;return x%2==0;} ],
              true ],
        ]);
        try {
            var tmp = Test.instance(1, 2, 3, 4, 5, 6);
            Test.call(tmp, 'some', function(x, i, t){t[i]=0;return x%2==0;});
            t.isDeeply(tmp, [ 0, 0, 3, 4, 5, 6 ],
                       Test.sig('some')+' side effect');
        } catch (e) {
            t.error(e, Test.sig('some')+' side effect');
        }
        t.isThrown(function() {
            Test.call(Test.instance(1, 2, 3, 4), 'some', {});
        }, TypeError, Test.sig('some')+' throws');

        // reduce
        Test.testMethod('reduce', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(r, x){return r+x;}, 0 ],
              21 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(r, x){return r-x;}, 0 ],
              -21 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(r, x){return r+x;} ],
              21 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(r, x){return r-x;} ],
              -19 ],
            [ [ 1, 2, 3 ], [ function(r, x){return r.concat([x]);}, [] ],
              [ 1, 2, 3 ] ],
        ]);
        t.isThrown(function() {
            Test.call(Test.instance(1, 2, 3, 4), 'reduce', {});
        }, TypeError, Test.sig('reduce')+' throws');
        t.isThrown(function() {
            Test.call(Test.instance(), 'reduce', function(){});
        }, TypeError, Test.sig('reduce')+' throws');

        // reduceRight
        Test.testMethod('reduceRight', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(r, x){return r+x;}, 0 ],
              21 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(r, x){return r-x;}, 0 ],
              -21 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(r, x){return r+x;} ],
              21 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(r, x){return r-x;} ],
              -9 ],
            [ [ 1, 2, 3 ], [ function(r, x){return r.concat([x]);}, [] ],
              [ 3, 2, 1 ] ],
        ]);
        t.isThrown(function() {
            Test.call(Test.instance(1, 2, 3, 4), 'reduceRight', {});
        }, TypeError, Test.sig('reduceRight')+' throws');
        t.isThrown(function() {
            Test.call(Test.instance(), 'reduceRight', function(){});
        }, TypeError, Test.sig('reduceRight')+' throws');

        // tap
        Test.testMethod('tap', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(){} ], [ 1, 2, 3, 4, 5, 6 ] ],
        ]);
        try {
            var tmp = Test.instance(1, 2, 3, 4);
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
            Test.call(Test.instance(1, 2, 3, 4), 'tap', {});
        }, TypeError, Test.sig('tap')+' throws');

        // zmap
        Test.testMethod('zmap', [
            [ [ 1, 2 ], [ function(x, y, z){return x*y*z}, [3,4], [5,6] ],
              [ 15, 48 ] ],
            [ [ 1, 2 ], [ null, [3,4], [5,6] ],
              [ [ 1, 3, 5 ], [ 2, 4, 6 ] ] ],
            [ [ 1, 2 ], [ function(x, y, z){return x||y||z}, [3,4,7], [5,6] ],
              [ 1, 2, 7 ] ],
        ]);

        // find
        Test.testMethod('find', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x){return x%2==0;} ],
              2 ],
            [ [ 1, 3, 5 ], [ function(x){return x%2==0;} ],
              undef ],
            [ [ 1, 3, 5 ], [ function(x){return x%2==0;}, 10 ],
              10 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 3 ], 3 ],
        ]);

        // findLast
        Test.testMethod('findLast', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x){return x%2==0;} ],
              6 ],
            [ [ 1, 3, 5 ], [ function(x){return x%2==0;} ],
              undef ],
            [ [ 1, 3, 5 ], [ function(x){return x%2==0;}, 10 ],
              10 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 3 ], 3 ],
        ]);

        // groupBy
        Test.testMethod('groupBy', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ function(x){return x%3;} ],
              { 0: [ 3, 6], 1: [1, 4], 2: [2, 5] } ],
        ]);
        t.isThrown(function() {
            Test.call(Test.instance(1, 2, 3, 4), 'groupBy', {});
        }, TypeError, Test.sig('groupBy')+' throws');

        // flatten
        Test.testMethod('flatten', [
            [ [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ], [],
              [ 1, 2, 3, 4, 5, 6 ] ],
            [ [ [ 1, [ 2 ] ], [ 3, [ 4, [ 5, 6 ] ] ] ], [],
              [ 1, 2, 3, 4, 5, 6 ] ],
        ]);
        t.isThrown(function() {
            var tmp = Test.instance(1, 2, 3, 4);
            tmp[1] = tmp;
            Test.call(tmp, 'flatten');
        }, A.ArgumentError, Test.sig('flatten')+' throws');

        // at
        Test.testMethod('at', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ 3 ], 4 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 8 ], undef ],
        ]);

        // fetch
        Test.testMethod('fetch', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ 3 ], 4 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 3, undef ], 4 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 3, null ], 4 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 3, 5 ], 4 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 8, undef ], undef1 ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 8, null ], null ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 8, 5 ], 5 ],
        ]);
        t.isThrown(function() {
            Test.call(Test.instance(1, 2, 3, 4, 5, 6), 'fetch', 6);
        }, A.IndexError, Test.sig('fetch')+' throws');
        t.noThrow(function() {
            Test.call(Test.instance(1, 2, 3, 4, 5, 6, undef, 8), 'fetch', 6);
            Test.call(Test.instance(1, 2, 3, 4, 5, 6, undef), 'fetch', 6);
        }, Test.sig('fetch')+' does not throw for empty element');

        // store
        Test.testMethod('store', [
            [ [ 1, 2, 3, 4 ], [ 2, 5 ], [ 1, 2, 5, 4 ] ],
            [ [ 1, 2, 3, 4 ], [ 2 ], [ 1, 2, undef, 4 ] ],
            [ [ 1, 2, 3, 4 ], [ 5, 1 ], [ 1, 2, 3, 4, undef, 1, ] ],
        ]);
        try {
            var tmp = Test.instance(1, 2, 3, 4);
            t.is(Test.call(tmp, 'store', 2, 6), tmp,
                 Test.sig('store')+' mutates this (1)');
            t.isDeeply(tmp, [ 1, 2, 6, 4 ],
                 Test.sig('store')+' mutates this (2)');
        } catch (e) {
            t.error(e, Test.sig('store')+' mutates this');
        }

        // zip
        Test.testMethod('zip', [
            [ [ 1, 2 ], [ [3,4], [5,6] ],
              [ [ 1, 3, 5 ], [ 2, 4, 6 ] ] ],
            [ [ 1, 2 ], [ [3,4,7], [5,6] ],
              [ [ 1, 3, 5 ], [ 2, 4, 6 ], [ undef, 7, undef ] ] ],
        ]);

        // compact
        Test.testMethod('compact', [
            [ [ 1, undef, 2, 3, 4, null, 5 ], [],
              [ 1, 2, 3, 4, 5 ] ],
        ]);

        // member
        Test.testMethod('member', [
            [ [ 1, 2, 3, 4, 5, 6 ], [ 2 ],
              true ],
            [ [ 1, 2, 3, 4, 5, 6 ], [ 10 ],
              false ],
        ]);

        // isEmpty
        Test.testMethod('isEmpty', [
            [ [], [], true ],
            [ [ 1, 2 ], [], false ],
            [ [ null ], [], false ],
            [ [ undef ], [], false ],
        ]);

        // clone
        Test.testMethod('clone', [
            [ [ 1, 2, 3, 4, 5, 6 ], [],
              [ 1, 2, 3, 4, 5, 6 ] ],
        ]);
        try {
            var tmp = Test.instance(1, [ 2, 3 ], 4);
            var clone = Test.call(tmp, 'clone');
            t.ok(clone != tmp,
                 Test.sig('clone')+' returns new object');
            clone[1][0] = 5;
            t.is(clone[1][0], tmp[1][0], Test.sig('clone')+' is shallow copy');
        } catch (e) {
            t.error(e, Test.sig('clone'));
        }
    });
})(GNN.Base, GNN.Array);
