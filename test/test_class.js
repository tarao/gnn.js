(function(B, Class) {
    var test = function(t, Hoge, Foo) {
        var n = function(name){ return t.testcase+' ('+name+')'; };

        t.isDeeply(Class.ancestors(Hoge), [], n('class hierarchy'));
        t.isDeeply(Class.ancestors(Foo), [ Hoge.prototype.constructor ],
                   n('class hierarchy'));
        t.is(Foo.$superclass, Hoge.prototype.constructor,
             n('class hierarchy'));

        var hoge = new Hoge(1, 2);
        t.ok(hoge instanceof Hoge, n('instance'));
        t.isExactly(hoge.constructor, Hoge.prototype.constructor,
                    n('class name'));
        t.is(B.className(hoge), 'HogeClass', n('class name'));
        if (hoge.__proto__) {
            t.isExactly(hoge.__proto__, Hoge.prototype , n('prototype'));
        }
        t.is(hoge.sum(), 3, n('method'));
        t.is(hoge.mul(), 2, n('method'));

        var foo = new Foo(10, 20, 30);
        t.ok(foo instanceof Hoge, n('instance'));
        t.ok(foo instanceof Foo, n('instance'));
        t.isExactly(foo.constructor, Foo.prototype.constructor,
                    n('class name'));
        t.is(B.className(hoge), 'HogeClass', n('class name'));
        if (foo.__proto__) {
            t.isExactly(foo.__proto__, Foo.prototype , n('prototype'));
        }
        t.is(foo.sum(), 60, n('method'));
        t.is(foo.mul(), 200, n('method'));
    };

    Tester.run(function(t) {
        var Hoge = Class().initializer(function HogeClass(a,b) {
            this.a=a; this.b=b;
        }).member({
            sum: function(){ return this.a+this.b; },
            mul: function(){ return this.a*this.b; }
        }).classMember({
            initialize: function(){ return 'initialize'; },
            foo: function(){ return 'hoge'; },
            bar: function(){ return 'bar'; }
        });

        var Foo = Class().initializer(function FooClass(a,b,c) {
            this.a=a; this.b=b; this.c=c;
        }).inherits(Hoge).member({
            sum: function(){
                return this.a+this.b+this.c;
            }
        }).classMember({
            foo: function(){ return 'foo'; }
        }).config({ noSuper: true });

        test(t, Hoge, Foo);

        t.is(Hoge.initialize(), 'initialize');
        t.is(Hoge.foo(), 'hoge');
        t.is(Hoge.bar(), 'bar');
        t.is(Foo.initialize(), 'initialize');
        t.is(Foo.foo(), 'foo');
        t.is(Foo.bar(), 'bar');
        t.isUndefined(new Foo(10, 20, 30).$super);
    }, 'definition by methods');

    Tester.run(function(t) {
        var Hoge = Class({
            initialize: function HogeClass(a,b) {
                this.a=a; this.b=b;
            },
            foo: function(){ return 'hoge'; },
            bar: function(){ return 'bar'; }
        }).member({
            sum: function(){ return this.a+this.b; },
            mul: function(){ return this.a*this.b; }
        });

        var Foo = GNN.Class({
            initialize: function FooClass(a,b,c) {
                this.a=a; this.b=b; this.c=c;
            },
            foo: function(){ return 'foo'; }
        }, {
            base: Hoge,
            noSuper: true,
            noSuperClassMembers: true
        }).member({
            sum: function(){
                return this.a+this.b+this.c;
            }
        });

        test(t, Hoge, Foo);

        t.isUndefined(Hoge.initialize);
        t.is(Hoge.foo(), 'hoge');
        t.is(Hoge.bar(), 'bar');
        t.isUndefined(Foo.initialize);
        t.is(Foo.foo(), 'foo');
        t.isUndefined(Foo.bar);
        t.isUndefined(new Foo(10, 20, 30).$super);
    }, 'definition by hash');

    Tester.run(function(t) {
        var Hoge = Class(function HogeClass(a,b) {
            this.a=a; this.b=b;
        }).member({
            sum: function(){ return this.a+this.b; },
            mul: function(){ return this.a*this.b; }
        }).classMember({
            initialize: function(){ return 'initialize'; },
            foo: function(){ return 'hoge'; },
            bar: function(){ return 'bar'; }
        });

        var Foo = Class(function FooClass(a,b,c) {
            this.$super(a, b); this.c=c;
        }, Hoge).member({
            sum: function(){
                return this.a+this.b+this.c;
            }
        }).classMember({
            foo: function(){ return 'foo'; }
        });

        test(t, Hoge, Foo);

        t.is(Hoge.initialize(), 'initialize');
        t.is(Hoge.foo(), 'hoge');
        t.is(Hoge.bar(), 'bar');
        t.is(Foo.initialize(), 'initialize');
        t.is(Foo.foo(), 'foo');
        t.is(Foo.bar(), 'bar');
    }, 'definition');

    Tester.run(function(t) {
        var Hoge = Class(function Hage(a,b) {
            this.a=100; this.b=500;
        }).member({
            sum: function(){ return this.a+this.b; },
            mul: function(){ return this.a*this.b; }
        }).classMember({
            initialize: function(){ return 'initialize'; },
            foo: function(){ return 'hoge'; },
            bar: function(){ return 'bar'; }
        }).initializer(function HogeClass(a,b) {
            this.a=a; this.b=b;
        });

        var Foo = Class(function FooClass(a,b,c) {
            this.$super(a, b); this.c=c;
        }, Hoge).member({
            sum: function(){
                return this.a+this.b+this.c;
            }
        }).classMember({
            foo: function(){ return 'foo'; }
        }).member({
            foo: function(){
                return this.a * this.b * this.c;
            }
        }).classMember({
            bar: function(){ return 'BAR'; }
        });

        test(t, Hoge, Foo);

        t.is(Hoge.initialize(), 'initialize');
        t.is(Hoge.foo(), 'hoge');
        t.is(Hoge.bar(), 'bar');
        t.is(Foo.initialize(), 'initialize');
        t.is(Foo.foo(), 'foo');
        t.is(Foo.bar(), 'BAR');
        t.is(new Foo(10, 20, 30).foo(), 6000);
    }, 'redefinition');

    Tester.run(function(t) {
        var Hoge = Class(function HogeClass(a,b) {
            this.a = a; this.b = b;
        }).member({
            sum: function(){ return this.a+this.b; },
            mul: function(){ return this.a*this.b; },
            join: function(c,d){ return [this.a,this.b,c,d].join('+'); }
        });

        var Foo = Class(function FooClass(a,b,c) {
            this.$super.call(this, a, b); this.c=c;
        }, Hoge).member({
            ssum: function() {
                return this.$super.sum();
            },
            smul: function() {
                return this.$super.mul();
            },
            callJoin: function() {
                return this.$super.join.call({a:5,b:6},7,8);
            },
            applyJoin: function() {
                return this.$super.join.apply({a:5,b:6},[7,8]);
            },
            sum: function(){
                return this.a+this.b+this.c;
            }
        });

        test(t, Hoge, Foo);

        var foo = new Foo(10, 20, 30);
        t.is(foo.ssum(), 30, 'super.method');
        t.is(foo.smul(), 200, 'super.method');
        t.is(foo.$super.sum(), 30, 'super.method');
        t.is(foo.$super.mul(), 200, 'super.method');
        t.is(foo.callJoin(), '5+6+7+8', 'super.method (call)');
        t.is(foo.applyJoin(), '5+6+7+8', 'super.method (apply)');
    }, 'super');
})(GNN.Base, GNN.Class);
