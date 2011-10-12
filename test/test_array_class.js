var Test = (function(B, A) {
    var test = {
        klass: A,
        name: 'GNN.Array',
        delim: '.',
        sig: function(m){ return this.name+this.delim+m; },
        instance: function(){ return Array.prototype.slice.call(arguments); },
        call: function(self, m, args) {
            args = Array.prototype.slice.call(arguments);
            args = args.slice(2);
            return this.apply(self, m, args);
        },
        apply: function(self, m, args) {
            return this.klass[m].apply(null, [self].concat(args));
        },
        testMethod: function(method, defs) {
            var t = Tester;
            var m = this.sig(method);
            try {
                t.ok(B.isCallable(this.klass[method]), m+' is defined');
                for (var i=0; i < defs.length; i++) {
                    if (!defs[i]) break;
                    var d = defs[i];
                    var self = this.instance.apply(this, d[0]||[1,2,3]);
                    var ppargs = t.pp([self].concat(d[1]));
                    ppargs = ppargs.replace(/^\[(.*)\]$/, '($1)');
                    var ret = this.apply(self ,method, d[1]);
                    t.isDeeply(ret, d[2], this.name+'.'+method+ppargs);

                    if (A.member(A._preserveReturnValue, method)) {
                        t.ok(!A.isExtendedArray(ret) && ret instanceof Array,
                             m+' does not return a '+this.name + ' but Array');
                    }
                }
            } catch (e) {
                t.error(e, m);
            }
        }
    };

    Tester.run(function(t) {
        t.ok(A.isExtendedArray(new A()),
             'a '+test.name+' is an exteded array');
        t.ok(!A.isExtendedArray(new Array()),
             'an Array is not an exteded array');
    });

    return test;
})(GNN.Base, GNN.Array);
