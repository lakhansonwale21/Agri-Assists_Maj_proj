const Request = require('../models/Request');
const Product = require('../models/Product');

// Farmer creates a request
const createRequest = async (req, res) => {
    try {
        const { shopId, productId, quantity, message } = req.body;
        
        console.log("==> createRequest Hit!");
        console.log("req.body:", req.body);
        console.log("req.user.id:", req.user.id);

        const newRequest = new Request({
            farmerId: req.user.id,
            shopId,
            productId,
            quantity,
            message
        });

        await newRequest.save();
        res.status(201).json({ success: true, message: 'Request sent successfully', request: newRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error creating request' });
    }
};

// Get requests (Farmer sees their outgoing, Shopkeeper sees incoming)
const getRequests = async (req, res) => {
    try {
        let requests;
        if (req.user.role === 'farmer') {
            requests = await Request.find({ farmerId: req.user.id })
                .populate('shopId', 'shopName city')
                .populate('productId', 'productName price');
        } else if (req.user.role === 'shopkeeper') {
            requests = await Request.find({ shopId: req.user.id })
                .populate('farmerId', 'name phone city')
                .populate('productId', 'productName price');
        }
        res.json({ success: true, requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching requests' });
    }
};

// Shopkeeper updates request status
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, responseMessage } = req.body; // 'accepted' or 'rejected', plus optional text
        
        const updateData = { status };
        if (responseMessage !== undefined) {
            updateData.responseMessage = responseMessage;
        }

        const request = await Request.findOneAndUpdate(
            { _id: id, shopId: req.user.id },
            updateData,
            { new: true }
        );

        if (!request) return res.status(404).json({ success: false, message: 'Request not found or unauthorized' });

        res.json({ success: true, message: `Request ${status} successfully`, request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating request' });
    }
};

module.exports = { createRequest, getRequests, updateRequestStatus };
