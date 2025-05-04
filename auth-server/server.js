const express = require('express');
const path = require('path');
const authRoutes = require('./routes');
const configRoutes = require('./routes/config');
const eurekaClient = require('./eureka-config');

const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(req.originalUrl);
    next();
});

app.get('/auth/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'documentation.html'));
});

app.use('/auth', authRoutes);
app.use('/config', configRoutes);

app.use((req, res) => res.redirect('/config'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
    // Register with Eureka
    eurekaClient.start((error) => {
        if (error) {
            console.error('Failed to register with Eureka:', error);
        } else {
            console.log('Successfully registered with Eureka');
        }
    });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    eurekaClient.stop();
    process.exit();
});
