/*
* Use this file for functional testing of your smart contract.
* Fill out the arguments and return values for a function and
* use the CodeLens links above the transaction blocks to
* invoke/submit transactions.
* All transactions defined in your smart contract are used here
* to generate tests, including those functions that would
* normally only be used on instantiate and upgrade operations.
* This basic test file can also be used as the basis for building
* further functional tests to run as part of a continuous
* integration pipeline, or for debugging locally deployed smart
* contracts by invoking/submitting individual transactions.
*/
/*
* Generating this test file will also trigger an npm install
* in the smart contract project directory. This installs any
* package dependencies, including fabric-network, which are
* required for this test file to be run locally.
*/

import * as assert from 'assert';
import * as fabricNetwork from 'fabric-network';
import { SmartContractUtil } from './ts-smart-contract-util';

import * as os from 'os';
import * as path from 'path';

describe('GpmotorAssetContract-gpmotor-contract@0.0.2' , () => {

    const homedir: string = os.homedir();
    const walletPath: string = path.join(homedir, '.fabric-vscode', 'v2', 'environments', '1 Org local Fabric', 'wallets', 'Org1');
    const gateway: fabricNetwork.Gateway = new fabricNetwork.Gateway();
    let fabricWallet: fabricNetwork.Wallet;
    const identityName: string = 'Org1 Admin';
    let connectionProfile: any;

    before(async () => {
        connectionProfile = await SmartContractUtil.getConnectionProfile();
        fabricWallet = await fabricNetwork.Wallets.newFileSystemWallet(walletPath);
    });

    beforeEach(async () => {
        const discoveryAsLocalhost: boolean = SmartContractUtil.hasLocalhostURLs(connectionProfile);
        const discoveryEnabled: boolean = true;

        const options: fabricNetwork.GatewayOptions = {
            discovery: {
                asLocalhost: discoveryAsLocalhost,
                enabled: discoveryEnabled,
            },
            identity: identityName,
            wallet: fabricWallet,
        };

        await gateway.connect(connectionProfile, options);
    });

    afterEach(async () => {
        gateway.disconnect();
    });

    describe('gpmotorAssetExists', () => {
        it('should submit gpmotorAssetExists transaction', async () => {
            // TODO: populate transaction parameters
            const gpmotorAssetId: string = '002';
            const args: string[] = [ gpmotorAssetId];

            const response: Buffer = await SmartContractUtil.submitTransaction('GpmotorAssetContract', 'gpmotorAssetExists', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            //assert.equal(true, true);
            assert.equal(JSON.parse(response.toString()), true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('createGpmotorAsset', () => {
        it('should submit createGpmotorAsset transaction', async () => {
            // TODO: populate transaction parameters
            const gpmotorAssetId: string = 'EXAMPLE';
            const value: string = 'EXAMPLE';
            const args: string[] = [ gpmotorAssetId, value];

            const response: Buffer = await SmartContractUtil.submitTransaction('GpmotorAssetContract', 'createGpmotorAsset', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('readGpmotorAsset', () => {
        it('should submit readGpmotorAsset transaction', async () => {
            // TODO: populate transaction parameters
            const gpmotorAssetId: string = 'EXAMPLE';
            const args: string[] = [ gpmotorAssetId];

            const response: Buffer = await SmartContractUtil.submitTransaction('GpmotorAssetContract', 'readGpmotorAsset', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('updateGpmotorAsset', () => {
        it('should submit updateGpmotorAsset transaction', async () => {
            // TODO: populate transaction parameters
            const gpmotorAssetId: string = 'EXAMPLE';
            const newValue: string = 'EXAMPLE';
            const args: string[] = [ gpmotorAssetId, newValue];

            const response: Buffer = await SmartContractUtil.submitTransaction('GpmotorAssetContract', 'updateGpmotorAsset', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('deleteGpmotorAsset', () => {
        it('should submit deleteGpmotorAsset transaction', async () => {
            // TODO: populate transaction parameters
            const gpmotorAssetId: string = 'EXAMPLE';
            const args: string[] = [ gpmotorAssetId];

            const response: Buffer = await SmartContractUtil.submitTransaction('GpmotorAssetContract', 'deleteGpmotorAsset', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('queryAllAssets', () => {
        it('should submit queryAllAssets transaction', async () => {
            // TODO: Update with parameters of transaction
            const args: string[] = [];

            const response: Buffer = await SmartContractUtil.submitTransaction('GpmotorAssetContract', 'queryAllAssets', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

});
