import * as Mongoose from 'mongoose';

import { RepositoryQueryCommand } from './RepositoryQuery';
import { RepositoryQueryResult } from './RepositoryQueryResult';
import { DatabaseException } from './DatabaseException';

export interface IRepository<TDoc extends Mongoose.Document>{
    Find(query:RepositoryQueryCommand):Promise<RepositoryQueryResult<TDoc>>;
    Get(id:string):Promise<TDoc>;    
    
    Add(command:BaseAddEntityCommand<TDoc>):Promise<TDoc>;  
    Save(command:BaseSaveEntityCommand<TDoc>):Promise<TDoc>;
    Delete(command:BaseDeleteEntityCommand<TDoc>):Promise<TDoc>;  
} 

export interface IRepositoryEntityCommand<T>{
    entity:T;    
}

export abstract class RepositoryEntityCommand<T> implements IRepositoryEntityCommand<T>{        
    constructor(public entity:T){
        
    }    
}

export abstract class BaseSaveEntityCommand<T> extends RepositoryEntityCommand<T>{}
export abstract class BaseAddEntityCommand<T> extends BaseSaveEntityCommand<T>{}
export abstract class BaseDeleteEntityCommand<T> extends RepositoryEntityCommand<T>{}

export abstract class Repository<IDocumentModel extends Mongoose.Document> implements IRepository<IDocumentModel>{
    protected model:Mongoose.Model<IDocumentModel>;
    
    constructor(model:Mongoose.Model<IDocumentModel>){
        this.model = model;    
    }
    
    Find(command:RepositoryQueryCommand): Promise<RepositoryQueryResult<IDocumentModel>>{
        let db:Mongoose.Model<IDocumentModel> = this.model;
        return new Promise(function(resolve, reject){                        
            
            db.find(command.query)
                .sort(command.sort)
                .limit(command.limit)
                .skip(command.skip)
                .exec(function(error:any, docs:IDocumentModel[]){
                     db.count(command.query, function(err: any, count: number) {
                        if (err)
                            reject(new DatabaseException(err));
                        else
                            resolve(new RepositoryQueryResult(count, command.page, docs.length, docs, command.sort));
                    });                   
                });                                       
        });
    }
    
    Get(id:string):Promise<IDocumentModel>{
        let search = this.model.findOne({ _id:id });

        return new Promise(function(resolve, reject) {
            search.exec(function(error:any, document:IDocumentModel) {
                if (error)
                    reject(new DatabaseException(error))
                else
                    resolve(document);
            })

        });        
    }
    
    Add(command:BaseAddEntityCommand<IDocumentModel>):Promise<IDocumentModel>{
        return this.Save(command);
    }
        
    Save(command:BaseSaveEntityCommand<IDocumentModel>):Promise<IDocumentModel>{
        let db = this.model;
        console.log(`Saving command ${JSON.stringify(command)}`);
        
        return new Promise(function(resolve, reject) {
            command.entity.save(function(error:any, document:IDocumentModel) {
                if (error)
                    reject(new DatabaseException(error))
                else{
                    console.log(`${JSON.stringify(document)} saved.`);
                    resolve(document);                    
                }
                    
            })

        });                
    }            
    
    Delete(command:BaseDeleteEntityCommand<IDocumentModel>):Promise<IDocumentModel>{
        let db = this.model;
        return new Promise(function(resolve, reject) {
            command.entity.remove(function(error:any) {
                if (error)
                    reject(new DatabaseException(error))
                else
                    resolve(command.entity);
            })
        });                
    }    
}