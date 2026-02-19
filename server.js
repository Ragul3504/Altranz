const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check if credentials are valid (not default placeholders)
const isSupabaseConfigured = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase_url');

let supabase = null;
if (isSupabaseConfigured) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (e) {
        console.warn('Failed to initialize Supabase client:', e.message);
    }
} else {
    console.log('Supabase credentials missing or default. Running in MOCK MODE.');
}

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You might need to adjust this based on the provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes

// GET /api/events - Returns list of events
app.get('/api/events', (req, res) => {
    // Mock data for events. In a real app, this could come from the DB.
    const events = [
        { id: 1, name: 'Hackathon', type: 'Technical', fee: 150 },
        { id: 2, name: 'Coding Contest', type: 'Technical', fee: 100 },
        { id: 3, name: 'Paper Presentation', type: 'Technical', fee: 120 },
        { id: 4, name: 'Treasure Hunt', type: 'Non-Technical', fee: 80 },
        { id: 5, name: 'Photography', type: 'Non-Technical', fee: 80 },
        { id: 6, name: 'Gaming (FIFA)', type: 'Non-Technical', fee: 100 },
        { id: 7, name: 'Web Dev Workshop', type: 'Workshop', fee: 250 },
        { id: 8, name: 'AI/ML Workshop', type: 'Workshop', fee: 300 }
    ];
    res.json(events);
});

// POST /api/register - Handles registration
app.post('/api/register', async (req, res) => {
    const { fullName, email, phone, college, department, year, selectedEvents, totalFee } = req.body;

    // 1. Validation (Basic)
    if (!fullName || !email || !phone || !selectedEvents || selectedEvents.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for mock mode (if credentials are default/missing)
    const isMockMode = !supabase;

    if (isMockMode) {
        console.log('MOCK MODE: Skipping Supabase/Email. Data received:', req.body);
        return res.status(201).json({
            message: 'Registration successful (MOCK)',
            data: [{ id: 'mock-id', ...req.body }]
        });
    }

    try {
        // 2. Insert into Supabase
        const { data, error } = await supabase
            .from('registrations')
            .insert([
                {
                    full_name: fullName,
                    email: email,
                    phone: phone,
                    college: college,
                    department: department,
                    year: year,
                    events: selectedEvents,
                    total_fee: totalFee
                    // payment_status defaults to 'pending'
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        // 3. Send Email Confirmation
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Altranz Registration Confirmation',
            text: `Hello ${fullName},\n\nThank you for registering for Altranz events!\n\nRegistered Events: ${selectedEvents.map(e => e.name).join(', ')}\nTotal Fee: ₹${totalFee}\n\nPlease proceed to payment at the venue or verify your payment status.\n\nBest Regards,\nAltranz Team`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                // We don't fail the request if email fails, but log it.
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).json({ message: 'Registration successful', data: data });

    } catch (err) {
        console.error('Error registering:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Export app for Vercel
module.exports = app;

// Start Server if running directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
