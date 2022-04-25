//ดึง User id มาจาก token

import jwt from "jsonwebtoken";

const getUser = (token) => {
    if (!token) return null;
    const parsedToken = token.split(" ")[1];
    try {
        const decodedToken = jwt.verify(parsedToken, "thisdatanotfuckingsecretdog");
        return decodedToken;
    } catch (error) {
        return null;
    }
};
export default getUser;