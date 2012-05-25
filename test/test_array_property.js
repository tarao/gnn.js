(function(B, A) {
    Tester.run(function(t) {
        t.is(Test.instance(1, 2, 3).first, 1, Test.sig('first'));
        t.is(Test.instance(1, 2, 3).last, 3, Test.sig('first'));
        var tmp = Test.instance(1, 2, 3);
        tmp.first = 5;
        tmp.last = 10;
        t.is(tmp[0], 5, Test.sig('first')+' setter');
        t.is(tmp[2], 10, Test.sig('last')+' setter');

        var inputs = [ 2, 1, 0 ];
        for (var i=0; i < inputs.length; i++) {
            var arr = Test.instance(1, 2, 3, 4);
            var first = A.first(arr, inputs[i]);
            t.ok(A.isExtendedArray(first),
                 'GNN.Array.first returns an extended array');
            var last = A.last(arr, inputs[i]);
            t.ok(A.isExtendedArray(last),
                 'GNN.Array.last returns an extended array');
        }
    });

})(GNN.Tester.Base, GNN.Array);
