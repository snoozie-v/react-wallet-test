import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import {Connect } from './Connect'



const walletManager = new WalletManager({
  wallets: [
    WalletId.KIBISIS,
  ],
  network: NetworkId.TESTNET,
  algod: {
    [NetworkId.TESTNET]: {
    token: "",
    baseServer: "https://testnet-api.voi.nodely.dev",
    port: ""
    },
  }
});

function App() {
  return (
    <>
      <WalletProvider manager={walletManager}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <Connect />
      </WalletProvider>
    </>
  )
}

export default App
