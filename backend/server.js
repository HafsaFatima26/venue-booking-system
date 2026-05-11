const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', require('./routes/venues.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'VenueSpot API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
