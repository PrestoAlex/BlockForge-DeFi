const WalletState = {
  provider: null,
  address: null,
  balance: 0,
  connected: false,
};

function getProvider() {
  if (typeof window === 'undefined' || !window.opnet) {
    return null;
  }
  return window.opnet;
}

async function callProvider(methods, params = []) {
  const provider = getProvider();
  if (!provider) {
    throw new Error('OP_NET Wallet extension not detected');
  }

  if (typeof provider.request === 'function') {
    for (const method of methods) {
      try {
        return await provider.request({ method, params });
      } catch {
        // try next
      }
    }
  }

  for (const method of methods) {
    if (typeof provider[method] === 'function') {
      try {
        return await provider[method](...params);
      } catch {
        // try next
      }
    }
  }

  throw new Error('No compatible OP_NET wallet API method found');
}

export async function connectWallet() {
  const accounts = await callProvider(['request_accounts', 'requestAccounts'], []);
  if (!accounts || !accounts.length) {
    throw new Error('No wallet accounts returned');
  }

  WalletState.provider = getProvider();
  WalletState.address = accounts[0];
  WalletState.connected = true;

  try {
    const bal = await callProvider(['get_balance', 'getBalance'], []);
    WalletState.balance = Number(bal?.total ?? bal?.confirmed ?? bal ?? 0);
  } catch {
    WalletState.balance = 0;
  }

  return { ...WalletState };
}

export async function disconnectWallet() {
  if (WalletState.provider && typeof WalletState.provider.disconnect === 'function') {
    try {
      await WalletState.provider.disconnect();
    } catch {
      // local cleanup still happens
    }
  }

  WalletState.provider = null;
  WalletState.address = null;
  WalletState.balance = 0;
  WalletState.connected = false;
  return { ...WalletState };
}

export async function refreshWallet() {
  const provider = getProvider();
  if (!provider) {
    return { ...WalletState, connected: false };
  }

  try {
    const accounts = await callProvider(['get_accounts', 'getAccounts'], []);
    if (accounts && accounts.length) {
      WalletState.provider = provider;
      WalletState.address = accounts[0];
      WalletState.connected = true;
      try {
        const bal = await callProvider(['get_balance', 'getBalance'], []);
        WalletState.balance = Number(bal?.total ?? bal?.confirmed ?? bal ?? 0);
      } catch {
        WalletState.balance = 0;
      }
    } else {
      WalletState.connected = false;
      WalletState.address = null;
      WalletState.balance = 0;
    }
  } catch {
    WalletState.connected = false;
    WalletState.address = null;
    WalletState.balance = 0;
  }

  return { ...WalletState };
}
