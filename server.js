// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI, {
    autoIndex: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ===== Schemas =====
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' }
});

const lostFoundSchema = new mongoose.Schema({
    itemName: String,
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now }
});

const marketplaceSchema = new mongoose.Schema({
    itemName: String,
    price: Number,
    description: String,
    condition: String,
    timestamp: { type: Date, default: Date.now }
});

const rideSchema = new mongoose.Schema({
    departure: String,
    destination: String,
    time: String,
    timestamp: { type: Date, default: Date.now }
});

const exchangeSchema = new mongoose.Schema({
    title: String,
    type: String,
    description: String,
    timestamp: { type: Date, default: Date.now }
});

// ===== Models =====
const User = mongoose.model('User', userSchema);
const LostFound = mongoose.model('LostFound', lostFoundSchema);
const Marketplace = mongoose.model('Marketplace', marketplaceSchema);
const Ride = mongoose.model('Ride', rideSchema);
const Exchange = mongoose.model('Exchange', exchangeSchema);

// ===== Authentication =====
// Register
app.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required' });

        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ success: false, message: 'Username already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashed });
        await newUser.save();
        res.json({ success: true, message: 'User registered successfully!' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required' });

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ success: false, message: 'User not found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ success: false, message: 'Invalid password' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ success: true, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===== Auth Middleware =====
function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// ===== Mess Menu =====
app.get('/api/mess-menu', (req, res) => {
    res.json({
        breakfast: "Poha, Tea, Fruits",
        lunch: "Rice, Dal, Vegetables",
        snacks: "Samosa, Juice",
        dinner: "Chapati, Paneer, Salad"
    });
});

// ===== AI Mail Summarizer =====
app.post('/ai/summarize', (req, res) => {
    const { text } = req.body;
    const summary = text.length > 50 ? text.slice(0, 50) + "..." : text;
    res.json({
        category: "General",
        priority: "Low",
        summary
    });
});

// ===== Student Exchange APIs =====
app.post('/api/lostfound', authMiddleware, async (req, res) => {
    const item = new LostFound(req.body);
    await item.save();
    res.json({ success: true, item });
});
app.get('/api/lostfound', authMiddleware, async (req, res) => {
    const items = await LostFound.find();
    res.json(items);
});

app.post('/api/marketplace', authMiddleware, async (req, res) => {
    const item = new Marketplace(req.body);
    await item.save();
    res.json({ success: true, item });
});
app.get('/api/marketplace', authMiddleware, async (req, res) => {
    const items = await Marketplace.find();
    res.json(items);
});

app.post('/api/rides', authMiddleware, async (req, res) => {
    const ride = new Ride(req.body);
    await ride.save();
    res.json({ success: true, ride });
});
app.get('/api/rides', authMiddleware, async (req, res) => {
    const rides = await Ride.find();
    res.json(rides);
});

app.post('/api/exchange', authMiddleware, async (req, res) => {
    const ex = new Exchange(req.body);
    await ex.save();
    res.json({ success: true, ex });
});
app.get('/api/exchange', authMiddleware, async (req, res) => {
    const items = await Exchange.find();
    res.json(items);
});

// ===== Start Server =====
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
