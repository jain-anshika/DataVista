const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const csvParser = require('csv-parser');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Received file upload request');
    
    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname);
    const results = [];
    
    try {
        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log('File processing completed');
                try {
                    // Clean up the uploaded file
                    fs.unlinkSync(req.file.path);
                    
                    if (results.length === 0) {
                        console.error('No data found in file');
                        return res.status(400).json({ error: 'No data found in file' });
                    }

                    // Generate insights
                    const insights = {
                        num_rows: results.length,
                        num_columns: Object.keys(results[0] || {}).length,
                        columns: Object.keys(results[0] || {}),
                        missing_values: {},
                        data_types: {}
                    };
                    
                    // Calculate missing values and data types
                    if (results.length > 0) {
                        const columns = Object.keys(results[0]);
                        columns.forEach(column => {
                            const missingCount = results.filter(row => !row[column] || row[column] === '').length;
                            insights.missing_values[column] = missingCount;
                            
                            const sampleValue = results.find(row => row[column] && row[column] !== '');
                            if (sampleValue) {
                                if (!isNaN(sampleValue[column])) {
                                    insights.data_types[column] = 'number';
                                } else {
                                    insights.data_types[column] = 'string';
                                }
                            } else {
                                insights.data_types[column] = 'unknown';
                            }
                        });
                    }
                    
                    // Generate sample data (first 5 rows)
                    const sample_data = results.slice(0, 5);
                    
                    // Generate mock visualizations
                    const visualizations = {
                        distribution: {
                            labels: ['Category A', 'Category B', 'Category C'],
                            data: [30, 50, 20]
                        },
                        trends: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                            data: [65, 59, 80, 81, 56]
                        }
                    };
                    
                    // Generate mock predictions
                    const predictions = {
                        segment_distribution: {
                            "Majority": 60,
                            "Average": 30,
                            "Minority": 10
                        },
                        pca_data: {
                            x: [1, 2, 3, 4, 5],
                            y: [2, 4, 6, 8, 10],
                            segment: ["Majority", "Average", "Minority", "Majority", "Average"],
                            explained_variance: [0.7, 0.3]
                        }
                    };
                    
                    console.log('Sending response with insights and visualizations');
                    res.json({
                        message: 'File processed successfully',
                        insights: insights,
                        visualizations: visualizations,
                        predictions: predictions,
                        sample_data: sample_data
                    });
                } catch (error) {
                    console.error('Error processing results:', error);
                    res.status(500).json({ error: 'Error processing file results' });
                }
            })
            .on('error', (error) => {
                console.error('Error reading file:', error);
                // Clean up the uploaded file in case of error
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
                res.status(500).json({ error: 'Error reading file' });
            });
    } catch (error) {
        console.error('Error in file processing:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
    } else {
        console.error('Server error:', error);
    }
});
