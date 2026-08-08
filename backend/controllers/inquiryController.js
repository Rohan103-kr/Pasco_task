const fs = require('fs');
const path = require('path');
const Inquiry = require('../models/Inquiry');
const { getDbMode } = require('../config/db');

// Path to store local inquiries
const localInquiriesPath = path.join(__dirname, '..', 'data', 'inquiries.json');

// Helper to save inquiry locally
const saveInquiryLocally = (inquiryData) => {
  try {
    let inquiries = [];
    if (fs.existsSync(localInquiriesPath)) {
      const fileData = fs.readFileSync(localInquiriesPath, 'utf8');
      inquiries = JSON.parse(fileData || '[]');
    }
    
    const newInquiry = {
      id: `inq_${Date.now()}`,
      ...inquiryData,
      createdAt: new Date().toISOString()
    };
    
    inquiries.push(newInquiry);
    fs.writeFileSync(localInquiriesPath, JSON.stringify(inquiries, null, 2));
    return newInquiry;
  } catch (error) {
    console.error(`Error saving inquiry locally: ${error.message}`);
    return null;
  }
};

// POST /api/inquiries
const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Simple validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please enter all required fields: name, email, subject, message' });
    }

    const dbMode = getDbMode();

    if (dbMode === 'mongodb') {
      const newInquiry = await Inquiry.create({
        name,
        email,
        phone,
        subject,
        message
      });
      
      console.log('\x1b[36m%s\x1b[0m', `📬 [MongoDB Inquiry Received] From: ${name} <${email}>. Subject: ${subject}`);
      return res.status(201).json({ 
        success: true, 
        message: 'Inquiry saved successfully in MongoDB!', 
        data: newInquiry 
      });
    } else {
      const newInquiry = saveInquiryLocally({
        name,
        email,
        phone,
        subject,
        message
      });

      console.log('\x1b[36m%s\x1b[0m', `📬 [Local JSON Inquiry Saved] From: ${name} <${email}>. Subject: ${subject}`);
      return res.status(201).json({ 
        success: true, 
        message: 'Inquiry saved successfully in local JSON store!', 
        data: newInquiry 
      });
    }
  } catch (error) {
    console.error(`Error in createInquiry: ${error.message}`);
    return res.status(500).json({ error: 'Server error processing inquiry' });
  }
};

module.exports = {
  createInquiry
};
