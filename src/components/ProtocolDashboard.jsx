import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, RefreshCw, Wallet, LogIn, ExternalLink, Shield, CheckCircle } from 'lucide-react';

export default function ProtocolDashboard({
  protocolName,
  wallet,
  onConnectWallet,
  contract,
  onBackToBuilder,
}) {
  const [depositAmount, setDepositAmount] = useState('10000');
  const [withdrawAmount, setWithdrawAmount] = useState('10000');
  const [state, setState] = useState(null);
  const [loadingState, setLoadingState] = useState(false);
  const [message, setMessage] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [currentBlock, setCurrentBlock] = useState(null);

  const getOPScanUrl = useCallback((txid) => {
    return `https://opscan.org/accounts/${txid}?network=op_testnet`;
  }, []);

  const pipelines = useMemo(() => ({
    deposit: state?.depositPipeline || '-',
    withdraw: state?.withdrawPipeline || '-',
  }), [state]);

  const refreshState = useCallback(async () => {
    setLoadingState(true);
    try {
      const result = await contract.readState();
      setState(result);
      
      // Fetch current block (simplified - in production this should come from contract)
      setCurrentBlock(3334); // Using deployment block as reference
      
    } catch (error) {
      console.error('Failed to refresh state:', error);
    } finally {
      setLoadingState(false);
    }
  }, [contract]);

  // Calculate blocks until withdraw is available
  const blocksUntilWithdraw = useMemo(() => {
    if (!currentBlock) return null;
    const lockDuration = 1000;
    const blocksLeft = Math.max(0, lockDuration - currentBlock);
    return blocksLeft;
  }, [currentBlock]);

  // Check if withdraw is available
  const isWithdrawAvailable = useMemo(() => {
    return blocksUntilWithdraw === 0;
  }, [blocksUntilWithdraw]);

  const ensureWallet = useCallback(async () => {
    if (wallet.connected && wallet.address) return { ok: true, address: wallet.address };
    const res = await onConnectWallet();
    if (!res.ok) return { ok: false, error: res.error || 'Wallet connection failed' };
    return { ok: true, address: res.wallet?.address || null };
  }, [onConnectWallet, wallet.address, wallet.connected]);

  const handleDeposit = useCallback(async () => {
    const connected = await ensureWallet();
    if (!connected.ok || !connected.address) {
      setMessage(connected.error || 'Please connect wallet first.');
      return;
    }

    const res = await contract.deposit(depositAmount, connected.address);
    if (!res.ok) {
      setMessage(`Deposit failed: ${res.error}`);
      return;
    }

    // Add to transaction history
    const newTx = {
      type: 'deposit',
      amount: depositAmount,
      txid: res.txid,
      timestamp: new Date().toISOString(),
      opscanUrl: getOPScanUrl(res.txid),
    };
    setTransactions(prev => [newTx, ...prev].slice(0, 10)); // Keep last 10 transactions

    setMessage(`Deposit sent. TX: ${res.txid}`);
    refreshState();
  }, [contract, depositAmount, ensureWallet, refreshState, getOPScanUrl]);

  const handleWithdraw = useCallback(async () => {
    const connected = await ensureWallet();
    if (!connected.ok || !connected.address) {
      setMessage(connected.error || 'Please connect wallet first.');
      return;
    }

    const res = await contract.withdraw(withdrawAmount, connected.address);
    if (!res.ok) {
      setMessage(`Withdraw failed: ${res.error}`);
      return;
    }

    // Add to transaction history
    const newTx = {
      type: 'withdraw',
      amount: withdrawAmount,
      txid: res.txid,
      timestamp: new Date().toISOString(),
      opscanUrl: getOPScanUrl(res.txid),
    };
    setTransactions(prev => [newTx, ...prev].slice(0, 10)); // Keep last 10 transactions

    setMessage(`Withdraw sent. TX: ${res.txid}`);
    refreshState();
  }, [contract, ensureWallet, refreshState, withdrawAmount, getOPScanUrl]);

  const handleApproveWithdrawal = useCallback(async () => {
    const connected = await ensureWallet();
    if (!connected.ok || !connected.address) {
      setApprovalMessage(connected.error || 'Please connect wallet first.');
      return;
    }

    const res = await contract.approveWithdrawal(connected.address, connected.address);
    if (!res.ok) {
      setApprovalMessage(`Approval failed: ${res.error}`);
      return;
    }

    setApprovalMessage(`Withdrawal approved! TX: ${res.txid}`);
    refreshState();
  }, [contract, ensureWallet, refreshState]);

  return (
    <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{protocolName} Dashboard</h2>
          <p className="text-sm text-gray-400 font-mono">Use your deployed protocol: deposit / withdraw / monitor state</p>
        </div>
        <button
          onClick={onBackToBuilder}
          className="px-4 py-2 rounded-lg bg-btc-surface border border-btc-border text-sm text-white hover:border-btc-orange transition-colors"
        >
          Back to Builder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4 border border-btc-border">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Wallet</p>
          <div className="flex items-center gap-2 text-sm text-white font-mono break-all">
            <Wallet className="w-4 h-4 text-btc-orange" />
            {wallet.connected && wallet.address ? wallet.address : 'Not connected'}
          </div>
          {!wallet.connected && (
            <button
              onClick={onConnectWallet}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-btc-orange text-btc-darker text-xs font-bold"
            >
              <LogIn className="w-3.5 h-3.5" />
              Connect Wallet
            </button>
          )}
        </div>

        <div className="glass rounded-xl p-4 border border-btc-border">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Module Count</p>
          <p className="text-2xl font-bold text-white">{state?.moduleCount || '-'}</p>
        </div>

        <div className="glass rounded-xl p-4 border border-btc-border">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Total Deposits</p>
          <p className="text-2xl font-bold text-white">{state?.totalDeposits || '-'} <span className="text-sm text-gray-400">sats</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5 border border-btc-border space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-btc-orange" />
            Deposit
          </h3>
          
          {/* Deposit Information */}
          <div className="p-3 rounded-lg bg-btc-surface/50 border border-btc-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Max Deposit:</span>
              <span className="text-btc-orange font-mono font-bold">100 sats</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Current Balance:</span>
              <span className="text-white font-mono">{state?.totalDeposits || '0'} sats</span>
            </div>
          </div>
          
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-btc-surface border border-btc-border text-white"
            placeholder="Amount in sats (max: 100)"
          />
          <button
            onClick={handleDeposit}
            disabled={contract.transacting}
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-btc-orange to-btc-gold text-btc-darker font-bold disabled:opacity-60"
          >
            {contract.transacting ? 'Submitting...' : 'Deposit BTC'}
          </button>
        </div>

        <div className="glass rounded-xl p-5 border border-btc-border space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-neon-purple" />
            Withdraw
          </h3>
          
          {/* Withdraw Information */}
          <div className="p-3 rounded-lg bg-btc-surface/50 border border-btc-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">TimeLock Status:</span>
              <span className={`font-mono font-bold ${isWithdrawAvailable ? 'text-neon-green' : 'text-red-500'}`}>
                {isWithdrawAvailable ? 'Available' : 'Locked'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Blocks Until Unlock:</span>
              <span className="text-white font-mono">
                {blocksUntilWithdraw !== null ? `${blocksUntilWithdraw} blocks` : 'Loading...'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Current Balance:</span>
              <span className="text-white font-mono">{state?.totalDeposits || '0'} sats</span>
            </div>
          </div>
          
          <input
            type="number"
            min="1"
            step="1"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-btc-surface border border-btc-border text-white"
            placeholder="Amount in sats"
            disabled={!isWithdrawAvailable}
          />
          <button
            onClick={handleWithdraw}
            disabled={contract.transacting || !isWithdrawAvailable}
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold disabled:opacity-60"
          >
            {contract.transacting ? 'Submitting...' : 
             !isWithdrawAvailable ? 'Withdraw Locked' : 'Withdraw BTC'}
          </button>
          {!isWithdrawAvailable && blocksUntilWithdraw !== null && (
            <p className="text-xs text-gray-500 text-center">
              Withdrawal available after {blocksUntilWithdraw} more blocks (~{Math.ceil(blocksUntilWithdraw / 6)} minutes)
            </p>
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-5 border border-btc-border mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Protocol Pipelines</h3>
          <button
            onClick={refreshState}
            disabled={loadingState}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-btc-surface border border-btc-border text-xs text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingState ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <p className="text-sm text-gray-300 font-mono">Deposit: {pipelines.deposit}</p>
        <p className="text-sm text-gray-300 font-mono mt-1">Withdraw: {pipelines.withdraw}</p>
      </div>

      {/* Escrow Approval Panel */}
      <div className="glass rounded-xl p-5 border border-btc-border mt-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-neon-purple" />
          Escrow Control
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-btc-surface/50 border border-btc-border/50">
            <div>
              <p className="text-xs font-mono text-gray-400">Controller Status</p>
              <p className="text-sm font-mono text-white">
                {wallet.connected ? `Connected: ${wallet.address?.slice(0, 6)}...${wallet.address?.slice(-4)}` : 'Not Connected'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
              <span className="text-xs font-mono text-neon-purple">Active</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-btc-surface/50 border border-btc-border/50">
            <div>
              <p className="text-xs font-mono text-gray-400">Withdrawal Approval</p>
              <p className="text-sm font-mono text-white">Approve your own withdrawals</p>
            </div>
            <button
              onClick={handleApproveWithdrawal}
              disabled={contract.transacting || !wallet.connected}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold disabled:opacity-60 flex items-center gap-2"
            >
              {contract.transacting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve Withdrawal
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {approvalMessage && (
        <div className="mt-4 p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-sm text-gray-200 font-mono break-all">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-neon-purple" />
            <span className="text-xs font-bold text-neon-purple">Escrow Status</span>
          </div>
          {approvalMessage}
        </div>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div className="glass rounded-xl p-5 border border-btc-border mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Transaction History</h3>
          <div className="space-y-2">
            {transactions.map((tx, index) => {
              const opscanUrl = tx.opscanUrl || (tx.txid ? getOPScanUrl(tx.txid) : '#');
              return (
                <div key={`${tx.txid}-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-btc-surface/50 border border-btc-border/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.type === 'deposit' ? 'bg-neon-green' : 'bg-neon-purple'
                    }`} />
                    <span className="text-xs font-mono text-gray-300">
                      {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'}: {tx.amount} sats
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <a
                    href={opscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-neon-blue hover:text-neon-purple transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    OPScan
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 rounded-lg bg-btc-surface border border-btc-border text-sm text-gray-200 font-mono break-all">
          {message}
        </div>
      )}
    </main>
  );
}
