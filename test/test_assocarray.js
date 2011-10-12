(function(B, AA) {
    var undef;

    Tester.run(function(t) {
        t.ok(Test.instance(1, 2, 3) instanceof Array, 'instance');
        t.isDeeply(Test.instance(1, 2, 3), [1, 2, 3], 'value');
    });

    // assoc
    Test.testMethod('assoc', [
        [ [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ], [ 3 ], [ 3, 4 ] ],
        [ [ [ 1, 2 ], [ 3, 4 ], [ 1, 4 ] ], [ 1 ], [ 1, 2 ] ],
        [ [ [ null, 2 ], [ undef, 4 ], [ 1, 4 ] ], [ null ], [ null, 2 ] ],
        [ [ [ null, 2 ], [ undef, 4 ], [ 1, 4 ] ], [ undef ], [ undef, 4 ] ],
    ]);

    // rassoc
    Test.testMethod('rassoc', [
        [ [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ], [ 3 ], [ 3, 4 ] ],
        [ [ [ 1, 2 ], [ 3, 4 ], [ 1, 4 ] ], [ 1 ], [ 1, 4 ] ],
        [ [ [ null, 2 ], [ undef, 4 ], [ 1, 4 ] ], [ null ], [ null, 2 ] ],
        [ [ [ null, 2 ], [ undef, 4 ], [ 1, 4 ] ], [ undef ], [ undef, 4 ] ],
    ]);

    // assocv
    Test.testMethod('assocv', [
        [ [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ], [ 3 ], 4 ],
        [ [ [ 1, 2 ], [ 3, 4 ], [ 1, 4 ] ], [ 1 ],  2 ],
        [ [ [ null, 2 ], [ undef, 4 ], [ 1, 4 ] ], [ null ], 2 ],
        [ [ [ null, 2 ], [ undef, 4 ], [ 1, 4 ] ], [ undef ], 4 ],
    ]);

    // rassocv
    Test.testMethod('rassocv', [
        [ [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ], [ 3 ], 4 ],
        [ [ [ 1, 2 ], [ 3, 4 ], [ 1, 4 ] ], [ 1 ], 4 ],
        [ [ [ null, 2 ], [ undef, 4 ], [ 1, 4 ] ], [ null ], 2 ],
        [ [ [ null, 2 ], [ undef, 4 ], [ 1, 4 ] ], [ undef ], 4 ],
    ]);
})(GNN.Base, GNN.AssocArray);
