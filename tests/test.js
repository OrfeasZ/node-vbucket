var vBucketConfig = require('../vBucketConfig.js');
var fs = require('fs');

var s_Keys = [
    'hello',
    'world',
    'bananas',
    'foo',
    'bar',
    'couchbase',
    'memcached'
];

var s_Config = new vBucketConfig(fs.readFileSync('./configs/vbucket-eight-nodes.json'));

for (var i = 0; i < s_Keys.length; ++i)
{
    console.log('Map data for key "' + s_Keys[i] + '":');
    console.log(s_Config.Map(s_Keys[i]));
    console.log('-----');
}