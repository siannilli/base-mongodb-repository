# base-mongodb-repository
Abstract repository, Typescript classes for MongoDB basic CRUD operations (through mongoose)

# Install
This module is not in the npm register (yet, at least).
To install and use it in your node.js project you can use the git notation in your package.json.

```package
{
      "dependencies": {
        "base-rest-service": "git+https://github.com/siannilli/base-rest-service.git",
        ...
}
```

# Usage
Define the mongoose schema and exports model interfaces as follows

```Typescript
import * as mongoose from 'mongoose';
import * as Repository from 'base-mongodb-repository/build/IRepository';

// mongoose schema
var schema = new mongoose.Schema(
    {
        name: { type: String, unique: true },
        email: String,        
    }
);

// TS interface
export interface ITest {
    name: string;
    email: string;
}

export interface ITestModel extends ITest, mongoose.Document{

}

let TestSchema = mongoose.model<ITestModel>('test', schema, 'test_collection', true);
    
```

Derive a new repository class from the abstract generic class `Repository<T>`

```Typescript
export class TestRepository extends Repository.Repository<ITestModel> {
    constructor(){        
        super(TestSchema);
    }
}
```
Export repository commands as per your need.
Repository command can be as many as you need. 
Each command can implement specific, data level, entity validation rules. 

As minimum, you have to define a command to Add entity and a command for Update the entity as follows:

```Typescript
/*
* Add command must create a new instance of the testModel
*/
export class TestRepositoryAddCommand extends Repository.RepositoryEntityCommand<ITestModel>{
    constructor(entity:ITest){
        let testModel = mongoose.model<ITestModel>('test');
        let test = new testModel({ name: entity.name, email: entity.email});
        super(test);
        console.log(test.name);
    }
}

/*
* Update command works with a ITestModel instance, as it has already been read from db
* Update command can also be used to Delete entity   
*/
export class TestRepositoryUpdateCommand extends Repository.RepositoryEntityCommand<ITestModel>{
    constructor(doc:ITestModel){
        super(doc);                
    }
}
``` 
# Example
Let's say you are writing a membership repository.
The goal of such that repository is to manage CRUD operations of a users collection.

For the sake of readiness, the UserRepository implements business methods that better match user stories.
Eg. HandleChangePassword, HandleChangeEmailAddress, and so on.

```Typescript
export class UserRepository extends Repository.Repository<IUserModel> {
    constructor() {
        super(UserSchema);
    }
...

    // Persist new password updating the entity instance inside the Command 
    public HandleChangePassword(command: ChangePasswordCommand): Promise.IThenable<IUserModel> {
        return this.Save(command);
    }
``` 

Each method accept a specific repository command, with specific validation rules. 
Each method derives from ```BaseSaveEntityCommand<T>``` or ```BaseRepositoryCommand<T>```, so the repository method have access to the entity property, of type ```T```.

```Typescript
/**
 *  ChangePasswordCommand
 */
export class ChangePasswordCommand extends Repository.BaseSaveEntityCommand<IUserModel> {
    constructor(user: IUserModel, oldpassword: string, password: string, password_confirm: string) {
        super(user);

        BaseUserCommand.ValidatePassword(password);

        if (password !== password_confirm)
            throw new Errors.MalformedEntityError('Passoword and passoword confirm don\'t match');

        if (UserRepository.HashPassword(oldpassword) !== user.password)
            throw new Errors.MalformedEntityError('Old password doesn\'t match');

        user.password = UserRepository.HashPassword(password);

    }
}
```