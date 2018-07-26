import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:3000');

var clientObj = null;
function subscribeClntRequest(obj, cb) {
  clientObj = obj;
  socket.on('general_event', data => { console.log("general_event" + data); cb(clientObj, 'general_event', data)});
  socket.on('account_nonce', data => { console.log("account_nonce:" + data); cb(clientObj, 'account_nonce', data)});
  socket.on('movie_url', data => { console.log("movie_url:" + data); cb(clientObj, 'movie_url', data)});
  socket.emit('ok', 1000);
}

function sendEthRequest(data)
{
  socket.emit("eth_rawtransaction", data);
}

function sendEthGetAccount(account)
{
  socket.emit("eth_get_account", account);
}

function sendEthCall(data)
{
  socket.emit("eth_call", data);
}

export { sendEthCall };
export { sendEthGetAccount };
export { subscribeClntRequest };
export { sendEthRequest };
