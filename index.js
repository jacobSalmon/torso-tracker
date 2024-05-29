import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import nodemailer from 'nodemailer';

const app = express();
const port = 3000;

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_PASS;


// URL of the product page
const url = 'https://torsoelectronics.com/products/t-1-algorithmic-sequencer';


app.get('/', (req, res) => {
    res.send('Hello Express!');
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
    

// Function to check product availability
async function checkAvailability() {
    try {
        // Fetch the webpage
        const { data } = await axios.get(url);
        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Extract JSON-LD script tag content
        const jsonLdScript = $('script[type="application/ld+json"]').html();
        if (jsonLdScript) {
            const jsonLdData = JSON.parse(jsonLdScript);

            // Check the availability property
            const availability = jsonLdData.offers[0].availability;

            if (availability === 'https://schema.org/InStock') {
                sendEmail('Product Available', 'The product is available.');
            } else {
                sendEmail('Product Out of Stock', 'The product is out of stock.');
            }
        } else {
            console.log('JSON-LD script not found on the page.');
        }
    } catch (error) {
        console.error('Error fetching the product page:', error);
    }
}

// Function to send email
async function sendEmail(subject, text) {
    try {
        // Create a transporter object using SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser, // Your Gmail email address
                pass: gmailPass // Your Gmail app-specific password
            }
        });

        // Define email options
        const mailOptions = {
            from: 'jacob.salmon9999@gmail.com', // Sender email address
            to: 'jacob.salmon@icloud.com', // Recipient email address
            subject: subject, // Subject of the email
            text: text // Email body text
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Check product availability every hour (3600000 milliseconds)
setInterval(checkAvailability, 3600000);

// Optionally, check availability immediately when the script starts
checkAvailability();



