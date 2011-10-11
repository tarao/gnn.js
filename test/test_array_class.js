var Test = (function(B, A) { return {
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
                t.isDeeply(this.apply(self ,method, d[1]), d[2],
                           this.name+'.'+method+ppargs);
            }
        } catch (e) {
            t.error(e+'', m);
        }
    }
}; })(GNN.Base, GNN.Array);
