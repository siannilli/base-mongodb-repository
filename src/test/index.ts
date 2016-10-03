import * as mongoose from 'mongoose';
import * as mongodb from 'mongodb';
import { TestRepository, TestRepositoryAddCommand, TestRepositoryUpdateCommand, ITest, ITestModel } from './TestRepository';
import { RepositoryQueryCommand, IQuery } from '../src/RepositoryQuery'
import { RepositoryQueryResult } from '../src/RepositoryQueryResult';

mongoose.connect(process.env.DATASTORE)
    .then(() => {
        let repo = new TestRepository();
        let doc:ITest = { "name": "stefano", "email": "stefano.iannilli@gmail.com"};

        // Create entity
        let user = repo.Add(new TestRepositoryAddCommand(doc))
            .then((value:ITestModel) => {
                console.log(`Created user ${value.name} with id ${value._id}`);

                // Update entity
                value.name = 'Stefano I.';
                repo.Save(new TestRepositoryUpdateCommand(value))
                    .then((valueUpdated:ITestModel) => {
                        console.log(`Updated user ${valueUpdated.name} (from ${value.name}) with id ${valueUpdated._id}`);

                        // Read entity (with a search)
                        let query:IQuery = { q: '{"name": "Stefano I."}'}
                        repo.Find(RepositoryQueryCommand.ParseRequest(query))
                            .then((searchResult:RepositoryQueryResult<ITestModel>) => {
                                console.assert(searchResult.found === 1); // assert found just 1 item
                                console.log(`Found ${searchResult.view[0].name} with id ${searchResult.view[0]._id}`);
                            
                                // Get entity by id
                                repo.Get(value._id).then((doc:ITestModel) =>
                                {

                                    console.log(`Get document by id ${doc._id}`);

                                    // Delete entity
                                    repo.Delete(new TestRepositoryUpdateCommand(doc))
                                        .then((val:ITestModel) => {                                    
                                            console.log(`Deleted entity ${val._id}`);

                                            // Get entity but fails 
                                            let query:IQuery = { q: '{"name": "Stefano I."}'}
                                            repo.Find(RepositoryQueryCommand.ParseRequest(query))
                                                .then((searchResult:RepositoryQueryResult<ITestModel>) => {
                                                    console.log(`Found ${searchResult.found} items in the collection.`);
                                                    console.assert(searchResult.found === 0);

                                                    console.log('Test completed successfully!');
                                                },
                                                (err: any) => console.error(err));
                                        },
                                        (err: any) => console.error(err));
                                }
                                , (err:any) => console.error(err));
                            }
                            , (err: any) => console.error(err));
                    }, 
                    (err: any) => console.error(err));
            }, 
            (err:any) => console.error(err));
    }, 
    (err:mongodb.MongoError) => console.error(err.message));