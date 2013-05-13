var HashedCRC32 = require('./crc32.js');

var vBucketConfig = function(p_vBucketServerMap)
{
    this.vBucketServerMap = (typeof(p_vBucketServerMap) == 'string' || Buffer.isBuffer(p_vBucketServerMap)) ? JSON.parse(p_vBucketServerMap.toString()) : p_vBucketServerMap;

    if (typeof(this.vBucketServerMap) != 'object')
        throw new Error('Invalid vBucketServerMap specified.');

    this.Parse();
};

//region Constants

vBucketConfig.MAX_REPLICAS = 4;
vBucketConfig.MAX_AUTHORITY_SIZE = 100;
vBucketConfig.MAX_VBUCKETS = 65536;

//endregion

vBucketConfig.prototype.Parse = function()
{
    this.HashAlgorithm = this.vBucketServerMap['hashAlgorithm'];
    this.ReplicaNumber = this.vBucketServerMap['numReplicas'];
    this.ServerList = this.vBucketServerMap['serverList'];
    this.vBucketMap = this.vBucketServerMap['vBucketMap'];
    this.vBucketMapForward = this.vBucketServerMap['vBucketMapForward'] || null;

    // Check if our config is valid
    if (this.HashAlgorithm === undefined ||
        this.ReplicaNumber === undefined ||
        this.ServerList === undefined ||
        this.vBucketMap === undefined)
        throw new Error('Invalid vBucketServerMap specified.');

    if (this.HashAlgorithm != 'CRC')
        throw new Error('Hash algorithm "' + this.HashAlgorithm + '" is not supported.');

    if (this.ServerList.length <= 0)
        throw new Error('The specified serverList is empty.');

    if (this.ReplicaNumber < 0 || this.ReplicaNumber > vBucketConfig.MAX_REPLICAS)
        throw new Error('Number of Replicas must be >= 0 and <= ' + vBucketConfig.MAX_REPLICAS + '.');

    if (this.vBucketMap.length <= 0 || (this.vBucketMap.length & (this.vBucketMap.length - 1)) != 0 || this.vBucketMap.length > vBucketConfig.MAX_VBUCKETS)
        throw new Error('Number of vBuckets must be a power of two > 0 and <= ' + vBucketConfig.MAX_VBUCKETS + '.');

    this.Mask = this.vBucketMap.length - 1;
};

vBucketConfig.prototype.Map = function(p_Key)
{
    // Get a vBucket ID
    var s_vBucketID = HashedCRC32(p_Key) & this.Mask;

    // Get the master for that vBucket
    var s_MasterID = this.vBucketMap[s_vBucketID][0];
    var s_Server = (s_MasterID >= 0) ? this.ServerList[s_MasterID] : undefined;

    // Get the replicas
    var s_Replicas = [];

    for (var i = 0; i < this.ReplicaNumber; ++i)
    {
        var s_ReplicaID = this.vBucketMap[s_vBucketID][i + 1];
        if (s_ReplicaID != -1)
            s_Replicas.push(this.ServerList[s_ReplicaID]);
        else
            break;
    }

    return { 'vBucketID': s_vBucketID, 'Server': s_Server, 'Replicas': s_Replicas };
};

vBucketConfig.prototype.MapInvalid = function(p_Key, p_vBucketID, p_WrongServer)
{
    var s_vBucket = this.vBucketMap[p_vBucketID];
    var s_MappedServer = this.ServerList[s_vBucket[0]];

    // Check if we have a fast-forward map
    if (this.vBucketMapForward !== null)
    {
        var s_vBucketFwd = this.vBucketMapForward[p_vBucketID];
        s_MappedServer = this.ServerList[s_vBucketFwd[0]];
        this.vBucketMap[p_vBucketID ] = this.vBucketMapForward[p_vBucketID];
    }
    else if (s_MappedServer == p_WrongServer)
    {
        s_MappedServer = this.ServerList[(this.ServerList.indexOf(p_WrongServer) + 1) % this.ServerList.length];
        this.vBucketMap[p_vBucketID][0] = this.ServerList.indexOf(s_MappedServer);
    }

    return s_MappedServer;
};

module.exports = vBucketConfig;