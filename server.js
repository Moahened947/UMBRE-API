const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Importing database module
const db = require('./database');

app.use(express.json());

// Define your endpoints here
app.get('/risks', (req, res) => {
    db.query('SELECT * FROM prop_facultative', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while fetching data.', error: err });
        }
        res.json(results); // Return the array directly
    });
});

app.get('/risks/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM prop_facultative WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while fetching data.', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No record found with the specified ID.' });
        }
        res.json({ message: 'Data fetched successfully.', data: results[0] });
    });
});

// New endpoint to retrieve the sum of specified columns with modified casting
app.get('/sumcolumns', (req, res) => {
    db.query(
        'SELECT ' +
        'SUM(CAST(REPLACE(TSIAcceptanceUSD, ",", "") AS DECIMAL(10, 2))) AS TotalTSIAcceptanceUSD, ' +
        'SUM(CAST(REPLACE(PremiumAcceptanceUSD, ",", "") AS DECIMAL(10, 2))) AS TotalPremiumAcceptanceUSD, ' +
        'SUM(CAST(REPLACE(TSIAcceptanceLYD, ",", "") AS DECIMAL(10, 2))) AS TotalTSIAcceptanceLYD, ' +
        'SUM(CAST(REPLACE(PremiumAcceptanceLYD, ",", "") AS DECIMAL(10, 2))) AS TotalPremiumAcceptanceLYD, ' +
        'SUM(CAST(REPLACE(SpecialRetentionPREM, ",", "") AS DECIMAL(10, 2))) AS TotalSpecialRetentionPREM ' +
        'FROM prop_facultative',
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'An error occurred while fetching data.', error: err });
            }
            const data = [
                results[0].TotalTSIAcceptanceUSD,
                results[0].TotalPremiumAcceptanceUSD,
                results[0].TotalTSIAcceptanceLYD,
                results[0].TotalPremiumAcceptanceLYD,
                results[0].TotalSpecialRetentionPREM
            ];
            res.json({ message: 'Sum of specified columns fetched successfully.', data });
        }
    );
});




app.post('/risks', (req, res) => {
    const data = req.body;
    db.query('INSERT INTO prop_facultative SET ?', [data], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while inserting data.', error: err });
        }
        res.json({ message: 'Data inserted successfully.', data: { id: results.insertId, ...data } });
    });
});

app.put('/risks/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    db.query('UPDATE prop_facultative SET ? WHERE id = ?', [data, id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while updating data.', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No record found with the specified ID.' });
        }
        res.json({ message: 'Data updated successfully.', data: { id, ...data } });
    });
});

app.delete('/risks/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM prop_facultative WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while deleting data.', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No record found with the specified ID.' });
        }
        res.json({ message: 'Data deleted successfully.', data: { id } });
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
