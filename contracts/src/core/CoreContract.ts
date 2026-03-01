import { u256 } from '@btc-vision/as-bignum/assembly';
import {
  Blockchain,
  BytesWriter,
  Calldata,
  EMPTY_POINTER,
  OP_NET,
  Revert,
  StoredString,
  StoredU256,
  U256_BYTE_LENGTH,
  Address,
} from '@btc-vision/btc-runtime/runtime';

declare function method(...args: any[]): any;
declare function returns(...args: any[]): any;
declare function view(...args: any[]): any;
declare const ABIDataTypes: any;

const MODULE_COUNT_POINTER = Blockchain.nextPointer;
const TOTAL_DEPOSITS_POINTER = Blockchain.nextPointer;
const LAST_ACTION_POINTER = Blockchain.nextPointer;

const VAULT_MODULE_POINTER = Blockchain.nextPointer;
const STAKING_MODULE_POINTER = Blockchain.nextPointer;
const REWARDS_MODULE_POINTER = Blockchain.nextPointer;
const TIMELOCK_MODULE_POINTER = Blockchain.nextPointer;
const ESCROW_MODULE_POINTER = Blockchain.nextPointer;
const NFT_MODULE_POINTER = Blockchain.nextPointer;

const DEPOSIT_PIPELINE_POINTER = Blockchain.nextPointer;
const WITHDRAW_PIPELINE_POINTER = Blockchain.nextPointer;

/**
 * CoreContract — Composable DeFi Lego on OP_NET
 *
 * This is the orchestrator contract that:
 * - Stores module addresses in order
 * - Calls each module's onDeposit / onWithdraw in pipeline order
 * - Manages the module registry
 *
 * Constructor is lightweight (pointers only).
 * All init logic is in onDeployment().
 */
export class CoreContract extends OP_NET {
  private moduleCount: StoredU256;
  private totalDeposits: StoredU256;
  private lastAction: StoredString;

  private vaultModule: StoredString;
  private stakingModule: StoredString;
  private rewardsModule: StoredString;
  private timelockModule: StoredString;
  private escrowModule: StoredString;
  private nftModule: StoredString;

  private depositPipeline: StoredString;
  private withdrawPipeline: StoredString;

  constructor() {
    super();
    // Constructor MUST only contain pointer declarations.
    this.moduleCount = new StoredU256(MODULE_COUNT_POINTER, EMPTY_POINTER);
    this.totalDeposits = new StoredU256(TOTAL_DEPOSITS_POINTER, EMPTY_POINTER);
    this.lastAction = new StoredString(LAST_ACTION_POINTER, 0);

    this.vaultModule = new StoredString(VAULT_MODULE_POINTER, 0);
    this.stakingModule = new StoredString(STAKING_MODULE_POINTER, 0);
    this.rewardsModule = new StoredString(REWARDS_MODULE_POINTER, 0);
    this.timelockModule = new StoredString(TIMELOCK_MODULE_POINTER, 0);
    this.escrowModule = new StoredString(ESCROW_MODULE_POINTER, 0);
    this.nftModule = new StoredString(NFT_MODULE_POINTER, 0);

    this.depositPipeline = new StoredString(DEPOSIT_PIPELINE_POINTER, 0);
    this.withdrawPipeline = new StoredString(WITHDRAW_PIPELINE_POINTER, 0);
  }

  public override onDeployment(_calldata: Calldata): void {
    super.onDeployment(_calldata);
    this.moduleCount.set(u256.Zero);
    this.totalDeposits.set(u256.Zero);
    this.lastAction.value = 'deploy';
    this.depositPipeline.value = 'Vault->Staking->Rewards';
    this.withdrawPipeline.value = 'TimeLock->Escrow->Vault';
  }

