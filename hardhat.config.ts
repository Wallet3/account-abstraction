import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-etherscan'
import 'solidity-coverage'

import * as fs from 'fs'

import Chains from './networks.config'
import { HardhatUserConfig } from 'hardhat/config'

const mnemonicFileName = process.env.MNEMONIC_FILE ?? `${process.env.HOME}/.secret/testnet-mnemonic.txt`
let mnemonic = `${'test '.repeat(11)}junk`
if (fs.existsSync(mnemonicFileName)) { mnemonic = fs.readFileSync(mnemonicFileName, 'ascii') }

interface Network { url: string, accounts: { mnemonic: string } }

function getNetwork (url: string): Network {
  return { url, accounts: { mnemonic } }
}

function getInfuraNetwork (name: string): Network {
  return getNetwork(`https://${name}.infura.io/v3/${process.env.INFURA_ID}`)
}

const optimizedComilerSettings = {
  version: '0.8.17',
  settings: {
    optimizer: { enabled: true, runs: 1000000 },
    viaIR: true
  }
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{
      version: '0.8.19',
      settings: {
        optimizer: { enabled: true, runs: 1000000 }
      }
    }],
    overrides: {
      'contracts/core/EntryPoint.sol': optimizedComilerSettings
    }
  },
  networks: {
    dev: { url: 'http://localhost:8545' },
    goerli: getInfuraNetwork('goerli'),
    sepolia: getInfuraNetwork('sepolia'),
    baseGoerli: getNetwork(Chains.BaseGoerli),
    mumbai: getNetwork(Chains.Mumbai),
    xdai: getNetwork(Chains.xDai),
    polygon: getNetwork(Chains.Polygon),
    proxy: getNetwork('http://localhost:8545'),
    // github action starts localgeth service, for gas calculations
    localgeth: { url: 'http://localgeth:8545' }
  },
  mocha: {
    timeout: 10000
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }

}

// coverage chokes on the "compilers" settings
if (process.env.COVERAGE != null) {
  // @ts-ignore
  config.solidity = config.solidity.compilers[0]
}

export default config
