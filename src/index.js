import server from "./server";

const express = require("express");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//Strart  Server
const createServer = async() => {
    try {
        const app = express();
        await server.start();
        server.applyMiddleware({ app });

        app.get("/", (req, res) => {
            res.json({ result: "ok" });
        });

        app.listen({ port: 5555 }, () =>
            console.log(
                `server ready at https://localhost:5555/${server.graphqlPath}`
            )
        );
    } catch (error) {
        console.log(error);
    }
};

createServer();