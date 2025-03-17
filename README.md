# Cornell Weather Data Visualization

An interactive dashboard visualizing temperature data collected near Cornell Tech from 1950 to 2021.

**Live Demo:** [https://abjr265.github.io/weather-visualization_CS-INFO-5304-Assignment-2/](https://abjr265.github.io/weather-visualization_CS-INFO-5304-Assignment-2/)

## Project Overview

This project was developed as part of CS/INFO 5304 Assignment 2. It processes and visualizes historical weather data to analyze temperature patterns over different time scales.

## Features

### Monthly Average Temperatures
- Line plot showing average temperature (in Fahrenheit) for each month
- Interactive tooltips displaying exact temperature values
- Clear visual representation of seasonal patterns

### Yearly Temperature Trends
- Time series visualization of yearly average temperatures (1950-2021)
- Horizontal reference line at 55°F
- Identification of 1953 as the first year exceeding 55°F
- Visual analysis of warming patterns over decades

### Long-term Temperature Trends
- Area chart visualizing temperature changes over the entire period
- Interactive tooltips showing specific temperature values by year
- Visualization of gradual warming trend over 70+ years

### Temperature Converter
- Interactive tool demonstrating Kelvin to Fahrenheit/Celsius conversion
- Real-time conversion as values are entered
- Display of the conversion formula: F = (K - 273.15) × (9/5) + 32

## Technical Implementation

### Built With
- React.js for component architecture and state management
- Recharts for interactive data visualization
- PapaParse for CSV data processing
- React Hooks (useState, useEffect) for state and lifecycle management

### Key Components
- Main `WeatherVisualization` component coordinating data and UI
- Specialized chart components for each visualization type
- Data processing pipeline for temperature conversions and aggregations
- Tab-based navigation for intuitive user experience

## Running Locally

1. Clone the repository
   ```
   git clone https://github.com/abjr265/weather-visualization_CS-INFO-5304-Assignment-2.git
   cd weather-visualization_CS-INFO-5304-Assignment-2
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run the development server
   ```
   npm start
   ```

4. Open http://localhost:3000 in your browser

## Deployment

The project is configured for GitHub Pages deployment:

```
npm run deploy
```

## Data Source

The visualization uses weather data collected near Cornell Tech from 1950 to 2021, with temperature values originally provided in Kelvin and converted to Fahrenheit for analysis.

## Creator

Developed by Abhijay Rane (ar2536@cornell.edu) for CS/INFO 5304 Assignment 2.

## License

This project is part of academic coursework and is not licensed for commercial use.
