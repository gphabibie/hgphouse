/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { gphousesAsset } from './gphouse-asset';
 
@Info({title: 'GphouseAssetContract', description: 'My Smart Contract' })
export class GphouseAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async gphouseAssetExists(ctx: Context, gphouseAssetId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(gphouseAssetId);
        return (!!data && data.length > 0);
    }    

    @Transaction()
    public async createGphouseAsset(ctx: Context, gphouseAssetId: string, location: string, nocerti: string, price: number): Promise<void> {
        const hasAccess = await this.hasRole(ctx, ['Developer']);
        if (!hasAccess) {
            throw new Error(`Only developer can create house asset`);
        }
        const exists = await this.gphouseAssetExists(ctx, gphouseAssetId);
        if (exists) {
            throw new Error(`The gphouse asset ${gphouseAssetId} already exists`);
        }
        const gphouseAsset = new gphousesAsset();
        gphouseAsset.location = location;
        gphouseAsset.nocerti = nocerti;
        gphouseAsset.price = price;
        const buffer = Buffer.from(JSON.stringify(gphouseAsset));
        await ctx.stub.putState(gphouseAssetId, buffer);
        
        const transientMap = ctx.stub.getTransient();
        if (transientMap.get('discount')) {
            await ctx.stub.putPrivateData('productionDiscount', gphouseAssetId, transientMap.get('discount'));
        }
    }

    @Transaction(false)
    @Returns('gphouseAsset')
    public async readGphouseAsset(ctx: Context, gphouseAssetId: string): Promise<gphousesAsset> {
        const exists = await this.gphouseAssetExists(ctx, gphouseAssetId);
        if (!exists) {
            throw new Error(`The gphouse asset ${gphouseAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(gphouseAssetId);
        const gphouseAsset = JSON.parse(buffer.toString()) as gphousesAsset;
        //return gphouseAsset;
        
        try {
            const privBuffer = await ctx.stub.getPrivateData('productionDiscount', gphouseAssetId);
            gphouseAsset.discount = privBuffer.toString();
            return gphouseAsset;
        } catch (error) {
            return gphouseAsset;
        }

    }

    @Transaction()
    public async updateGphouseAsset(ctx: Context, gphouseAssetId: string, location: string, nocerti: string, price: number): Promise<void> {
        const hasAccess = await this.hasRole(ctx, ['Developer', 'Goverment']);
        if (!hasAccess) {
            throw new Error(`Only developer or goverment can update house asset`);
        }
        const exists = await this.gphouseAssetExists(ctx, gphouseAssetId);
        if (!exists) {
            throw new Error(`The gphouse asset ${gphouseAssetId} does not exist`);
        }
        const gphouseAsset = new gphousesAsset();
        gphouseAsset.location = location;
        gphouseAsset.nocerti = nocerti;
        gphouseAsset.price = price;
        const buffer = Buffer.from(JSON.stringify(gphouseAsset));
        await ctx.stub.putState(gphouseAssetId, buffer);
    }

    @Transaction()
    public async deleteGphouseAsset(ctx: Context, gphouseAssetId: string): Promise<void> {
        const hasAccess = await this.hasRole(ctx, ['Goverment']);
        if (!hasAccess) {
            throw new Error(`Only goverment can delete house asset`);
        }
        const exists = await this.gphouseAssetExists(ctx, gphouseAssetId);
        if (!exists) {
            throw new Error(`The gphouse asset ${gphouseAssetId} does not exist`);
        }
        await ctx.stub.deleteState(gphouseAssetId);
    }

    @Transaction(false)
    public async queryAllAssets(ctx: Context): Promise<string> {
        const startKey = '000';
        const endKey = '999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    @Transaction(false)
    public async queryBylocation(ctx: Context, location: string): Promise<string> {
        const query = { selector: { location } };
        const queryString = JSON.stringify(query);
        const iterator = await ctx.stub.getQueryResult(queryString);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    @Transaction(false)
    public async queryByMinprice(ctx: Context, min: number, size: number, bookmark?: string): Promise<string> {
        const query = { selector: { price: { $gte: min } } };
        const queryString = JSON.stringify(query);

        const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(queryString, size, bookmark);

        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                const result = {
                    results: allResults,
                    metadata
                };
                console.log('end of data');
                await iterator.close();
                console.info(result);
                return JSON.stringify(result);
            }
        }
    }

    @Transaction(false)
    public async getHistoryByKey(ctx: Context, gphouseAssetId: string): Promise<string> {
        const iterator = await ctx.stub.getHistoryForKey(gphouseAssetId);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    public async hasRole(ctx: Context, roles: string[]) {
        const clientID = ctx.clientIdentity;
        for (const roleName of roles) {
            if (clientID.assertAttributeValue('role', roleName)) {
                if (clientID.getMSPID() === 'Org1MSP' && clientID.getAttributeValue('role') === 'Developer') { return true; }
                if (clientID.getMSPID() === 'Org2MSP' && clientID.getAttributeValue('role') === 'Goverment') { return true; }
            }
        }
        return false;
    }

}