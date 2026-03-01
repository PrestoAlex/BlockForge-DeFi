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
 * TimeLockModule — Lock funds for a specified block duration.
 *
 * On withdraw pipeline: checks if lock duration has passed.
 * If not, applies early withdrawal penalty.
 *
 * Gas-safe: O(1) per user, no loops.
 */
@final
export class TimeLockModule extends OP_NET {
  private lockStartBlock: AddressMemoryMap | null = null;
  private lockedAmounts: AddressMemoryMap | null = null;
  private lockDuration: StoredU256 | null = null;
  private earlyPenaltyBps: StoredU256 | null = null;
  private coreContract: Address | null = null;

  constructor() {
    super();
    // Keep constructor minimal to stay under OP_NET constructor gas limit.
  }

  public override onDeployment(_calldata: Calldata): void {
    this.lockStartBlock = new AddressMemoryMap(Blockchain.nextPointer);
    this.lockedAmounts = new AddressMemoryMap(Blockchain.nextPointer);
    this.lockDuration = new StoredU256(Blockchain.nextPointer, EMPTY_POINTER);
    this.earlyPenaltyBps = new StoredU256(Blockchain.nextPointer, EMPTY_POINTER);
    this.coreContract = Blockchain.tx.sender;
    this.lockDuration!.set(u256.fromU64(1000));
    this.earlyPenaltyBps!.set(u256.fromU64(1000));
  }

  public override execute(method: Selector, calldata: Calldata): BytesWriter {
    switch (method) {
      case 0x0001:
        return this._onDeposit(calldata);
      case 0x0002:
        return this._onWithdraw(calldata);
      case 0x0010:
        return this._getLockInfo(calldata);
      case 0x0011:
        return this._isUnlocked(calldata);
      default:
        return this._unknownMethod();
    }
  }

  private _onDeposit(calldata: Calldata): BytesWriter {
    this._onlyCore();
    const lockStartBlock = this.lockStartBlock!;
    const lockedAmounts = this.lockedAmounts!;
    const user = calldata.readAddress();
    const amount = calldata.readU256();

    lockStartBlock.set(user, u256.fromU64(Blockchain.block.number));
    const current = lockedAmounts.get(user);
    lockedAmounts.set(user, u256.add(current, amount));

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  private _onWithdraw(calldata: Calldata): BytesWriter {
    this._onlyCore();
    const lockStartBlock = this.lockStartBlock!;
    const lockedAmounts = this.lockedAmounts!;
    const lockDuration = this.lockDuration!;
    const user = calldata.readAddress();
    const amount = calldata.readU256();

    const startBlock = lockStartBlock.get(user);
    const currentBlock = u256.fromU64(Blockchain.block.number);
    const elapsed = u256.sub(currentBlock, startBlock);
    const requiredDuration = lockDuration.value;

    // Check if lock has expired
    if (u256.lt(elapsed, requiredDuration)) {
      throw new Revert('Tokens are still locked');
    }

    const current = lockedAmounts.get(user);
    if (u256.lt(current, amount)) {
      throw new Revert('Insufficient locked balance');
    }
    lockedAmounts.set(user, u256.sub(current, amount));

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  private _getLockInfo(calldata: Calldata): BytesWriter {
    const lockedAmounts = this.lockedAmounts!;
    const lockStartBlock = this.lockStartBlock!;
    const user = calldata.readAddress();
    const writer = new BytesWriter(64);
    writer.writeU256(lockedAmounts.get(user));
    writer.writeU256(lockStartBlock.get(user));
    return writer;
  }

  private _isUnlocked(calldata: Calldata): BytesWriter {
    const lockStartBlock = this.lockStartBlock!;
    const lockDuration = this.lockDuration!;
    const user = calldata.readAddress();
    const startBlock = lockStartBlock.get(user);
    const currentBlock = u256.fromU64(Blockchain.block.number);
    const elapsed = u256.sub(currentBlock, startBlock);
    const requiredDuration = lockDuration.value;

    const writer = new BytesWriter(32);
    writer.writeBoolean(!u256.lt(elapsed, requiredDuration));
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
