const CONTENT_URI = "http://localhost:5000/api/Contents";
const REGISTER_USER = "https://localhost:5001/api/User/Register";
const EDIT_USER = "https://localhost:5001/api/User/Edit_user";
const CREATE_CONTENT = "https://localhost:5001/api/Contents/CreateContent";
const CREATE_COMMENT = "https://localhost:5001/api/Contents/Comment";
const DELETE_COMMENT = "https://localhost:5001/api/Contents/DeleteComment";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uniqueNamesGenerator, names } = require("unique-names-generator");
import axios from "axios";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const Mutation = {
    deleteComment: async(parent, args, context, info) => {
        const { contentId, commentId } = args;
        const deletedata = { contentId: contentId, commentId: commentId };
        const JsonString = JSON.stringify(deletedata);
        console.log(JsonString);
        try {
            const res = await axios.delete(DELETE_COMMENT, {
                headers: {
                    "Content-Type": "application/json",
                },
                data: deletedata,
            });
            console.log(res);
            if (res.data === "deleteComment Fail") {
                throw new Error("ไม่สามารถลบความคิดเห็นได้  !");
            }
            if (res.data === "deleteComment Success") {
                return "ลบข้อมูลเรียบร้อย";
            }
        } catch (err) {
            console.warn("error", err);
            throw new Error("ไม่สามารถลบความคิดเห็นได้  !");
        }
    },
    addComment: async(parent, args, { contextUser }, info) => {
        const contentId = args.contentId;
        const description = args.description.trim().toLowerCase();
        if (!contextUser) {
            throw new Error("กรุณาเข้าสู่ระบบ หรือลงทะเบียนก่อนทำรายการ ");
        }
        const {
            userId,
            userName,
            password,
            name,
            lastName,
            email,
            status,
        } = contextUser;
        const userdata = {
            userId,
            userName,
            password,
            name,
            lastName,
            email,
            status,
        };
        const commentInfo = {
            contentId: contentId,
            comment: {
                user: {...userdata },
                description: description,
            },
        };
        try {
            const res = await axios.post(CREATE_COMMENT, commentInfo);
            if (res.data === "comment Fail") {
                throw new Error("ไม่สามารถแสดงความคิดเห็นได้ ! comment fail");
            }
            if (res.data === "comment Success") {
                return "Comment Success";
            }
        } catch (err) {
            console.warn("error", err);
            throw new Error("ไม่สามารถแสดงความคิดเห็นได้ !");
        }
    },
    create_content: async(parent, args, context, info) => {
        const title = args.title.trim().toLowerCase();
        const description = args.description.trim().toLowerCase();
        const location = args.location.trim().toLowerCase();
        const imageURL = args.imageURL.trim();
        const tags = args.tag.map((tag) => tag.trim().toLowerCase());
        const content_info = {
            title: title,
            description: description,
            location: location,
            imageURL: imageURL,
            tag: tags,
            CommentList: [],
            LikeList: [],
            contentStatus: "Active",
        };
        try {
            const res = await axios.post(CREATE_CONTENT, content_info);
            if (res.data === "Success") {
                return content_info;
            }
        } catch (err) {
            let message =
                typeof err.response !== "undefined" ?
                err.response.data.message :
                err.message;
            console.warn("error", message);
        }
    },
    login: async(parent, args, context, info) => {
        const userName = args.userName.trim().toLowerCase();
        const plainPassword = args.password.trim().toLowerCase();
        const userData = await axios.get(
            "https://localhost:5001/api/User/GetByUserName?UserName=" + userName
        );

        if (!userData.data) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง !");
        if (userData.data.status != "Active")
            throw new Error("บัญชีผู้ใช้ของคุณโดนระงับ !");
        const validPassword = await bcrypt.compare(
            plainPassword,
            userData.data.password
        );

        if (!validPassword) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง !");

        const userInfo = userData.data;
        const token = jwt.sign(userInfo, "thisdatanotfuckingsecretdog", {
            expiresIn: "7days",
        });
        return { user: userInfo, isAdmin: false, token: token };
    },
    register_user: async(parent, args, context, info) => {
        const randomName = uniqueNamesGenerator({
            dictionaries: [names],
        });
        const randomLName = uniqueNamesGenerator({
            dictionaries: [names],
        });
        const { userName, password, email } = args;
        const _userName = userName.toLowerCase().trim();
        const _password = password.toLowerCase().trim();
        const _name = randomName.toLowerCase().trim();
        const _lastName = randomLName.toLowerCase().trim();
        const _email = email.toLowerCase().trim();
        const hash_password = await bcrypt.hash(_password, 10);
        const emailIsAlready = await axios.get(
            "https://localhost:5001/api/User/GetbyEmail?Email=" + _email
        );
        if (emailIsAlready.data) throw new Error("อีเมลนี้มีอยู่ในระบบแล้ว");

        const register_info = {
            userName: _userName,
            password: hash_password,
            name: _name,
            lastName: _lastName,
            email: _email,
        };
        try {
            const res = await axios.post(REGISTER_USER, register_info);
            if (
                res.data.trim().toLowerCase() === "user name redunddant :register fail"
            ) {
                throw new Error("ไม่สามารถใช้ username นี้ได้");
            }
            if (!res.data) throw new Error("ลงทะเบียนไม่สำเร็จ โปรดลองไหม่อีกครั้ง");

            if (res.data === "Success") {
                const userInfo = await axios.get(
                    "https://localhost:5001/api/User/GetbyEmail?Email=" +
                    register_info.email
                );
                return userInfo.data;
            }
        } catch (err) {
            let message =
                typeof err.response !== "undefined" ?
                err.response.data.message :
                err.message;
            console.warn("error", message);
            throw new Error(err.message);
        }
    },
    edit_user: async(parent, args, context, info) => {
        const { userId, userName, password, name, lastName, email } = args;

        //get user for currently info
        const user = await axios.get("https://localhost:5001/api/User/" + userId);
        if (!user.data) throw new Error("ไม่พบผู้ใช้นี้");

        const updatedInfo = {
            //ใช้ Ternary check ว่ามี input เข้ามาไหม ถ้าไม่มีให้ใช้ ข้อมูลเดิมที่ get มาได้
            userId: !!userId ? userId : user.data.userId,
            userName: !!userName ? userName : user.data.userName,
            password: !!password ? password : user.data.password,
            name: !!name ? name : user.data.name,
            lastName: !!lastName ? lastName : user.data.lastName,
            email: !!email ? email : user.data.email,
        };
        try {
            const res = await axios.put(EDIT_USER, updatedInfo);
            if (res.data === "Success") {
                return updatedInfo;
            }
        } catch (err) {
            let message =
                typeof err.response !== "undefined" ?
                err.response.data.message :
                err.message;
            console.warn("error", message);
            throw new Error("ไม่สามารถแก้ไขได้ในขณะนี้");
        }

        return updatedInfo;
    },
};

export default Mutation;