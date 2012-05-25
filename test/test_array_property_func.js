(function(B) {
    Tester.run(function(t) {
        t.is(Test.call(Test.instance(1, 2, 3), 'first'), 1, Test.sig('first'));
        t.is(Test.call(Test.instance(1, 2, 3), 'last'), 3, Test.sig('first'));

        t.isDeeply(Test.call(Test.instance(1, 2, 3, 4, 5), 'first', 3),
                   [ 1, 2, 3 ], Test.sig('first'));
        t.isDeeply(Test.call(Test.instance(1, 2, 3, 4, 5), 'first', 1),
                   [ 1 ], Test.sig('first'));
        t.isDeeply(Test.call(Test.instance(1, 2, 3, 4, 5), 'first', 0),
                   [ ], Test.sig('first'));
        t.isDeeply(Test.call(Test.instance(1, 2, 3, 4, 5), 'last', 3),
                   [ 3, 4, 5 ], Test.sig('last'));
        t.isDeeply(Test.call(Test.instance(1, 2, 3, 4, 5), 'last', 1),
                   [ 5 ], Test.sig('last'));
        t.isDeeply(Test.call(Test.instance(1, 2, 3, 4, 5), 'last', 0),
                   [ ], Test.sig('last'));

        var inputs = [ 2, 1, 0 ];
        for (var i=0; i < inputs.length; i++) {
            var arr = Test.instance(1, 2, 3, 4);
            var first = Test.call(arr, 'first', inputs[i]);
            t.ok(!Test.klass.isExtendedArray(first) && first instanceof Array,
                 'GNN.Array.first returns an ordinary array');
            var last = Test.call(arr, 'last', inputs[i]);
            t.ok(!Test.klass.isExtendedArray(last) && last instanceof Array,
                 'GNN.Array.last returns an ordinary array');
        }
    });
})(GNN.Tester.Base);
