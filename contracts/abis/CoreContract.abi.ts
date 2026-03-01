import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const CoreContractEvents = [];

export const CoreContractAbi = [
    {
        name: 'registerModule',
        inputs: [
            { name: 'moduleName', type: ABIDataTypes.STRING },
            { name: 'moduleAddress', type: ABIDataTypes.STRING },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'setDepositPipeline',
        inputs: [{ name: 'pipeline', type: ABIDataTypes.STRING }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'setWithdrawPipeline',
        inputs: [{ name: 'pipeline', type: ABIDataTypes.STRING }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'deposit',
        inputs: [{ name: 'amount', type: ABIDataTypes.UINT64 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'withdraw',
        inputs: [{ name: 'amount', type: ABIDataTypes.UINT64 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getModuleCount',
        constant: true,
        inputs: [],
        outputs: [{ name: 'moduleCount', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getTotalDeposits',
        constant: true,
        inputs: [],
        outputs: [{ name: 'totalDeposits', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getDepositPipeline',
        constant: true,
        inputs: [],
        outputs: [{ name: 'pipeline', type: ABIDataTypes.STRING }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getWithdrawPipeline',
        constant: true,
        inputs: [],
        outputs: [{ name: 'pipeline', type: ABIDataTypes.STRING }],
        type: BitcoinAbiTypes.Function,
    },
    ...CoreContractEvents,
    ...OP_NET_ABI,
];

export default CoreContractAbi;
