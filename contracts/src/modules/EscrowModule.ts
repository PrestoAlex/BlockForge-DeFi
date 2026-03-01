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
 * EscrowModule — Optional escrow with controller approval.
 *
 * On withdraw pipeline: if requireApproval is set, the controller
 * address must approve the withdrawal before funds are released.
 *
 * Gas-safe: O(1) operations, no loops.
 */
@final
export class EscrowModule extends OP_NET {
  private escrowBalances: AddressMemoryMap | null = null;
  private approvals: AddressMemoryMap | null = null;
  private controller: Address | null = null;
  private requireApproval: StoredU256 | null = null;
  private coreContract: Address | null = null;

  constructor() {
    super();
    // Keep constructor minimal to stay under OP_NET constructor gas limit.
  }

  public override onDeployment(_calldata: Calldata): void {
    this.escrowBalances = new AddressMemoryMap(Blockchain.nextPointer);
    this.approvals = new AddressMemoryMap(Blockchain.nextPointer);
    this.requireApproval = new StoredU256(Blockchain.nextPointer, EMPTY_POINTER);
    this.coreContract = Blockchain.tx.sender;
    this.controller = Blockchain.tx.sender;
    this.requireApproval!.set(u256.One);
  }

  public override execute(method: Selector, calldata: Calldata): BytesWriter {
    switch (method) {
      case 0x0001:
        return this._onDeposit(calldata);
      case 0x0002:
        return this._onWithdraw(calldata);
      case 0x0003:
        return this._approve(calldata);
      case 0x0004:
        return this._setController(calldata);
      case 0x0010:
        return this._getEscrowBalance(calldata);
      case 0x0011:
        return this._isApproved(calldata);
      default:
        return this._unknownMethod();
    }
  }

  private _onDeposit(calldata: Calldata): BytesWriter {
    this._onlyCore();
    const escrowBalances = this.escrowBalances!;
    const approvals = this.approvals!;
    const user = calldata.readAddress();
    const amount = calldata.readU256();

    const current = escrowBalances.get(user);
    escrowBalances.set(user, u256.add(current, amount));

    // Reset approval on new deposit
    approvals.set(user, u256.Zero);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  private _onWithdraw(calldata: Calldata): BytesWriter {
    this._onlyCore();
    const escrowBalances = this.escrowBalances!;
    const approvals = this.approvals!;
    const requireApproval = this.requireApproval!;
    const user = calldata.readAddress();
    const amount = calldata.readU256();

    // Check approval if required
    const needsApproval = requireApproval.value;
    if (!u256.eq(needsApproval, u256.Zero)) {
      const approved = approvals.get(user);
      if (u256.eq(approved, u256.Zero)) {
        throw new Revert('Withdrawal not approved by controller');
      }
    }

    const current = escrowBalances.get(user);
    if (u256.lt(current, amount)) {
      throw new Revert('Insufficient escrow balance');
    }
    escrowBalances.set(user, u256.sub(current, amount));

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  /**
   * Controller approves a user's withdrawal.
   * calldata: [user: Address]
   */
  private _approve(calldata: Calldata): BytesWriter {
    const controller = this.controller!;
    const approvals = this.approvals!;
    if (Blockchain.tx.sender != controller) {
      throw new Revert('Only controller');
    }
    const user = calldata.readAddress();
    approvals.set(user, u256.One);

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  private _setController(calldata: Calldata): BytesWriter {
    this._onlyCore();
    this.controller = calldata.readAddress();

    const writer = new BytesWriter(32);
    writer.writeBoolean(true);
    return writer;
  }

  // --- VIEW ---

  private _getEscrowBalance(calldata: Calldata): BytesWriter {
    const escrowBalances = this.escrowBalances!;
    const user = calldata.readAddress();
    const writer = new BytesWriter(32);
    writer.writeU256(escrowBalances.get(user));
    return writer;
  }

  private _isApproved(calldata: Calldata): BytesWriter {
    const approvals = this.approvals!;
    const user = calldata.readAddress();
    const approved = approvals.get(user);
    const writer = new BytesWriter(32);
    writer.writeBoolean(!u256.eq(approved, u256.Zero));
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
