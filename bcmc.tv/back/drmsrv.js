const EthUtil = require('ethereumjs-util');
const Ecccrypto = require('eccrypto');

function removeTrailing0x(str) {
    if (str.startsWith('0x'))
        return str.substring(2);
    else return str;
}

function addTrailing0x(str) {
    if (!str.startsWith('0x'))
        return '0x' + str;
    else return str;
}

//
// 32 byte privateKey without 0x prefix
//
exports.publicKeyOfPrivateKey = function(privateKey) {
    privateKey = addTrailing0x(privateKey);
    const publicKeyBuffer = EthUtil.privateToPublic(privateKey);
    return publicKeyBuffer.toString('hex');
}

//
// 64 byte public key without 0x prefix
//
exports.encryptWithPublicKey = function(publicKey, message) {

    // ensure its an uncompressed publicKey
    //publicKey = decompress(publicKey);

    // re-add the compression-flag
    const pubString = '04' + publicKey;


    return Ecccrypto.encrypt(
        new Buffer(pubString, 'hex'),
        Buffer(message)
    ).then(encryptedBuffers => {
        const encrypted = {
            iv: encryptedBuffers.iv.toString('hex'),
            ephemPublicKey: encryptedBuffers.ephemPublicKey.toString('hex'),
            ciphertext: encryptedBuffers.ciphertext.toString('hex'),
            mac: encryptedBuffers.mac.toString('hex')
        };
        return encrypted;
    });
}

//
// 32 byte private key
// encrypted (iv,ephem, pub mac) as strings
//
exports.decryptWithPrivateKey = function(privateKey, encrypted) {

    //encrypted = parse(encrypted);

    // remove trailing '0x' from privateKey
    const twoStripped = removeTrailing0x(privateKey);

    const encryptedBuffer = {
        iv: new Buffer(encrypted.iv, 'hex'),
        ephemPublicKey: new Buffer(encrypted.ephemPublicKey, 'hex'),
        ciphertext: new Buffer(encrypted.ciphertext, 'hex'),
        mac: new Buffer(encrypted.mac, 'hex')
    };


    return Ecccrypto.decrypt(
        new Buffer(twoStripped, 'hex'),
        encryptedBuffer
    ).then(decryptedBuffer => decryptedBuffer.toString());
}


// Test
function test()
{
	var privkey = '0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07';
	var message = 'F10DF10DF10DF10DF10DF10DF10DF10D';
	var pubkey = publicKeyOfPrivateKey(privkey);
	
	var encbuff = encryptWithPublicKey(pubkey, message);
	var decbuff = decryptWithPrivateKey(privkey, encbuff);
}