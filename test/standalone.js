if (typeof TESTS == 'undefined') var TESTS = [];
TESTS = TESTS.concat([
    { id: 'standalone GNN.Class',
      include: [ 'class.js' ],
      run: 'test_class.js'
    },
    { id: 'standalone GNN.Hash.method',
      include: [ 'hash.js' ],
      run: [ 'test_hash_class.js',
             'test_hash.js' ]
    },
    { id: 'standalone GNN.Hash#method',
      include: [ 'hash.js' ],
      run: [ 'test_hash_instance.js',
             'test_hash.js' ]
    },
    { id: 'standalone GNN.Array.method',
      include: [ 'array.js' ],
      run: [ 'test_array_class.js',
             'test_array.js',
             'test_array_property_func.js' ]
    },
    { id: 'standalone GNN.Array#method',
      include: [ 'array.js' ],
      run: [ 'test_array_instance.js',
             'test_array.js',
             'test_array_property.js' ]
    },
    { id: 'standalone GNN.Array Array.prototype extension',
      include: [ 'array.js' ],
      run: [ 'test_array_extension.js',
             'test_array.js',
             'test_array_property.js' ]
    },
    { id: 'standalone GNN.AssocArray.method',
      include: [ 'array.js' ],
      run: [ 'test_assocarray_class.js',
             'test_assocarray.js' ]
    },
    { id: 'standalone GNN.AssocArray#method',
      include: [ 'array.js' ],
      run: [ 'test_assocarray_instance.js',
             'test_assocarray.js',
             'test_array.js' ]
    },
    { id: 'standalone GNN.AssocArray Array.prototype extension',
      include: [ 'array.js' ],
      run: [ 'test_assocarray_extension.js',
             'test_assocarray.js' ]
    },
    { id: 'standalone GNN.Hash and GNN.Array conversion',
      include: [ 'hash.js', 'array.js' ],
      run: [ 'test_hash_array.js' ]
    },
]);
