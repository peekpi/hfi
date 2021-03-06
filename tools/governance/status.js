const yargs = require('yargs');
const argv = yargs
    .option('contract', {
        alias: 'c',
        description: 'The contract address',
        type: 'string'
    })
    .option('start', {
        alias: 's',
        description: 'The start of proposal ID to display',
        type: 'string'
    })
    .option('amount', {
        alias: 'a',
        description: 'The amount of proposal to display',
        type: 'string'
    })
    .help()
    .alias('help', 'h')
    .argv;


const YearnGovernance = artifacts.require("YearnGovernance");
const HFI = artifacts.require("HFI");
const HCRV = artifacts.require("HCRV");

const { fromBech32, toBech32 } = require("@harmony-js/crypto");

const D = console.log;

let govInstance
let govAddress
let tokenInstance
let tokenAddress

const walletAddress = YearnGovernance.currentProvider.addresses[0];

function argvCheck() {
    govAddress = argv.contract ? argv.contract : YearnGovernance.address;
    if (!govAddress)
        throw 'You must supply a contract address using --contract CONTRACT_ADDRESS or -c CONTRACT_ADDRESS!';
}


async function init() {
    argvCheck();
    govInstance = await YearnGovernance.at(govAddress);
    tokenAddress = await govInstance.HFI.call();
    tokenInstance = await HFI.at(tokenAddress);
}

const web3 = require('web3');

async function tokenStatus() {
}

async function propose() {
    let proposalCount = await govInstance.proposalCount();
    console.log(`proposalCount: ${proposalCount.toString()}`)
    let voteLock = await govInstance.voteLock(walletAddress);
    console.log(`voteLock of ${walletAddress}: ${voteLock.toString()}`)

    let start = parseInt(argv.start);
    let amount = parseInt(argv.amount);
    if(isNaN(start)) start = 0;
    if(isNaN(amount)) amount = 1;
    const proposals = [];
    for(let i = 0; i < amount; i++){
        const proposalID = start + i;
        if(proposalID >= proposalCount) break;
        const proposal = await govInstance.proposals(proposalID);
        proposals.push({
            id: proposal.id.toString(),
            proposer: toBech32(proposal.proposer),
            totalAgree: proposal.totalForVotes.toString(),
            totalAgainst: proposal.totalAgainstVotes.toString(),
            startBlockNo: proposal.start.toString(),
            endBlockNo: proposal.end.toString(),
        });
    }
    console.table(proposals);
}

module.exports = function (result) {
    return init()
        .then(tokenStatus)
        .then(propose)
        .then(result).catch(result);
}
