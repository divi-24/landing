/**
 * User Models
 */

import { API_CONFIG } from "../config/apiConfig";

// User Profile Model
export class UserProfile {
    constructor(data) {
        this._id = data._id;
        this.fullName = data.fullName;
        this.username = data.username;
        this.email = data.email;
        this.dob = data.dob;
        this.bio = data.bio;
        this.phone = data.phone;
        this.location = data.location;
        this.link = data.link;
        this.pronoun = data.pronoun;
        this.followers = data.followers;
        this.following = data.following;
        this.profileImageUrl = data.profileImageUrl;
        this.role = data.role;
        this.plan = data.plan || 'free';
        this.features = data.features || {};
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.usernameLastUpdated = data.usernameLastUpdated;
        this.emailVerified = data.emailVerified;
        this.gender = data.gender;
        this.interests = data.interests || [];
    }

    static fromJSON(json) {
        // Handle potential ID match with _id just in case
        const data = json.user || json.data || json;
        return new UserProfile(data);
    }
}
