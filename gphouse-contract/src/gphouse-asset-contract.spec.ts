/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { GphouseAssetContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('GphouseAssetContract', () => {

    let contract: GphouseAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new GphouseAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"gphouse asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"gphouse asset 1002 value"}'));
    });

    describe('#gphouseAssetExists', () => {

        it('should return true for a gphouse asset', async () => {
            await contract.gphouseAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a gphouse asset that does not exist', async () => {
            await contract.gphouseAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createGphouseAsset', () => {

        it('should create a gphouse asset', async () => {
            await contract.createGphouseAsset(ctx, '1003', 'gphouse asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"gphouse asset 1003 value"}'));
        });

        it('should throw an error for a gphouse asset that already exists', async () => {
            await contract.createGphouseAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The gphouse asset 1001 already exists/);
        });

    });

    describe('#readGphouseAsset', () => {

        it('should return a gphouse asset', async () => {
            await contract.readGphouseAsset(ctx, '1001').should.eventually.deep.equal({ value: 'gphouse asset 1001 value' });
        });

        it('should throw an error for a gphouse asset that does not exist', async () => {
            await contract.readGphouseAsset(ctx, '1003').should.be.rejectedWith(/The gphouse asset 1003 does not exist/);
        });

    });

    describe('#updateGphouseAsset', () => {

        it('should update a gphouse asset', async () => {
            await contract.updateGphouseAsset(ctx, '1001', 'gphouse asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"gphouse asset 1001 new value"}'));
        });

        it('should throw an error for a gphouse asset that does not exist', async () => {
            await contract.updateGphouseAsset(ctx, '1003', 'gphouse asset 1003 new value').should.be.rejectedWith(/The gphouse asset 1003 does not exist/);
        });

    });

    describe('#deleteGphouseAsset', () => {

        it('should delete a gphouse asset', async () => {
            await contract.deleteGphouseAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a gphouse asset that does not exist', async () => {
            await contract.deleteGphouseAsset(ctx, '1003').should.be.rejectedWith(/The gphouse asset 1003 does not exist/);
        });

    });

});
