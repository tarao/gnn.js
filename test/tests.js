if (typeof TESTS == 'undefined') var TESTS = [];
TESTS = TESTS.concat([
    { id: 'GNN.Tester',
      include: [],
      run: 'test_tester.js'
    },
    { id: 'GNN.Base',
      include: 'base.js',
      run: 'test_base.js'
    },
    { id: 'GNN.Class',
      include: [ 'base.js', 'class.js' ],
      run: 'test_class.js'
    },
    { id: 'GNN.Hash.method',
      include: [ 'base.js', 'hash.js' ],
      run: [ 'test_hash_class.js',
             'test_hash.js' ]
    },
    { id: 'GNN.Hash#method',
      include: [ 'base.js', 'hash.js' ],
      run: [ 'test_hash_instance.js',
             'test_hash.js' ]
    },
    { id: 'GNN.Array.method',
      include: [ 'base.js', 'array.js' ],
      run: [ 'test_array_class.js',
             'test_array.js',
             'test_array_property_func.js' ]
    },
    { id: 'GNN.Array#method',
      include: [ 'base.js', 'array.js' ],
      run: [ 'test_array_instance.js',
             'test_array.js',
             'test_array_property.js' ]
    },
    { id: 'GNN.Array Array.prototype extension',
      include: [ 'base.js', 'array.js' ],
      run: [ 'test_array_extension.js',
             'test_array.js',
             'test_array_property.js' ]
    },
    { id: 'GNN.AssocArray.method',
      include: [ 'base.js', 'array.js' ],
      run: [ 'test_assocarray_class.js',
             'test_assocarray.js' ]
    },
    { id: 'GNN.AssocArray#method',
      include: [ 'base.js', 'array.js' ],
      run: [ 'test_assocarray_instance.js',
             'test_assocarray.js',
             'test_array.js' ]
    },
    { id: 'GNN.AssocArray Array.prototype extension',
      include: [ 'base.js', 'array.js' ],
      run: [ 'test_assocarray_extension.js',
             'test_assocarray.js' ]
    },
    { id: 'GNN.Hash and GNN.Array conversion',
      include: [ 'base.js', 'hash.js', 'array.js' ],
      run: [ 'test_hash_array.js' ]
    },
]);
