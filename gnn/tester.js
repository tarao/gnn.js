[ 'GNN', function(global) {
    var ns = this.pop();
    if (typeof global[ns] == 'undefined') global[ns] = {};
    var T = global[ns];
    var B = T.Base;

    /**
        Creates a test server.
        @class A server for automated tests.
        @name Tester
        @exports Tester as GNN.Tester
        @param prefix
            The directories of files.
        @param {string} prefix.include
            The directory of preloaded files.
        @param {string} prefix.run
            The directory of test files.
        @param tests
            A list of test suites.
        @param {string} tests[i].id
            The name of the test suite.
        @param {string|string[]} tests[i].include
            Preloaded file(s) for the test.
        @param {string|string[]} tests[i].run
            Test file(s).
        @param {HTMLElement} parent
            A parent node to hold iframes of test environment.
        @param callbacks
            Callback functions called for each events of test server.
            The first argument of the callback is a test definition (an item
            of <code>tests</code>).
            The rest of arguments are the same as those of corresponding
            methods of test server.
        @param {function} callbacks.begin
            Called at the beginning of <code>this.next</code>.
        @param {function} callback.progress
            Called when <code>this.progress</code> is called.
        @param {function} callback.end
            Called when <code>this.finished</code> is called.
        @see GNN.Tester-TestHandler
        @requires GNN.Base
        @example
var prefix = { include: '../gnn', run: '.' };
var tests = [
  { id: 'Array',
    include: [ 'base.js', 'array.js' ],
    run: 'test_array.js' },
  { id: 'Class',
    include: [ 'base.js', 'class.js' ],
    run: 'test_class.js' },
];

new GNN.Tester(prefix, tests, document.getElementById('frames'), {
    begin: function(t) {
        ...
    },
    progress: function(t, passed, detail) {
        ...
    },
    end: function(t, summary) {
        if (summary.passed < sumary.total) {
            alert('some tests failed!');
        }
    }
});
    */
    T.Tester = function(prefix, tests, parent, callbacks) {
        var current = 0;
        callbacks = callbacks||{};
        callbacks.begin = callbacks.begin || function(){};
        callbacks.end = callbacks.end || function(){};
        callbacks.progress = callbacks.progress || function(){};

        /**
            Creates a test client.
            @class A client for automated tests.
            @param {GNN.Tester} parent The test server.
            @description
                The client is set up by the test server in a test environment.
                Inside the environment, the instance of the client is
                accessible as
                <code>GNN.Tester</code> or simply <code>Tester</code>.
                The client is used in each test environment to run tests and
                reports the result to the test server.
            @see GNN.Tester
            @requires GNN.Base
            @example
// in test_something.js

Tester.run(function(t) {
    t.ok(true);
}, 'test case 1');

Tester.run(function(t) {
    t.error('fail!');
}, 'test case 2');
        */
        var TestHandler = function(parent) {
            var total = 0;
            var passed = 0;
            var startTime = new Date().getTime();

            return /** @lends Tester-TestHandler.prototype */ {
                /**
                    The name of the test suite.
                    @type string
                */
                name: parent.t.name,
                /**
                    Prevents the test suite to be automatically finished.
                    @type boolean
                    @description
                        This should be set <code>true</code> when testing,
                        for example, an asynchronous calls.
                        When it is <code>true</code>,
                        <code>this.finish()</code> must be explicitly called
                        to finish the test suite.
                    @see GNN.Tester-TestHandler#finish
                */
                wait: null,
                /**
                    Opens a test case.
                    @param {function} test
                        A callback function which takes a test client.
                    @param {string} testcase
                        The name of the test case.
                    @example
Tester.run(function(t) {
    t.ok(true);
}, 'the name of this test case');
                */
                run: function(test, testcase) {
                    try {
                        this.testcase = testcase;
                        test(this);
                        this.testcase = null;
                    } catch (e) {
                        this.error(e);
                    }
                },
                /**
                    Finishes the test suite and reports to the server.
                    @description
                        It is called automatically when loading the test
                        script is done. To prevent the automatic call,
                        set <code>this.wait = true</code>.
                    @see GNN.Tester-TestHandler#wait
                */
                finish: function() {
                    parent.finished({
                        time: new Date().getTime() - startTime,
                        total: total,
                        passed: passed,
                        failed: total - passed
                    });
                },
                loaded: function(){ if (!this.wait) this.finish(); },

                // assertions
                /**
                    Reports a failure with the error message.
                    @param msg
                    @param {string} msg.toString()
                        The error message.
                    @param {number} [msg.lineNumber]
                        The line number of the error.
                    @param {number} [msg.fileName]
                        The file in which the error occurred.
                    @param {string} [name]
                        The name of the test case.
                */
                error: function(msg, name) {
                    msg = msg || '';
                    if (typeof msg != 'string') {
                        msg = [
                            msg+'', msg.lineNumber, msg.fileName
                        ].join(', ');
                    }
                    this.log(false, { name: name, message: msg });
                },
                /**
                    Assertion that the two values are equal.
                    @param {*} obj
                    @param {*} expected
                    @param {string} [name]
                        The name of the test case.
                    @description
                        It fails unless <code>obj == expected</code>.
                */
                is: function(obj, expected, name) {
                    this.log(obj == expected, {
                        name: name,
                        returned: obj,
                        expected: expected
                    });
                },
                /**
                    Assertion that the two values are exactly the same.
                    @param {*} obj
                    @param {*} expected
                    @param {string} [name]
                        The name of the test case.
                    @description
                        It fails unless <code>obj === expected</code>.
                */
                isExactly: function(obj, expected, name) {
                    this.log(obj === expected, {
                        name: name,
                        returned: obj,
                        expected: expected
                    });
                },
                /**
                    Assertion that the condition is <code>true</code>.
                    @param {boolean} cond
                    @param {string} [name]
                        The name of the test case.
                */
                ok: function(cond, name) {
                    this.is(!!cond, true, name);
                },
                /**
                    Assertion that the two values are deeply equal.
                    @param {*} obj
                    @param {*} expected
                    @param {string} [name]
                        The name of the test case.
                */
                isDeeply: function(obj, expected, name) {
                    this.log(B.eq(obj, expected), {
                        name: name,
                        returned: obj,
                        expected: expected
                    });
                },
                /**
                    Assertion that the fist value covers the structure of the
                    second value.
                    @param {*} obj
                    @param {*} expected
                    @param {string} [name]
                        The name of the test case.
                */
                isAtLeast: function(obj, expected, name) {
                    this.log(B.covers(obj, expected), {
                        name: name,
                        returned: obj,
                        expected: expected
                    });
                },
                /**
                    Assertion that the value is defined.
                    @param {*} obj
                    @param {string} [name]
                        The name of the test case.
                */
                isDefined: function(obj, name) {
                    this.ok(B.isDefined(obj), name);
                },
                /**
                    Assertion that the value is undefined.
                    @param {*} obj
                    @param {string} [name]
                        The name of the test case.
                */
                isUndefined: function(obj, name) {
                    this.ok(!B.isDefined(obj), name);
                },
                /**
                    Assertion that the value is
                    an instance of a certain class.
                    @param {*} obj
                    @param {object|string} klass
                    @param {string} [name]
                        The name of the test case.
                */
                isa: function(obj, klass, name) {
                    this.ok(B.isA(obj, klass), name);
                },
                /**
                    Assertion that the function throws an exception of
                    a certain kind.
                    @param {function} fun
                    @param {object|string} exc
                    @param {string} [name]
                        The name of the test case.
                */
                isThrown: function(fun, exc, name) {
                    var e;
                    try {
                        fun();
                    } catch (err) {
                        e=err;
                    }
                    B.isA(e, exc, name);
                },
                /**
                    Assertion that the function throws nothing.
                    @param {function} fun
                    @param {string} [name]
                        The name of the test case.
                */
                noThrow: function(fun, name) {
                    try {
                        fun();
                    } catch (e) {
                        this.error(e, name);
                        return;
                    }
                    this.ok(true, name);
                },

                // callback to the parent
                log: function(result, detail) {
                    total++;
                    detail.name = detail.name || this.testcase;
                    if (result) passed++;
                    parent.progress(result, detail);
                },

                // utility
                pp: function(val) {
                    return B.pp(val, {object:{name:1},cyclic:{detail:1}});
                }
            };
        };

        var toA = function(a){ return (a instanceof Array) ? a : [ a ]; };

        var setup = function(w, d, parent) {
            var t = parent.t;
            d.body.appendChild(d.createTextNode(t.id));
            w.Tester = new TestHandler(parent);
            w.GNN = { Tester: w.Tester, Base: B };

            var head = d.getElementsByTagName('head')[0];
            var load = function(path, callback, error) {
                var script = d.createElement('script');
                script.src = path + '?' + encodeURI(new Date()+'');
                script.type = 'text/javascript';
                if (script.addEventListener) {
                    script.onload = callback;
                    script.onerror = error;
                } else {
                    script.onreadystatechange = function(e) {
                        switch (e.srcElement.readyState || '') {
                        case 'loaded':
                        case 'complete':
                            callback();
                            break;
                        }
                    };
                }
                head.appendChild(script);
            };

            var src = [ 'include', 'run' ];
            var files = [];
            for (var i=0; i < src.length; i++) {
                var s = src[i];
                var f = toA(t[s]);
                for (var j=0; j < f.length; j++) {
                    var file = [ prefix[s], f[j] ].join('/');
                    files.push(file);
                }
            }

            if (typeof console == 'undefined') console={log:function(){}};
            var finish = function(){ w.Tester.loaded(); };
            var loadFrom = function(i) {
                if (i < files.length) {
                    load(files[i], function() {
                        console.log('loaded '+files[i]);
                        loadFrom(i+1);
                    }, function() {
                        console.log('load failed '+files[i]);
                        w.Tester.error('failed to load "'+files[i]+'"');
                        finish();
                    });
                } else {
                    finish();
                }
            };
            loadFrom(0);
        };

        var self = { /** @lends Tester.prototype */
            t: null,
            /**
                Reports progress of tests.
                @param {boolean} passed
                    Whether the test is passed.
                @param detail
                    The result of the test case.
                @param {string} detail.name
                    The name of the test.
                @param {string} [detail.expected]
                    The expected result.
                @param {string} [detail.returned]
                    The result of the test.
                @param {string} [detail.message]
                    An additional message for example error messages of
                    a failed test.
                @description
                    It is called by tester clients for each test.
            */
            progress: function(passed, detail) {
                callbacks.progress(this.t, passed, detail);
            },
            /**
                Reports overall results of the current test suite and runs
                the next test suite.
                @param summary
                    The result of the test suite.
                @param {number} summary.time
                    The running time of the test suite in milliseconds.
                @param {number} summary.total
                    The number of tests.
                @param {number} summary.passed
                    The number of passed tests.
                @param {number} summary.failed
                    The number of failed tests.
                @description
                    It is called by tester clients.
            */
            finished: function(summary) {
                callbacks.end(this.t, summary);
                this.t = null;
                this.next();
            },
            /**
                Runs the next test suite.
                @description
                    It is automatically called by the constructor and
                    <code>this.finished</code>.
            */
            next: function() {
                setTimeout(function() {
                    if (current < tests.length) {
                        self.t = tests[current++];
                        if (self.t == null) self.next();
                        callbacks.begin(self.t);

                        var iframe = document.createElement('iframe');
                        var div = document.createElement('div');
                        parent.appendChild(div);
                        div.appendChild(iframe);

                        var wnd = iframe.contentWindow;
                        var doc = wnd.document;
                        doc.open();
                        doc.writeln('<head></head>');
                        doc.writeln('<body></body>');
                        setup(wnd, doc, self);
                        doc.close();
                    }
                }, 0);
            }
        };

        self.next();
        return self;
    };
} ].reverse()[0](this);
