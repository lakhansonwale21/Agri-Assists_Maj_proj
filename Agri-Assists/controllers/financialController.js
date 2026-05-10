const FinancialRecord = require('../models/FinancialRecord');

const addRecord = async (req, res) => {
    try {
        const { type, amount, cropOrProduct, category, description, date } = req.body;
        const record = new FinancialRecord({
            userId: req.user.id,
            type,
            amount,
            cropOrProduct,
            category,
            description,
            date: date || Date.now()
        });
        await record.save();
        res.status(201).json({ success: true, message: 'Record added successfully', record });
    } catch (error) {
        console.error('Add Record Error:', error);
        res.status(500).json({ success: false, message: 'Server Error adding record' });
    }
};

const getRecords = async (req, res) => {
    try {
        const records = await FinancialRecord.find({ userId: req.user.id }).sort({ date: -1 });
        res.json({ success: true, records });
    } catch (error) {
        console.error('Get Records Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching records' });
    }
};

const getSummary = async (req, res) => {
    try {
        const records = await FinancialRecord.find({ userId: req.user.id });
        let totalExpense = 0;
        let totalRevenue = 0;
        const byCrop = {};

        records.forEach(record => {
            if (record.type === 'expense') totalExpense += record.amount;
            else if (record.type === 'revenue') totalRevenue += record.amount;

            if (!byCrop[record.cropOrProduct]) {
                byCrop[record.cropOrProduct] = { expense: 0, revenue: 0 };
            }
            byCrop[record.cropOrProduct][record.type] += record.amount;
        });

        res.json({
            success: true,
            summary: {
                totalExpense,
                totalRevenue,
                profit: totalRevenue - totalExpense,
                byCrop
            }
        });
    } catch (error) {
        console.error('Get Summary Error:', error);
        res.status(500).json({ success: false, message: 'Server Error generating summary' });
    }
};

module.exports = { addRecord, getRecords, getSummary };
