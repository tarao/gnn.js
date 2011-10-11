(function(B) {
    Tester.run(function(t) {
        t.is(B.isDefined(GNN), true);
        t.is(B.isDefined(GNN.Base), true);

        var undef;
        t.is(B.isDefined(undef), false);

        t.is(B.isCallable(function(){}), true);
        t.is(B.isCallable(B.noop), true);
        t.is(B.isCallable(undef), false);
        t.is(B.isCallable(1), false);
        t.is(B.isCallable({}), false);

        t.is(B.respondTo(undef, 'm'), false);
        t.is(B.respondTo({ m: function(){} }, 'm'), true);
        t.is(B.respondTo({ m: {} }, 'm'), false);
        t.is(B.respondTo({}, 'm'), false);
    });

    Tester.run(function(t) {
        var Klass = function() {
            this.hoge = 'hoge';
        };
        var obj = new Klass();

        var proto = {
            fun: function() {
                return this.hoge + 'foo';
            }
        };

        var x=0;
        B.setProto(obj, proto, function(o, p) {
            x = p.fun.call(o);
        });
        if (B.isDefined(obj.__proto__)) {
            t.is(obj.fun(), 'hogefoo', '__proto__');
        } else {
            t.is(x, 'hogefoo', 'no __proto__');
        }

        B.addProperty(obj, 'foo', {
            get: function(){ return this.hoge + this.hoge; },
            set: function(v){ this.hoge = v; }
        });
        t.is(obj.foo, 'hogehoge');
        obj.foo = 'foo';
        t.is(obj.foo, 'foofoo');

        B.addProperties(obj, {
            bar: {
                get: function(){ return this.hoge + 'bar' }
            },
            baz: {
                set: function(v){ this.hoge = v+'baz' }
            }
        });
        t.is(obj.bar, 'foobar');
        obj.baz = 'hoge';
        t.is(obj.bar, 'hogebazbar');
    });

    Tester.run(function(t) {
        t.isDeeply(B.merge(null, {a:1,b:2}), {a:1,b:2});
        t.isDeeply(B.merge(null, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.isDeeply(B.merge({a:1,b:2}, {b:3}), {a:1,b:3});
        t.isDeeply(B.merge({a:1,b:2}, {b:3}, {a:2,c:4}), {a:2,b:3,c:4});

        var a = null; var b = {a:1,b:2};
        t.isDeeply(B.merge(a, {a:1,b:2}), {a:1,b:2});
        t.is(a, null);
        t.isDeeply(B.merge(a, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.is(a, null);
        t.isDeeply(B.merge(b, {b:3}), {a:1,b:3});
        t.isDeeply(b, {a:1,b:3});

        t.isDeeply(B.merge({a:{b:1,c:2},d:{e:3,f:4}},{a:{b:2}}),
                   {a:{b:2},d:{e:3,f:4}});
    });

    Tester.run(function(t) {
        t.isDeeply(B.dmerge(null, {a:1,b:2}), {a:1,b:2});
        t.isDeeply(B.dmerge(null, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.isDeeply(B.dmerge({a:1,b:2}, {b:3}), {a:1,b:3});
        t.isDeeply(B.dmerge({a:1,b:2}, {b:3}, {a:2,c:4}), {a:2,b:3,c:4});

        var a = null; var b = {a:1,b:2};
        t.isDeeply(B.dmerge(a, {a:1,b:2}), {a:1,b:2});
        t.is(a, null);
        t.isDeeply(B.dmerge(a, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.is(a, null);
        t.isDeeply(B.dmerge(b, {b:3}), {a:1,b:3});
        t.isDeeply(b, {a:1,b:3});

        t.isDeeply(B.dmerge({a:{b:1,c:2},d:{e:3,f:4}},{a:{b:2}}),
                   {a:{b:2,c:2},d:{e:3,f:4}});
    });

    Tester.run(function(t) {
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, null, {a:1,b:2}), {a:1,b:2});
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, null, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, {a:1,b:2}, {b:3}), {a:1,b:2});
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, {a:1,b:2}, {b:3}, {a:2,c:4}), {a:1,b:2,c:4});

        var a = null; var b = {a:1,b:2};
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, a, {a:1,b:2}), {a:1,b:2});
        t.is(a, null);
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, a, {a:1,b:2}, {c:3}), {a:1,b:2,c:3});
        t.is(a, null);
        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, b, {b:3}), {a:1,b:2});
        t.isDeeply(b, {a:1,b:2});

        t.isDeeply(B.fmerge(function(x,y,k) {
            return x || y;
        }, {a:{b:1,c:2},d:{e:3,f:4}},{a:{b:2}}),
                   {a:{b:1,c:2},d:{e:3,f:4}});
    });
})(GNN.Base);
