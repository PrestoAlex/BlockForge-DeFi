import { useCallback, useEffect, useState } from 'react';
import { connectWallet, disconnectWallet, refreshWallet } from '../services/opnetWallet';

export function useOPNetWallet() {
  const [wallet, setWallet] = useState({
    connected: false,
    address: null,
    balance: 0,
  });
  const [loading, setLoading] = useState(false);

  const sync = useCallback(async () => {
    const state = await refreshWallet();
    setWallet({
      connected: state.connected,
      address: state.address,
      balance: state.balance,
    });
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    try {
      const state = await connectWallet();
      setWallet({
        connected: state.connected,
        address: state.address,
        balance: state.balance,
      });
      return { ok: true, wallet: state };
    } catch (error) {
      return { ok: false, error: error.message || String(error) };
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      const state = await disconnectWallet();
      setWallet({
        connected: state.connected,
        address: state.address,
        balance: state.balance,
      });
      return { ok: true, wallet: state };
    } catch (error) {
      return { ok: false, error: error.message || String(error) };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  return {
    wallet,
    loading,
    connect,
    disconnect,
    sync,
  };
}
