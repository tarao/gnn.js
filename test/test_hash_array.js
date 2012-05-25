(function(B, H, A, AA) {
    Tester.run(function(t) {
        var h = { a:1, b:2, c:3 };
        var a = [ 'a', 1, 'b', 2, 'c', 3 ];
        var aa = new AA([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);

        t.isDeeply(new H(h), h, 'hash to hash');
        t.isDeeply(H(h), h, 'hash to hash');

        t.isDeeply(new H(a), h, 'array to hash');
        t.isDeeply(H(a), h, 'array to hash');

        t.isDeeply(new H(aa), h, 'associative array to hash');
        t.isDeeply(H(aa), h, 'associative array to hash');

        t.isDeeply(H(AA.fromArray(H(h).toArray())), H(aa),
                   'hash to associative array');
    });
})(GNN.Tester.Base, GNN.Hash, GNN.Array, GNN.AssocArray);
