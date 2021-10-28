import Web3 from 'web3';
import Deed from '../build/contracts/Deed.json';

let web3;
let deed;

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      window.ethereum.enable()
        .then(() => {
          resolve(
            new Web3(window.ethereum)
          );
        })
        .catch(e => {
          reject(e);
        });
      return;
    }
    if (typeof window.web3 !== 'undefined') {
      return resolve(
        new Web3(window.web3.currentProvider)
      );
    }
    resolve(new Web3('http://localhost:9545'));
  });
};

const initContract = async () => {
  const networkId = await web3.eth.net.getId();
  return new web3.eth.Contract(
    Deed.abi,
    Deed
      .networks[networkId]
      .address
  );
};

const initApp = () => {
  const $withdraw = document.getElementById('withdraw')
  const $withdrawResult = document.getElementById('withdraw-result')
  const $balance = document.getElementById('balance')

  let accounts = []
  web3.eth.getAccounts()
    .then(_accounts => {
      accounts = _accounts
      console.log(accounts)
    })

  let balance;
  web3.eth.getBalance(deed.options.address)
    .then(_balance => {
      balance = parseInt(_balance)
      $balance.innerHTML = _balance + " Wei"
    })

  $withdraw.addEventListener('submit', e => {
    e.preventDefault();
    deed.methods.withdraw()
      .send({ from: accounts[0] })
      .then(() => {
        $withdrawResult.innerHTML = `${balance} Wei has been transferred to the beneficiary`
        balance = 0;
        $balance.innerHTML = balance + " Wei"
      })
      .catch((err) => {
        if (err.message.includes('too early')) {
          $withdrawResult.innerHTML = `Ooops... It's not time yet...`
        } else {
          $withdrawResult.innerHTML = `Ooops... there was an arror while trying to withdraw...`
        }
      })
  })
};

document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      return initContract();
    })
    .then(_deed => {
      deed = _deed;
      initApp();
    })
    .catch(e => console.log(e.message));
});
