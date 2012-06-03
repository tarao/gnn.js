(function(B, Class) {
    var className = function(klass) {
        return B.className(B.isCallable(klass) ? klass.prototype : klass);
    };
    var test = function(t, Hoge, Foo) {
        var n = function(name){ return t.testcase+' ('+name+')'; };

        t.isDeeply(Class.ancestors(Hoge), [
            Object.prototype.constructor
        ], n('class hierarchy'));
        t.isDeeply(Class.ancestors(Foo), [
            Hoge.prototype.constructor, Object.prototype.constructor
        ], n('class hierarchy'));
        t.is(Class.superclass(Foo), Hoge.prototype.constructor,
             n('class hierarchy'));

        var hoge = new Hoge(1, 2);
        t.ok(hoge instanceof Hoge, n('instance'));
        t.isExactly(hoge.constructor, Hoge.prototype.constructor,
                    n('class name'));
        t.is(className(hoge), 'HogeClass', n('class name'));
        t.is(className(Hoge), 'HogeClass', n('class name'));
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
        t.is(className(foo), 'FooClass', n('class name'));
        t.is(className(Foo), 'FooClass', n('class name'));
        if (foo.__proto__) {
            t.isExactly(foo.__proto__, Foo.prototype , n('prototype'));
        }
        t.is(foo.sum(), 60, n('method'));
        t.is(foo.mul(), 200, n('method'));

        t.is(hoge.greater, 2, n('properties'));
        t.is(foo.greater, 20, n('properties'));
        t.is(foo.max, 30, n('properties'));
    };

    Tester.run(function(t) {
        var Hoge = Class().initializer(function HogeClass(a,b) {
            this.a=a; this.b=b;
        }).member({
            sum: function(){ return this.a+this.b; },
            mul: function(){ return this.a*this.b; }
        }).accessor({
            greater: { get: function() {
                return this.a > this.b ? this.a : this.b;
            } }
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
        }).accessor({
            max: { get: function() {
                var g = this.greater;
                return g > this.c ? g : this.c;
            } }
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
        }).accessor({
            greater: { get: function() {
                return this.a > this.b ? this.a : this.b;
            } }
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
        }).accessor({
            max: { get: function() {
                var g = this.greater;
                return g > this.c ? g : this.c;
            } }
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
        }).accessor({
            greater: { get: function() {
                return this.a > this.b ? this.a : this.b;
            } }
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
        }).accessor({
            max: { get: function() {
                var g = this.greater;
                return g > this.c ? g : this.c;
            } }
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
        }).accessor({
            greater: { get: function() {
                return this.a > this.b ? this.a : this.b;
            } },
            min: { get: function() {
                return this.a < this.b ? this.a : this.b;
            } }
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
        }).accessor({
            max: { get: function() {
                var g = this.greater;
                return g > this.c ? g : this.c;
            } },
            min: { get: function() {
                var s = this.a < this.b ? this.a : this.b;
                return s < this.c ? s : this.c;
            } }
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
        t.is(new Foo(30, 20, 10).min, 10);
    }, 'redefinition');

    Tester.run(function(t) {
        var undef;

        var Hoge = Class(function HogeClass(a,b) {
            this.a = a; this.b = b;
        }).member({
            sum: function(){ return this.a+this.b; },
            mul: function(){ return this.a*this.b; },
            squareSum: function() {
                return this.a*this.a + this.b*this.b;
            },
            rec: function(n) {
                return n;
            },
            mul2: function(x, y) {
                return x * y;
            },
            fact: function(n) {
                if (n <= 1) return 1;
                return this.mul2(n, this.fact(n-1));
            },
            join: function(c,d){ return [this.a,this.b,c,d].join('+'); },
            getSuper: function() {
                return this.$super;
            },
            callSum: function(self) {
                return self.sum();
            }
        }).accessor({
            greater: { get: function() {
                return this.a > this.b ? this.a : this.b;
            } },
            min: { get: function() {
                return this.a < this.b ? this.a : this.b;
            } },
            _foo: { value: 'foo' },
            constValue: { value: 'this cannot be overwritten',
                          writable: false }
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
            sum: function(){
                return this.a+this.b+this.c;
            },
            mul2: function(x, y) {
                return { log: [x].concat(y.log),
                         val: this.$super.mul2(x, y.val) };
            },
            fact: function(n) {
                if (n <= 1) return { log: [n], val: 1 };
                return this.$super.fact(n);
            },
            squareSum: function() {
                return this.$super.squareSum() + this.c*this.c;
            },
            rec: function(n) {
                if (n > 100) return -1;
                return this.$super.rec(n+1);
            },
            callJoin: function() {
                return this.$super.join.call({a:5,b:6},7,8);
            },
            applyJoin: function() {
                return this.$super.join.apply({a:5,b:6},[7,8]);
            }
        }).accessor({
            max: { get: function() {
                var g = this.greater;
                return g > this.c ? g : this.c;
            } },
            min: { get: function() {
                var s = this.$super.min;
                return s < this.c ? s : this.c;
            } },
            val: { value: 'aaa' },
            setFoo: { set: function(val) {
                this._foo = val;
            } }
        });

        test(t, Hoge, Foo);

        var foo = new Foo(10, 20, 30);
        t.is(foo.ssum(), 30, '$super.method');
        t.is(foo.smul(), 200, '$super.method');
        t.is(foo.callJoin(), '5+6+7+8', '$super.method (call)');
        t.is(foo.applyJoin(), '5+6+7+8', '$super.method (apply)');
        t.is(new Foo(30, 20, 10).min, 10, '$super.prop');

        var Bar = Class(function BarClass(a,b,c,d) {
            this.$super(a, b, c); this.d = d;
        }, Foo).member({
            mul: function() {
                return this.$super.mul() * this.d;
            },
            sum: function() {
                return this.$super.sum() + this.d;
            },
            squareSum: function() {
                return this.$super.squareSum() + this.d*this.d;
            },
            rec: function(n) {
                return this.$super.rec(n+2);
            },
            callJoin: function() {
                return this.$super.callJoin();
            },
            modifyVal: function() {
                this.$super.val = 'bbb';
            },
            modifyFoo: function() {
                this.$super.setFoo = 'bar';
            },
            save$super: function() {
                var sup = this.$super;
                return this.mul() + sup.sum();
            },
            pass$super: function() {
                return this.callSum(this.$super);
            }
        }).accessor({
            greater: { get: function() {
                var g = this.$super.greater;
                return g * -1;
            } },
            max: { get: function() {
                var m = this.$super.max;
                return m > this.d ? m : this.d;
            } },
            getBar: { get: function() {
                return this.$super.getBar;
            } },
            _bar: { value: 'aaa' },
            setFoo: { set: function(val) {
                this._bar = val;
            } },
            tryToWriteConstValue: {
                set: function(val) {
                    this.$super.constValue = val;
                }
            }
        });

        var n = function(name){ return t.testcase+' ('+name+')'; };

        t.isDeeply(Class.ancestors(Bar), [
            Foo.prototype.constructor,
            Hoge.prototype.constructor,
            Object.prototype.constructor
        ], n('class hierarchy'));
        t.is(Class.superclass(Bar), Foo.prototype.constructor,
             n('class hierarchy'));

        var bar = new Bar(10, 20, 30, 40);
        t.ok(bar instanceof Bar, n('instance'));
        t.isExactly(bar.constructor, Bar.prototype.constructor,
                    n('class name'));
        t.is(className(bar), 'BarClass', n('class name'));
        t.is(className(Bar), 'BarClass', n('class name'));
        if (bar.__proto__) {
            t.isExactly(bar.__proto__, Bar.prototype , n('prototype'));
        }

        t.is(bar.a, 10);
        t.is(bar.b, 20);
        t.is(bar.c, 30);
        t.is(bar.d, 40);

        t.is(bar.sum(), 100, '$super.method');
        t.is(bar.mul(), 8000, '$super.method');
        t.is(bar.squareSum(), 3000, '$super.method');
        t.is(bar.rec(0), 3, '$super.method');
        t.isDeeply(bar.fact(3), { log: [3, 2, 1], val: 6 }, '$super.method');
        t.is(bar.callJoin(), '5+6+7+8', '$super.method');
        t.is(bar.save$super(), 8060, '$super.method');
        t.is(bar.pass$super(), 60, '$super.method');

        t.is(bar.max, 40, '$super.property');
        t.is(bar.greater, -20, '$super.property');
        t.is(bar.getBar, undef, '$super.property');

        t.is(foo.val, 'aaa', '$super.property setter');
        t.is(foo._foo, 'foo', '$super.property setter');

        t.is(bar.val, 'aaa', '$super.property setter');
        bar.modifyVal();
        t.is(bar.val, 'bbb', '$super.property setter');
        t.is(bar._foo, 'foo', '$super.property setter');
        t.is(bar._bar, 'aaa', '$super.property setter');
        bar.modifyFoo();
        t.is(bar._foo, 'bar', '$super.property setter');
        t.is(bar._bar, 'aaa', '$super.property setter');
        t.is(bar.setFoo = 'hoge', 'hoge', '$super.property stter');
        t.is(bar._foo, 'bar', '$super.property setter');
        t.is(bar._bar, 'hoge', '$super.property setter');

        t.is(bar.constValue, 'this cannot be overwritten',
             '$super.property const');
        t.is(bar.tryToWriteConstValue = 10, 10, '$super.property const');
        t.is(bar.constValue, 'this cannot be overwritten',
             '$super.property const');

        t.isThrown(function() {
            bar.$super;
        }, TypeError, '$super cannot be called from outside');

        t.isThrown(function() {
            bar.$super.sum;
        }, TypeError, '$super cannot be called from outside');

        t.noThrow(function() {
            new Hoge(1,2).getSuper();
        }, '$super can be retrieved via method');
        t.is(new Hoge(1,2).getSuper(), undef,
             '$super of toplevel class is undefined');
    }, '$super');

    Tester.run(function(t) {
        var n = function(name){ return t.testcase+' ('+name+')'; };

        var Hoge = Class(function Hage(a,b) {
            this.a=a; this.b=b;
        });

        var Foo = Class(function FooClass(a,b,c) {
            this.$super(a, b); this.c=c;
        }, Hoge).member({
            foo: function() {
                return this.$super.hoge() + 'Foo';
            },
            bar: function() {
                return this.$super.bar() + 'Foo';
            }
        });

        Hoge.member({
            hoge: function(){ return this.a + 'hoge:' + 'Hoge'; },
            bar: function(){ return this.b + 'bar:' + 'Hoge'; }
        });

        var hoge = new Hoge(1, 2);
        var foo = new Foo(1, 2, 3);

        t.is(hoge.hoge(), '1hoge:Hoge');
        t.is(hoge.bar(), '2bar:Hoge');

        if (typeof Proxy != 'undefined') {
            t.is(foo.foo(), '1hoge:HogeFoo', n('Proxy'));
        } else {
            t.isThrown(function() {
                foo.foo();
            }, TypeError, n('no Proxy'));
        }
        t.noThrow(function() {
            foo.bar();
        });
        t.is(foo.bar(), '2bar:HogeFoo');

        Foo.inherits(Hoge);
        var foo2 = new Foo(4, 5, 6);
        t.noThrow(function() {
            foo2.foo();
        });
        t.is(foo2.foo(), '4hoge:HogeFoo');
    }, '$super and redefinition');
})(GNN.Tester.Base, GNN.Class);
