import * as mongoose from 'mongoose';

import { RepositoryQueryCommand } from '../RepositoryQuery';
import { RepositoryQueryResult } from '../RepositoryQueryResult';
import * as Repository from '../IRepository';
import { DatabaseException } from '../DatabaseException';

// mongoose schema
var schema = new mongoose.Schema(
    {
        name: { type: String, unique: true },
        email: String,        
    }
);

export interface ITestModel extends ITest, mongoose.Document{

}

export let TestSchema = mongoose.model<ITestModel>('test', schema, 'test_collection', true);
    
// TS interface
export interface ITest {
    name: string;
    email: string;
}


export class TestRepository extends Repository.Repository<ITestModel> {
    constructor(){        
        super(TestSchema);
    }
}

export class TestRepositoryAddCommand extends Repository.RepositoryEntityCommand<ITestModel>{
    constructor(entity:ITest){
        let testModel = mongoose.model<ITestModel>('test');
        let test = new testModel({ name: entity.name, email: entity.email});
        super(test);
        console.log(test.name);
    }
}

export class TestRepositoryUpdateCommand extends Repository.RepositoryEntityCommand<ITestModel>{
    constructor(doc:ITestModel){
        super(doc);                
    }
}