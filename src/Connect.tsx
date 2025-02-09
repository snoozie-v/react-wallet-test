import { NetworkId, WalletId, useWallet, type Wallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import * as React from 'react'

export function Connect() {
  const {
    algodClient,
    activeAddress,
    activeNetwork,
    setActiveNetwork,
    transactionSigner,
    wallets
  } = useWallet()

  console.log('ALGOD', algodClient, activeNetwork, wallets)
  const [isSending, setIsSending] = React.useState(false)

  const isConnectDisabled = (wallet: Wallet) => {
    return wallet.isConnected
  }

  const getConnectArgs = () => {
    return undefined // Since we're not dealing with MagicLink, no args needed
  }

  const setActiveAccount = (event: React.ChangeEvent<HTMLSelectElement>, wallet: Wallet) => {
    const target = event.target
    wallet.setActiveAccount(target.value)
  }

  const sendTransaction = async () => {
    try {
      if (!activeAddress) {
        throw new Error('[App] No active account')
      }

      const atc = new algosdk.AtomicTransactionComposer()
      const suggestedParams = await algodClient.getTransactionParams().do()
  
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: activeAddress,
        amount: 0,
        suggestedParams
      })

      atc.addTransaction({ txn: transaction, signer: transactionSigner })

      console.info(`[App] Sending transaction...`, transaction)

      setIsSending(true)

      const result = await atc.execute(algodClient, 4)

      console.info(`[App] ✅ Successfully sent transaction!`, {
        confirmedRound: result.confirmedRound,
        txIDs: result.txIDs
      })
    } catch (error) {
      console.error('[App] Error signing transaction:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div>
      <div className="network-group">
        <h4>
          Current Network: <span className="active-network">{activeNetwork}</span>
        </h4>
        <div className="network-buttons">
          <button
            type='button'
            onClick={() => setActiveNetwork(NetworkId.VOIMAIN)}
            disabled={activeNetwork === NetworkId.VOIMAIN}
          >
            Set to VOI Main
          </button>
          <button
            type='button'
            onClick={() => setActiveNetwork(NetworkId.TESTNET)}
            disabled={activeNetwork === NetworkId.TESTNET}
          >
            Set to TestNet
          </button>
        </div>
      </div>

      {wallets.map((wallet) => (
        <div key={wallet.id} className="wallet-group">
          <h4>
            {wallet.metadata.name} {wallet.isActive ? '[active]' : ''}
          </h4>

          <div className="wallet-buttons">
            <button
              type="button"
              onClick={() => {
                const args = getConnectArgs();
                console.log('Attempting to connect with:', wallet.id, args, activeNetwork);
                wallet.connect(args).then(() => {
                  console.log('Successfully connected');
                }).catch((error) => {
                  console.error('Failed to connect:', error);
                  // Log the error in more detail
                  if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                  } else {
                    console.error('Error message:', error.message);
                  }
                });
              }}
              disabled={isConnectDisabled(wallet)}
            >
              Connect
            </button>
            <button
              type="button"
              onClick={() => wallet.disconnect()}
              disabled={!wallet.isConnected}
            >
              Disconnect
            </button>
            {wallet.isActive ? (
              <button type="button" onClick={sendTransaction} disabled={isSending}>
                {isSending ? 'Sending Transaction...' : 'Send Transaction'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => wallet.setActive()}
                disabled={!wallet.isConnected}
              >
                Set Active
              </button>
            )}
          </div>

          {wallet.isActive && wallet.accounts.length > 0 && (
            <select onChange={(e) => setActiveAccount(e, wallet)}>
              {wallet.accounts.map((account) => (
                <option key={account.address} value={account.address}>
                  {account.address}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  )
}