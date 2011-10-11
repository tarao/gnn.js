(function(B) {
    Tester.run(function(t) {
        t.is(Test.instance(1, 2, 3).first, 1, Test.sig('first'));
        t.is(Test.instance(1, 2, 3).last, 3, Test.sig('first'));
        var tmp = Test.instance(1, 2, 3);
        tmp.first = 5;
        tmp.last = 10;
        t.is(tmp[0], 5, Test.sig('first')+' setter');
        t.is(tmp[2], 10, Test.sig('last')+' setter');
    });
})(GNN.Base);
