/**
 * Module definitions for Composable DeFi Lego.
 * Each module has: id, name, description, icon, color, category,
 * configFields (for right panel), and pipeline role (deposit/withdraw/both).
 */

export const MODULE_CATEGORIES = {
  CORE: 'Core',
  YIELD: 'Yield',
  SECURITY: 'Security',
  ADVANCED: 'Advanced',
};

export const MODULES = [
  {
    id: 'vault',
    name: 'Vault',
    description: 'Core deposit & withdrawal vault. Holds user funds securely on-chain.',
    icon: 'Vault',
    color: '#F7931A',
    category: MODULE_CATEGORIES.CORE,
    pipelineRole: 'both',
    configFields: [
      {
        key: 'tokenType',
        label: 'Token Type',
        type: 'select',
        options: ['BTC', 'OP_20'],
        default: 'BTC',
      },
      {
        key: 'maxDeposit',
        label: 'Max Deposit (sats)',
        type: 'number',
        min: 1000,
        max: 100000000,
        step: 1000,
        default: 10000000,
      },
    ],
  },
  {
    id: 'staking',
    name: 'Staking',
    description: 'Stake deposited tokens to earn yield. Configurable APY and compounding.',
    icon: 'TrendingUp',
    color: '#00FF88',
    category: MODULE_CATEGORIES.YIELD,
    pipelineRole: 'deposit',
    configFields: [
      {
        key: 'apy',
        label: 'APY %',
        type: 'slider',
        min: 1,
        max: 100,
        step: 1,
        default: 12,
      },
      {
        key: 'compounding',
        label: 'Auto-compound',
        type: 'toggle',
        default: true,
      },
      {
        key: 'minStake',
        label: 'Min Stake (sats)',
        type: 'number',
        min: 100,
        max: 10000000,
        step: 100,
        default: 10000,
      },
    ],
  },
  {
    id: 'yield',
    name: 'Yield',
    description: 'Distribute reward tokens to stakers. Configurable payout frequency.',
    icon: 'Gift',
    color: '#FFB347',
    category: MODULE_CATEGORIES.YIELD,
    pipelineRole: 'deposit',
    configFields: [
      {
        key: 'rewardToken',
        label: 'Reward Token',
        type: 'select',
        options: ['OP_20', 'BTC', 'Custom'],
        default: 'OP_20',
      },
      {
        key: 'payoutFrequency',
        label: 'Payout (blocks)',
        type: 'slider',
        min: 10,
        max: 5000,
        step: 10,
        default: 100,
      },
      {
        key: 'rewardRate',
        label: 'Reward Rate (per block)',
        type: 'number',
        min: 1,
        max: 10000,
        step: 1,
        default: 50,
      },
    ],
  },
  {
    id: 'timelock',
    name: 'TimeLock',
    description: 'Lock funds for a specified block duration before withdrawal is allowed.',
    icon: 'Clock',
    color: '#00D4FF',
    category: MODULE_CATEGORIES.SECURITY,
    pipelineRole: 'withdraw',
    configFields: [
      {
        key: 'lockDuration',
        label: 'Lock Duration (blocks)',
        type: 'slider',
        min: 10,
        max: 10000,
        step: 10,
        default: 1000,
      },
      {
        key: 'earlyWithdrawPenalty',
        label: 'Early Withdraw Penalty %',
        type: 'slider',
        min: 0,
        max: 50,
        step: 1,
        default: 10,
      },
    ],
  },
  {
    id: 'escrow',
    name: 'Escrow',
    description: 'Optional escrow with controller address for multi-sig or DAO withdrawals.',
    icon: 'Shield',
    color: '#A855F7',
    category: MODULE_CATEGORIES.SECURITY,
    pipelineRole: 'withdraw',
    configFields: [
      {
        key: 'controllerAddress',
        label: 'Controller Address',
        type: 'text',
        placeholder: 'bc1q... or leave empty',
        default: '',
      },
      {
        key: 'requireApproval',
        label: 'Require Approval',
        type: 'toggle',
        default: true,
      },
    ],
  },
  {
    id: 'nft',
    name: 'NFT Position',
    description: 'Mint NFT representing user position. Enables transferable DeFi positions.',
    icon: 'Hexagon',
    color: '#FF006E',
    category: MODULE_CATEGORIES.ADVANCED,
    pipelineRole: 'both',
    configFields: [
      {
        key: 'nftStandard',
        label: 'NFT Standard',
        type: 'select',
        options: ['OP_721', 'OP_1155'],
        default: 'OP_721',
      },
      {
        key: 'transferable',
        label: 'Transferable',
        type: 'toggle',
        default: true,
      },
    ],
  },
];

export const getModuleById = (id) => MODULES.find((m) => m.id === id);

export const getDepositPipeline = (selectedIds) => {
  const order = ['vault', 'staking', 'rewards', 'nft'];
  return order.filter((id) => selectedIds.includes(id));
};

export const getWithdrawPipeline = (selectedIds) => {
  const order = ['timelock', 'escrow', 'vault', 'nft'];
  return order.filter((id) => selectedIds.includes(id));
};