  @method(
    { name: 'moduleName', type: ABIDataTypes.STRING },
    { name: 'moduleAddress', type: ABIDataTypes.STRING },
  )
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public registerModule(calldata: Calldata): BytesWriter {
    const moduleName = calldata.readStringWithLength();
    const moduleAddress = calldata.readStringWithLength();

    if (moduleAddress.length === 0) {
      throw new Revert('Module address is required');
    }

    const normalized = moduleName.toLowerCase();
    if (normalized == 'vault') this.vaultModule.value = moduleAddress;
    else if (normalized == 'staking') this.stakingModule.value = moduleAddress;
    else if (normalized == 'rewards') this.rewardsModule.value = moduleAddress;
    else if (normalized == 'timelock') this.timelockModule.value = moduleAddress;
    else if (normalized == 'escrow') this.escrowModule.value = moduleAddress;
    else if (normalized == 'nft') this.nftModule.value = moduleAddress;
    else throw new Revert('Unknown module name');

    this.moduleCount.set(u256.add(this.moduleCount.value, u256.One));
    this.lastAction.value = 'registerModule';

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  @method({ name: 'pipeline', type: ABIDataTypes.STRING })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public setDepositPipeline(calldata: Calldata): BytesWriter {
    const pipeline = calldata.readStringWithLength();
    if (pipeline.length === 0) {
      throw new Revert('Pipeline is required');
    }
    this.depositPipeline.value = pipeline;
    this.lastAction.value = 'setDepositPipeline';

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  @method({ name: 'pipeline', type: ABIDataTypes.STRING })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public setWithdrawPipeline(calldata: Calldata): BytesWriter {
    const pipeline = calldata.readStringWithLength();
    if (pipeline.length === 0) {
      throw new Revert('Pipeline is required');
    }
    this.withdrawPipeline.value = pipeline;
    this.lastAction.value = 'setWithdrawPipeline';

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  /**
   * Execute deposit pipeline by calling module contracts
   */
  private _executeDepositPipeline(user: Address, amount: u256): void {
    const pipeline = this.depositPipeline.value;
    if (pipeline.length === 0) return;

    const modules = pipeline.split('->');
    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i].trim();
      const moduleAddress = this._getModuleAddress(moduleName);
      
      if (moduleAddress.length > 0) {
        // For now, just track the action - actual module calling needs OP_NET SDK clarification
        this.lastAction.value = `deposit_to_${moduleName}`;
        // TODO: Implement actual module calling when OP_NET.call syntax is available
      }
    }
  }

  /**
   * Execute withdraw pipeline by calling module contracts
   */
  private _executeWithdrawPipeline(user: Address, amount: u256): void {
    const pipeline = this.withdrawPipeline.value;
    if (pipeline.length === 0) return;

    const modules = pipeline.split('->');
    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i].trim();
      const moduleAddress = this._getModuleAddress(moduleName);
      
      if (moduleAddress.length > 0) {
        // TODO: Add actual module calling when OP_NET.call syntax is clarified
        this.lastAction.value = `withdraw_from_${moduleName}`;
      }
    }
  }

  /**
   * Get module address by name
   */
  private _getModuleAddress(moduleName: string): string {
    const normalized = moduleName.toLowerCase();
    if (normalized == 'vault') return this.vaultModule.value;
    if (normalized == 'staking') return this.stakingModule.value;
    if (normalized == 'rewards') return this.rewardsModule.value;
    if (normalized == 'timelock') return this.timelockModule.value;
    if (normalized == 'escrow') return this.escrowModule.value;
    if (normalized == 'nft') return this.nftModule.value;
    return '';
  }

  @method({ name: 'amount', type: ABIDataTypes.UINT64 })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public deposit(calldata: Calldata): BytesWriter {
    const amount = calldata.readU64();
    if (amount <= 0) {
      throw new Revert('Deposit amount must be > 0');
    }

    // Basic validation - Max Deposit 100 sats (hardcoded for now)
    if (amount > 100) {
      throw new Revert('Deposit exceeds maximum limit of 100 sats');
    }

    // Execute deposit pipeline
    this._executeDepositPipeline(Blockchain.tx.sender, u256.fromU64(amount));
    
    this.totalDeposits.set(u256.add(this.totalDeposits.value, u256.fromU64(amount)));
    this.lastAction.value = 'deposit';

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  @method({ name: 'amount', type: ABIDataTypes.UINT64 })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public withdraw(calldata: Calldata): BytesWriter {
    const amount = calldata.readU64();
    if (amount <= 0) {
      throw new Revert('Withdraw amount must be > 0');
    }

    // Basic TimeLock validation - check if user has deposited recently
    // This is a simplified version - real TimeLock should be in the module
    const currentBlock = Blockchain.block.number;
    const lockDuration = u256.fromU64(1000); // 1000 blocks
    
    // For demo purposes, we'll add a simple check
    // In production, this should be handled by TimeLock module
    if (u256.fromU64(currentBlock) < lockDuration) {
      throw new Revert('Tokens are still locked for first 1000 blocks');
    }

    const amountU256 = u256.fromU64(amount);
    if (u256.lt(this.totalDeposits.value, amountU256)) {
      throw new Revert('Insufficient total deposits');
    }

    // Execute withdraw pipeline
    this._executeWithdrawPipeline(Blockchain.tx.sender, amountU256);

    this.totalDeposits.set(u256.sub(this.totalDeposits.value, amountU256));
    this.lastAction.value = 'withdraw';

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  @view()
  @method('getModuleCount')
  @returns({ name: 'moduleCount', type: ABIDataTypes.UINT256 })
  public getModuleCount(_calldata: Calldata): BytesWriter {
    const writer = new BytesWriter(U256_BYTE_LENGTH);
    writer.writeU256(this.moduleCount.value);
    return writer;
  }

  @view()
  @method('getTotalDeposits')
  @returns({ name: 'totalDeposits', type: ABIDataTypes.UINT256 })
  public getTotalDeposits(_calldata: Calldata): BytesWriter {
    const writer = new BytesWriter(U256_BYTE_LENGTH);
    writer.writeU256(this.totalDeposits.value);
    return writer;
  }

  @view()
  @method('getDepositPipeline')
  @returns({ name: 'pipeline', type: ABIDataTypes.STRING })
  public getDepositPipeline(_calldata: Calldata): BytesWriter {
    const value = this.depositPipeline.value;
    const writer = new BytesWriter(value.length + 4);
    writer.writeString(value);
    return writer;
  }

  @view()
  @method('getWithdrawPipeline')
  @returns({ name: 'pipeline', type: ABIDataTypes.STRING })
  public getWithdrawPipeline(_calldata: Calldata): BytesWriter {
    const value = this.withdrawPipeline.value;
    const writer = new BytesWriter(value.length + 4);
    writer.writeString(value);
    return writer;
  }
}
