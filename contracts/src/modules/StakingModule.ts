import {
  Address,
  EMPTY_POINTER,
  Blockchain,
  BytesWriter,
  Calldata,
  OP_NET,
  Selector,
  AddressMemoryMap,
  StoredU256,
  Revert,
} from '@btc-vision/btc-runtime/runtime';
import { u256 } from '@btc-vision/as-bignum/assembly';

/**
 * StakingModule — Yield generation module.
 *
 * Tracks staked amounts per user and calculates rewards based on:
 * - APY percentage (stored as basis points, e.g. 1200 = 12%)
 * - Block-based compounding
 *
 * Gas-safe: no loops, O(1) per user operations.
 */
export class StakingModule extends OP_NET {
  private stakedAmounts: AddressMemoryMap | null = null;
  private stakeStartBlock: AddressMemoryMap | null = null;
  private totalStaked: StoredU256 | null = null;
  private apyBasisPoints: StoredU256 | null = null;
  private compoundingEnabled: StoredU256 | null = null;
  private coreContract: Address | null = null;

  constructor() {
    super();
    // Only pointer declarations - 20M gas limit
   }
 
  public override onDeployment(_calldata: Calldata): void {
    // Initialize storage here (gas limit up to 150B)
    this.stakedAmounts = new AddressMemoryMap(Blockchain.nextPointer);
    this.stakeStartBlock = new AddressMemoryMap(Blockchain.nextPointer);
    this.totalStaked = new StoredU256(Blockchain.nextPointer, EMPTY_POINTER);
    this.apyBasisPoints = new StoredU256(Blockchain.nextPointer, EMPTY_POINTER);
    this.compoundingEnabled = new StoredU256(Blockchain.nextPointer, EMPTY_POINTER);
    this.coreContract = Blockchain.tx.sender;
    this.totalStaked!.set(u256.Zero);
    this.apyBasisPoints!.set(u256.fromU64(1200));
    this.compoundingEnabled!.set(u256.One);
  }

  public override execute(method: Selector, calldata: Calldata): BytesWriter {
    switch (method) {
      case 0x0001:
        return this._onDeposit(calldata);
      case 0x0002:
        return this._onWithdraw(calldata);
      case 0x0003:
        return this._setApy(calldata);
      case 0x0010:
        return this._getStakedAmount(calldata);
      case 0x0011:
        return this._getPendingRewards(calldata);
      case 0x0012:
        return this._getTotalStaked();
      default:
        return this._unknownMethod();
    }
  }

  private _onDeposit(calldata: Calldata): BytesWriter {
    this._onlyCore();
    const stakedAmounts = this.stakedAmounts!;
    const stakeStartBlock = this.stakeStartBlock!;
    const totalStaked = this.totalStaked!;

    const user = calldata.readAddress();
    const amount = calldata.readU256();

    const current = stakedAmounts.get(user);
    stakedAmounts.set(user, u256.add(current, amount));

    // Record stake start block for reward calculation
    stakeStartBlock.set(user, u256.fromU64(Blockchain.block.number));

    totalStaked.set(u256.add(totalStaked.value, amount));

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  private _onWithdraw(calldata: Calldata): BytesWriter {
    this._onlyCore();
    const stakedAmounts = this.stakedAmounts!;
    const totalStaked = this.totalStaked!;

    const user = calldata.readAddress();
    const amount = calldata.readU256();

    const current = stakedAmounts.get(user);
    if (u256.lt(current, amount)) {
      throw new Revert('Insufficient staked balance');
    }

    stakedAmounts.set(user, u256.sub(current, amount));

    totalStaked.set(u256.sub(totalStaked.value, amount));

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  private _setApy(calldata: Calldata): BytesWriter {
    this._onlyCore();
    const apyBasisPoints = this.apyBasisPoints!;
    const newApy = calldata.readU64();
    apyBasisPoints.set(u256.fromU64(newApy));

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // --- VIEW ---

  private _getStakedAmount(calldata: Calldata): BytesWriter {
    const stakedAmounts = this.stakedAmounts!;
    const user = calldata.readAddress();
    const writer = new BytesWriter(32);
    writer.writeU256(stakedAmounts.get(user));
    return writer;
  }

  private _getPendingRewards(calldata: Calldata): BytesWriter {
    const stakedAmounts = this.stakedAmounts!;
    const stakeStartBlock = this.stakeStartBlock!;
    const apyBasisPoints = this.apyBasisPoints!;
    
    const user = calldata.readAddress();
    const staked = stakedAmounts.get(user);
    const startBlock = stakeStartBlock.get(user);
    const currentBlock = u256.fromU64(Blockchain.block.number);
    const blocksPassed = u256.sub(currentBlock, startBlock);

    // reward = staked * apyBPS * blocksPassed / (10000 * blocksPerYear)
    // Simplified: reward = staked * apyBPS * blocksPassed / 52560000
    const apy = apyBasisPoints.value;
    const numerator = u256.mul(u256.mul(staked, apy), blocksPassed);
    const denominator = u256.fromU64(52560000); // 10000 * 5256 blocks/year approx
    const reward = u256.div(numerator, denominator);

    const writer = new BytesWriter(32);
    writer.writeU256(reward);
    return writer;
  }

  private _getTotalStaked(): BytesWriter {
    const totalStaked = this.totalStaked!;
    const writer = new BytesWriter(32);
    writer.writeU256(totalStaked.value);
    return writer;
  }

  private _onlyCore(): void {
    const coreContract = this.coreContract!;
    if (Blockchain.tx.sender != coreContract) {
      throw new Revert('Only core contract');
    }
  }

  private _unknownMethod(): BytesWriter {
    throw new Revert('Unknown method');
    return new BytesWriter(0);
  }
}
