import * as Mongoose from 'mongoose';

export interface IQueryBase{
    sort?:string;
    limit?:string;
    page?:string;
}

export interface IQuery extends IQueryBase {
    q?:string;

}

export interface IQueryByName extends IQueryBase{
    name:string;
}

/**
 * RepositoryQueryCommand
 * 
 */
export class RepositoryQueryCommand {
    private static defaultLimit:string = '10';
    private static defaultSortField: string = 'name';
    public skip:number = 0;

    constructor(public query: any = {}, public sort: string = 'name', public limit: number = 10, public page: number = 1) {
        this.skip = (this.page - 1) * this.limit;
    }

    public static ParseRequest(query: IQuery): RepositoryQueryCommand {
        
        return new RepositoryQueryCommand(
            JSON.parse(query.q || "{ }"),
            query.sort || RepositoryQueryCommand.defaultSortField,
            parseInt(query.limit || RepositoryQueryCommand.defaultLimit),
            parseInt(query.page || '1'));
    }

    public static ParseRequestForNameSearch(query:IQueryByName): RepositoryQueryCommand {
        let queryCommand = RepositoryQueryCommand.ParseRequest(query);
        queryCommand.query = { name: new RegExp(`^.*${query.name}.*$`, 'i') };

        return queryCommand;
    }

}

