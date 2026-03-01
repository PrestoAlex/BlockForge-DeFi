import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the registerModule function call.
 */
export type RegisterModule = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the setDepositPipeline function call.
 */
export type SetDepositPipeline = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the setWithdrawPipeline function call.
 */
export type SetWithdrawPipeline = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the deposit function call.
 */
export type Deposit = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the withdraw function call.
 */
export type Withdraw = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getModuleCount function call.
 */
export type GetModuleCount = CallResult<
    {
        moduleCount: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getTotalDeposits function call.
 */
export type GetTotalDeposits = CallResult<
    {
        totalDeposits: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getDepositPipeline function call.
 */
export type GetDepositPipeline = CallResult<
    {
        pipeline: string;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getWithdrawPipeline function call.
 */
export type GetWithdrawPipeline = CallResult<
    {
        pipeline: string;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// ICoreContract
// ------------------------------------------------------------------
export interface ICoreContract extends IOP_NETContract {
    registerModule(moduleName: string, moduleAddress: string): Promise<RegisterModule>;
    setDepositPipeline(pipeline: string): Promise<SetDepositPipeline>;
    setWithdrawPipeline(pipeline: string): Promise<SetWithdrawPipeline>;
    deposit(amount: bigint): Promise<Deposit>;
    withdraw(amount: bigint): Promise<Withdraw>;
    getModuleCount(): Promise<GetModuleCount>;
    getTotalDeposits(): Promise<GetTotalDeposits>;
    getDepositPipeline(): Promise<GetDepositPipeline>;
    getWithdrawPipeline(): Promise<GetWithdrawPipeline>;
}
