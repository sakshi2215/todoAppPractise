//Express does not provide any classes for APIResponse

class APIResponse{
    constructor(statuscode, data, message="Sucess"){
        this.statuscode = statuscode;
        this.data = data;
        this.message = message;
        this.success = statuscode< 400;
    }
}

export default APIResponse;