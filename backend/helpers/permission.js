import { User } from "../models/user.js";

export const uploadProductPermission = async(userId) => {
    const user = await User.findById(userId)

    if(user.role === 'admin'){
        return true
    }

    return false
}