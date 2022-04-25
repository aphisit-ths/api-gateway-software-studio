import axios from "axios";
const URI = "http://localhost:9000/trips";
const CONTENT_URI = "http://localhost:5000/api/Contents";
const USER_URI = "https://localhost:5001/api/User";
const CONTENT_BY_ID = "https://localhost:5001/api/Contents/";

const Query = {
    getContentById: async(parent, args, context, info) => {
        const contentId = args.contentId;
        try {
            const res = await axios.get(CONTENT_BY_ID + contentId);
            return res.data;
        } catch (err) {
            let message =
                typeof err.response !== "undefined" ?
                err.response.data.message :
                err.message;
            console.warn("error", message);
        }
    },
    contents: async(parent, args, context, info) => {
        try {
            const res = await axios.get(CONTENT_URI);
            return res.data;
        } catch (err) {
            let message =
                typeof err.response !== "undefined" ?
                err.response.data.message :
                err.message;
            console.warn("error", message);
        }
    },

    users: async(parent, args, context, info) => {
        try {
            const res = await axios.get(USER_URI);
            return res.data;
        } catch (err) {
            let message =
                typeof err.response !== "undefined" ?
                err.response.data.message :
                err.message;
            throw new Error(err.message);
        }
    },
    getUserById: async(parent, args, context, info) => {
        const { userId } = args;
        try {
            const res = await axios.get(USER_URI + "/" + userId);
            if (!res.data) throw new Error("ไม่พบผู้ใช้นี้");
            return res.data;
        } catch (err) {
            let message =
                typeof err.response !== "undefined" ?
                err.response.data.message :
                err.message;
            console.warn("error", message);
            throw new Error(err.message);
        }
    },
};

export default Query;