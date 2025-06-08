class Response {
    constructor(message, status_code, data = null) {
        this.message = message,
            this.status_code = status_code,
            this.data = data
    }
}

class SuccessRes extends Response {
    constructor(message = "", data = null) {
        super(message, 200, data) //ส่งค่าไป class แม่ เเล้วเรียก constructor ของคลาสแม่
    }
}

class ErrorRes extends Response {
    constructor(message, status_code, data = null) {
        super(message, status_code, data) //ส่งค่าไป class แม่ เเล้วเรียก constructor ของคลาสแม่
    }
}

class ErrorCatchRes extends Response {
    constructor(error, status_code = 500) {
        super("Catch ERROR : " + error.message || "Server internal error.", status_code)
    }
}

module.exports = { Response, SuccessRes, ErrorRes, ErrorCatchRes }