const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Store = require("../models/store.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config.js");
const {
    checkSuperAdmin,
    checkOwner,
    checkManager,
} = require("../middlewares/authMiddleware.js");
const GroupeOption = require("../models/optionGroupe.js");
const multer = require("multer");
const path = require("path");
const Option = require("../models/productOption.js");
const Product = require("../models/product.js");
const Category = require("../models/category.js");
const mongoose = require("mongoose");
const Tax = require("../models/tax.js");
const fs = require("fs");
const fsPromises = require("fs/promises");
const ConsumationMode = require("../models/mode");
const Order = require("../models/order.js");
const order = require("../models/order.js");
const store = require("../models/store.js");
const Menu = require("../models/menu.js");
const schedule = require("node-schedule");
const { sendOrderStatusEmail } = require('../emailService.js');



let clients = [];
// Utility function to send SSE to a specific client
function sendSseToClient(clientId, message, idFront, order, isClient) {
    const client = clients.find((c) => c.clientId === clientId);
    console.log(isClient);
    if(isClient.toString()==="true"){
        sendOrderStatusEmail(order);
    }

    if (client) {
        for (let i = 0; i < clients.length; i++) {
            if (clients[i].clientId === clientId && idFront !== clients[i].idFront) {
                clients[i].res.write(`data: ${message}\n\n`);
                console.log(clients[i].clientId);
            
            }
        }
    }
}

// Server-Sent Events endpoint
router.get("/sse/:clientId/:idFront", (req, res) => {
    const clientId = req.params.clientId;
    const idFront = req.params.idFront;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // Save the client response object for future notifications
    console.log("clients : ", clients.length);
    const client = clients.find(
        (c) => c.clientId === clientId && idFront === c.idFront
    );
    if (client) {
        client.res = res;
    } else {
        clients.push({ clientId, res, idFront });
        res.write(`data: Welcome \n\n`);
        console.log(clients.length);
    }

    req.on("close", () => {
        console.log("SSE connection closed");
        const index = clients.findIndex(
            (c) => c.clientId === clientId && c.idFront === idFront
        );

        if (index !== -1) {
            clients.splice(index, 1);
            console.log(`Removed client: ${clientId}, ${idFront}`);
        }
    });
});

router.post("/orders", async (req, res) => {
    console.log(req.body);
    try {
        const items = req.body;
        const newOrder = await new order(items);
        const validationError = newOrder.validateSync();
        if (validationError) {
            return res.status(400).json({ error: validationError.message });
        }
        const data = await newOrder.save();
        console.log("---------------data------------");
        console.log(data);
        console.log("---------------data------------");
        if (data) {
            sendSseToClient(
                data.storeId.toString(), "New order received", null, data, true
            );
        }
        const newDate = new Date(data.createdAt.getTime() + 180 * 1000);
        const formattedDate = newDate
            .toISOString()
            .replace(/\.(\d{3})Z$/, ".$1+00:00");
        const finalDate = new Date(formattedDate);

        const job = schedule.scheduleJob(finalDate, function () {
            const lastData = async () => {
                const lastOrder = await order.findOne({ _id: data._id });
                if (lastOrder.status === "pending") {
                    const isMissed = await order.findOneAndUpdate(
                        { _id: data._id },
                        { status: "missed", updatedAt: Date.now() },
                        { new: true }
                    );
                    if (isMissed) {
                        sendSseToClient(
                            isMissed.storeId.toString(),
                            `Your order is ${isMissed.status}`,
                            null,
                            isMissed,
                            false
                        );
                        sendSseToClient(
                            isMissed.userId.toString(),
                            `Your order is ${isMissed.status}`,
                            null,
                            isMissed,
                            true
                        );
                    }
                }
            };
            lastData();
        });
        res.status(201).json(newOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// update status of order by id (from restaurant's owner)
router.put("/order/updatestatus/:idFront", checkManager, async (req, res) => {
    try {
        const { status, _id, preparationTime } = req.body;
        if (status && _id) {
            let data = preparationTime
                ? {
                    status,
                    updatedAt: Date.now(),
                    preparedAt: new Date(Date.now() + preparationTime * 60000),
                }
                : { status, updatedAt: Date.now() };
            const updateStatus = await order.findOneAndUpdate({ _id: _id }, data, {
                new: true,
            });
            if (!updateStatus) {
                return res.status(404).json({
                    message: "Order not found.",
                });
            }
            sendSseToClient(
                updateStatus.userId.toString(),
                `Your order is ${status}`,
                null,
                updateStatus,
                true
            );

            sendSseToClient(
                updateStatus.storeId.toString(),
                `${JSON.stringify(updateStatus)}`,
                req.params.idFront,
                updateStatus,
                false
            );
            return res.status(200).json({
                message: "Status does update successfully.",
                order: updateStatus,
            });
        }
        return res.status(400).json({
            message: "No data found. Failed to update order's status.",
        });
    } catch (err) {
        return res.status(500).json({
            message: err?.message,
        });
    }
});

module.exports = router;
