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
 * VaultModule — Core deposit/withdrawal module.
 *
 * Implements the Module interface:
 *   onDeposit(user, amount) — stores user balance
 *   onWithdraw(user, amount) — reduces user balance
 *
 * Storage: user → balance mapping, total vault balance.
 * Gas-safe: no loops, minimal storage ops.
 */
export class VaultModule extends OP_NET {
  private balances: AddressMemoryMap | null = null;
  private totalBalance: StoredU256 | null = null;
  private coreContract: Address | null = null;

  constructor() {
    super();
    // Only pointer declarations - 20M gas limit
   }
 
  public override onDeployment(_calldata: Calldata): void {
    // Initialize storage here (gas limit up to 150B)
    this.balances = new AddressMemoryMap(Blockchain.nextPointer);
    this.totalBalance = new StoredU256(Blockchain.nextPointer, EMPTY_POINTER);
    this.coreContract = Blockchain.tx.sender;
    this.totalBalance!.set(u256.Zero);
  }

  public override execute(method: Selector, calldata: Calldata): BytesWriter {
    switch (method) {
      case 0x0001:
        return this._onDeposit(calldata);
      case 0x0002:
        return this._onWithdraw(calldata);
      case 0x0010:
        return this._getBalance(calldata);
      case 0x0011:
        return this._getTotalBalance();
      default:
        return this._unknownMethod();
    }
  }

  /**
   * onDeposit — called by CoreContract during deposit pipeline.
   * calldata: [user: Address, amount: u256]
   */
  private _onDeposit(calldata: Calldata): BytesWriter {
    this._onlyCore();
    const balances = this.balances!;
    const totalBalance = this.totalBalance!;

    const user = calldata.readAddress();
    const amount = calldata.readU256();

    // Update user balance
    const currentBalance = balances.get(user);
    balances.set(user, u256.add(currentBalance, amount));

    // Update total
    totalBalance.set(u256.add(totalBalance.value, amount));

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  /**
   * onWithdraw — called by CoreContract during withdraw pipeline.
   * calldata: [user: Address, amount: u256]
   */
  private _onWithdraw(calldata: Calldata): BytesWriter {
    this._onlyCore();
    const balances = this.balances!;
    const totalBalance = this.totalBalance!;

    const user = calldata.readAddress();
    const amount = calldata.readU256();

    const currentBalance = balances.get(user);
    if (u256.lt(currentBalance, amount)) {
      throw new Revert('Insufficient vault balance');
    }

    balances.set(user, u256.sub(currentBalance, amount));

    totalBalance.set(u256.sub(totalBalance.value, amount));

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // --- VIEW METHODS ---

  private _getBalance(calldata: Calldata): BytesWriter {
    const balances = this.balances!;
    const user = calldata.readAddress();
    const balance = balances.get(user);
    const writer = new BytesWriter(32);
    writer.writeU256(balance);
    return writer;
  }

  private _getTotalBalance(): BytesWriter {
    const totalBalance = this.totalBalance!;
    const writer = new BytesWriter(32);
    writer.writeU256(totalBalance.value);
    return writer;
  }

  // --- HELPERS ---

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
