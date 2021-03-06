const HFI = artifacts.require("HFI");
const HCRV = artifacts.require("HCRV");
const HRC20Faucet = artifacts.require("HRC20Faucet");
const YearnRewards = artifacts.require("YearnRewards");
const YearnGovernance = artifacts.require("YearnGovernance");

const { getAddress } = require("@harmony-js/crypto");
const web3 = require('web3');
const faucet = {
  amount: web3.utils.toWei("10000"), //award 10000 tokens per faucet interaction
  frequency: 12 //will fund addresses every minute based on 5s block time
}

module.exports = function (deployer) {
  deployer.deploy(HFI).then(function () {
    return deployer.deploy(HCRV).then(function () {
      return deployer.deploy(HRC20Faucet, HCRV.address, faucet.amount, faucet.frequency).then(function () {
        return deployer.deploy(YearnRewards, HFI.address, HCRV.address).then(function () {
          return deployer.deploy(YearnGovernance, HFI.address, HCRV.address).then(function () {
            const yearnGovernanceBech32 = getAddress(YearnGovernance.address).bech32;
            console.log(`  Yearn Governance contract address: ${yearnGovernanceBech32} (${YearnGovernance.address})`);
            console.log(`   HFI address: ${HFI.address} - ${getAddress(HFI.address).bech32}`);
            console.log(`   hCRV address: ${HCRV.address} - ${getAddress(HCRV.address).bech32}`);
            console.log(`   hCRV faucet address: ${HRC20Faucet.address} - ${getAddress(HRC20Faucet.address).bech32}`);
            console.log(`   Yearn Rewards contract address: ${YearnRewards.address} - ${getAddress(YearnRewards.address).bech32}\n`);
            console.log(`   hfi=${HFI.address}; hcrv=${HCRV.address}; faucet=${HRC20Faucet.address}; rewards=${YearnRewards.address}`);
          }); // End Yearn Governance deployment
        }); // End Yearn Rewards deployment

      }); // End HRC20Faucet deployment
    }); // End HCRV deployment
  }); // End HFI deployment
}
