import { ObjectId } from "mongoose";

export interface T{
    [key: string] : any
}


export interface StatisticModifier {
    _id: ObjectId,
    targetKey: string,
    modifier: number,
}
