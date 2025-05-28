class ApiError extends Error{
    constructor(
        statuscode,
        message,
        errors=[],
        stack="",
    ){
        //We are overwriting the defaultconstructor of error class of express
        super(message);
        this.statuscode= statuscode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        //if apierror stack trace
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError;