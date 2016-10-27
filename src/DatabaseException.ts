
export class DatabaseException extends Error{
    constructor(public innerException:Error, message?:string, public name:string = 'Database error' ){
        super(message || innerException.message || 'Undefined database exception')
        
    }
}