const RPC_URL = 'https://testnet.opnet.org';
const EXPLORER_BASE = 'https://opscan.org/transactions';
const NETWORK_PARAM = 'op_testnet';

export const CORE_CONTRACT_ABI = [
  { type: 'function', name: 'registerModule', inputs: [{ name: 'moduleName', type: 'string' }, { name: 'moduleAddress', type: 'string' }], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'setDepositPipeline', inputs: [{ name: 'pipeline', type: 'string' }], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'setWithdrawPipeline', inputs: [{ name: 'pipeline', type: 'string' }], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'deposit', inputs: [{ name: 'amount', type: 'uint64' }], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'withdraw', inputs: [{ name: 'amount', type: 'uint64' }], outputs: [{ name: 'success', type: 'bool' }] },
  { type: 'function', name: 'getModuleCount', inputs: [], outputs: [{ name: 'moduleCount', type: 'uint256' }] },
  { type: 'function', name: 'getTotalDeposits', inputs: [], outputs: [{ name: 'totalDeposits', type: 'uint256' }] },
  { type: 'function', name: 'getDepositPipeline', inputs: [], outputs: [{ name: 'pipeline', type: 'string' }] },
  { type: 'function', name: 'getWithdrawPipeline', inputs: [], outputs: [{ name: 'pipeline', type: 'string' }] },
];

function normalizeAbiType(type, ABIDataTypes) {
  if (typeof type !== 'string') return type;

  const key = type.toUpperCase();
  if (Object.prototype.hasOwnProperty.call(ABIDataTypes, key)) {
    return ABIDataTypes[key];
  }

  throw new Error(`Unknown ABI type: ${type}`);
}

function normalizeAbi(abi, ABIDataTypes, BitcoinAbiTypes) {
  return abi.map((entry) => ({
    ...entry,
    type:
      typeof entry.type === 'string' && entry.type.toLowerCase() === 'function'
        ? BitcoinAbiTypes.Function
        : entry.type,
    inputs: (entry.inputs || []).map((input) => ({
      ...input,
      type: normalizeAbiType(input.type, ABIDataTypes),
    })),
    outputs: (entry.outputs || []).map((output) => ({
      ...output,
      type: normalizeAbiType(output.type, ABIDataTypes),
    })),
  }));
}

let sdkPromise = null;
let bitcoinPromise = null;

async function loadSDK() {
  if (!sdkPromise) {
    sdkPromise = import(/* @vite-ignore */ 'https://esm.sh/opnet@1.8.1-rc.17');
  }
  return sdkPromise;
}

async function loadBitcoin() {
  if (!bitcoinPromise) {
    bitcoinPromise = import(/* @vite-ignore */ 'https://esm.sh/@btc-vision/bitcoin@7.0.0-rc.6');
  }
  return bitcoinPromise;
}

async function resolveNetwork(networkOverride) {
  if (networkOverride && typeof networkOverride === 'object') {
    return networkOverride;
  }

  const { networks } = await loadBitcoin();

  if (networkOverride === 'mainnet' || networkOverride === 'bitcoin') {
    return networks.bitcoin;
  }

  return networks.opnetTestnet;
}

export async function getCoreContract(contractAddress, abi, network) {
  if (!contractAddress) {
    throw new Error('Core contract address is not configured');
  }

  const { getContract, JSONRpcProvider, ABIDataTypes, BitcoinAbiTypes } = await loadSDK();
  const btcNetwork = await resolveNetwork(network);
  const typedAbi = normalizeAbi(abi || CORE_CONTRACT_ABI, ABIDataTypes, BitcoinAbiTypes);
  
  const provider = new JSONRpcProvider({
    url: RPC_URL,
    network: btcNetwork,
  });

  return getContract(contractAddress, typedAbi, provider, btcNetwork);
}

export async function callWriteMethod({ contract, methodName, args = [], senderAddress, network }) {
  if (!senderAddress) {
    throw new Error('Wallet address required');
  }
  if (typeof contract[methodName] !== 'function') {
    throw new Error(`Method '${methodName}' not found on contract`);
  }

  console.log(`Calling ${methodName} with args:`, args);

  try {
    const simulation = await contract[methodName](...args);
    if (simulation?.revert) {
      throw new Error(`Contract revert: ${simulation.revert}`);
    }

    const btcNetwork = await resolveNetwork(network);
    const receipt = await simulation.sendTransaction({
      refundTo: senderAddress,
      feeRate: 1,
      maximumAllowedSatToSpend: 30000n,
      network: btcNetwork,
    });

    const txid = receipt?.transactionId || receipt?.txid || String(receipt);
    console.log(`Transaction ${methodName} completed:`, txid);
    
    return {
      ok: true,
      txid,
      explorerUrl: `${EXPLORER_BASE}/${txid}?network=${NETWORK_PARAM}`,
    };
  } catch (error) {
    console.error(`Error in ${methodName}:`, error);
    
    // Handle specific OP_NET wallet errors
    if (error.message?.includes('signer is not allowed in interaction parameters')) {
      throw new Error('Wallet interaction error: Please check your OP_NET wallet extension and try again.');
    }
    
    if (error.message?.includes('out of memory')) {
      throw new Error('Contract memory error: The contract may be too complex. Try simplifying the operation.');
    }
    
    throw error;
  }
}

export async function callViewMethod({ contract, methodName, args = [] }) {
  if (typeof contract[methodName] !== 'function') {
    throw new Error(`Method '${methodName}' not found on contract`);
  }

  try {
    const result = await contract[methodName](...args);
    if (result?.revert) {
      throw new Error(`Contract revert: ${result.revert}`);
    }

    // Handle buffer reading errors gracefully
    let properties = {};
    try {
      properties = result?.properties || {};
    } catch (bufferError) {
      console.warn(`Buffer reading error for ${methodName}:`, bufferError.message);
      // Try to extract basic info if possible
      if (result && typeof result === 'object') {
        properties = { raw: result };
      }
    }

    return {
      ok: true,
      properties,
    };
  } catch (error) {
    console.error(`Error in ${methodName}:`, error);
    return {
      ok: false,
      error: error.message || String(error),
      properties: {},
    };
  }
}
