/**
 * Authentication Models
 */

// Login Request Model
export class LoginRequest {
    constructor(identifier, password) {
        this.identifier = identifier;
        this.password = password;
    }

    toJSON() {
        return {
            identifier: this.identifier,
            password: this.password,
        };
    }
}

// Login Response Model
export class LoginResponse {
    constructor(data) {
        this.signature = data.signature;
        this.token = data.token;
    }

    static fromJSON(json) {
        return new LoginResponse(json);
    }
}

// Signup Request Model
export class SignupRequest {
    constructor(fullName, username, email, password, dob, phone) {
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.dob = dob;
        this.phone = phone;
    }

    toJSON() {
        return {
            fullName: this.fullName,
            username: this.username,
            email: this.email,
            password: this.password,
            dob: this.dob,
            phone: this.phone,
        };
    }
}

// Signup Response Model
export class SignupResponse {
    constructor(data) {
        this.msg = data.msg;
    }

    static fromJSON(json) {
        return new SignupResponse(json);
    }
}

// User Model (decoded from token or stored separately)
export class User {
    constructor(data) {
        this._id = data._id;
        this.username = data.username;
        this.email = data.email;
        this.role = data.role;
        this.fullname = data.fullname;
        this.profileImageUrl = data.profileImageUrl;
        this.bio = data.bio;
        this.followers = data.followers;
        this.following = data.following;
    }

    static fromJSON(json) {
        return new User(json);
    }
}
