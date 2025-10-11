const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// =============================
// MongoDB Connection
// =============================
mongoose.connect('mongodb://localhost:27017/bankDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// =============================
// Account Schema and Model
// =============================
const accountSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  balance: { type: Number, required: true, min: 0 },
});

const Account = mongoose.model('Account', accountSchema);

// =============================
// Endpoint: Create Account (for testing/demo)
// =============================
app.post('/create', async (req, res) => {
  try {
    const { name, balance } = req.body;
    const account = new Account({ name, balance });
    await account.save();
    res.status(201).json({ message: 'Account created successfully', account });
  } catch (error) {
    res.status(400).json({ message: 'Error creating account', error: error.message });
  }
});

// =============================
// Endpoint: View All Accounts
// =============================
app.get('/accounts', async (req, res) => {
  const accounts = await Account.find();
  res.status(200).json(accounts);
});

// =============================
// Endpoint: Money Transfer
// =============================
app.post('/transfer', async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer details' });
    }

    // Step 1: Find sender and receiver accounts
    const sender = await Account.findOne({ name: from });
    const receiver = await Account.findOne({ name: to });

    if (!sender) {
      return res.status(404).json({ message: `Sender account '${from}' not found` });
    }
    if (!receiver) {
      return res.status(404).json({ message: `Receiver account '${to}' not found` });
    }

    // Step 2: Check sufficient balance
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance for transfer' });
    }

    // Step 3: Perform updates sequentially (no transactions)
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.status(200).json({
      message: `Successfully transferred $${amount} from ${from} to ${to}`,
      sender: { name: sender.name, balance: sender.balance },
      receiver: { name: receiver.name, balance: receiver.balance },
    });
  } catch (error) {
    console.error('Transfer Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// =============================
// Start Server
// =============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
