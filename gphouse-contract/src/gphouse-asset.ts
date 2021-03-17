/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class gphousesAsset {

    @Property()
    public value: string;
    public location : string;
    public nocerti : string;
    public price : number;
    public discount : string;

}
