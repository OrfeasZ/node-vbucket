node-vbucket
==============================================================

A port of libvbucket to node.js written in pure JavaScript.

Basic Installation
----------------------------

You can install this package either by using npm or by downloading the source from GitHub and requiring it directly.

To install using npm open your terminal (or command line), make sure you're in your application directory and execute the following command:

    npm install vbucket
    
You can then start using the package by requiring it from your application as such:

    var vbucket = require('vbucket');
    
Basic Usage
------------------

```javascript
var vBucketConfig = require('vbucket');

var s_vBucketServerMap = <vBucketServerMap Object, JSON String or Buffer>;

var s_Config = new vBucketConfig(s_vBucketServerMap);

var s_KeyMap = s_Config.Map('SomeKey');

/** 
 * s_KeyMap = { 
 * 	'vBucketID': <the vBucketID for the specified key>,
 * 	'Server': <String of the master server for that vBucket>,
 *	'Replicas': [<Replica server String>, ...]
 * }
 */
```

TODO
----

* Implement Ketama
* More...?