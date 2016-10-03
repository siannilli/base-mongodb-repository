import * as Mongoose from 'mongoose';

/**
 * RepositoryQueryResult
 */
export class RepositoryQueryResult<T extends Mongoose.Document> {
    constructor(public found: number = 0, public page: number = 1, public viewcount: number, public view: T[], public sortfields?: string) {

    }
}