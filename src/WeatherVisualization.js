import React, { useState, useEffect } from 'react';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import Papa from 'papaparse';

const WeatherVisualization = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [temperatureTrend, setTemperatureTrend] = useState([]);
  const [warm55Year, setWarm55Year] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    const fetchData = async () => {
        try {
          const response = await fetch('/data/weather.csv').then(res => res.text());
          
          Papa.parse(response, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
              processData(results.data);
              setLoading(false);
            },
            error: (error) => {
              console.error('Error parsing CSV:', error);
              setLoading(false);
            }
          });
        } catch (error) {
          console.error('Error reading file:', error);
          setLoading(false);
        }
      };

    fetchData();
  }, []);

  const kelvinToFahrenheit = (ktemp) => {
    return (ktemp - 273.15) * (9/5) + 32;
  };

  const kelvinToCelsius = (ktemp) => {
    return ktemp - 273.15;
  };

  const processData = (data) => {
    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
    const monthlyTemps = Array(12).fill(0).map(() => ({ sum: 0, count: 0 }));

    const yearlyTemps = {};
    
    const yearMonthTemps = {};

    data.forEach(row => {
      if (row.time && row.Ktemp) {
        const ftemp = kelvinToFahrenheit(row.Ktemp);
        
        const date = new Date(row.time);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = date.getMonth();
          
          monthlyTemps[month].sum += ftemp;
          monthlyTemps[month].count += 1;
          
          if (!yearlyTemps[year]) {
            yearlyTemps[year] = { sum: 0, count: 0 };
          }
          yearlyTemps[year].sum += ftemp;
          yearlyTemps[year].count += 1;
          
          const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
          if (!yearMonthTemps[yearMonth]) {
            yearMonthTemps[yearMonth] = { 
              sum: 0, 
              count: 0, 
              year, 
              month,
              date: new Date(year, month, 15) 
            };
          }
          yearMonthTemps[yearMonth].sum += ftemp;
          yearMonthTemps[yearMonth].count += 1;
        }
      }
    });

    const monthlyAvgTemps = months.map((month, i) => ({
      month,
      avgTemp: monthlyTemps[i].count > 0 ? monthlyTemps[i].sum / monthlyTemps[i].count : null,
      index: i 
    }));

    const yearlyAvgTemps = Object.keys(yearlyTemps)
      .map(year => ({
        year: parseInt(year),
        avgTemp: yearlyTemps[year].count > 0 ? yearlyTemps[year].sum / yearlyTemps[year].count : null
      }))
      .sort((a, b) => a.year - b.year);

    const yearMonthAvgTemps = Object.values(yearMonthTemps)
      .map(item => ({
        yearMonth: new Date(item.date),
        year: item.year,
        month: months[item.month],
        avgTemp: item.count > 0 ? item.sum / item.count : null
      }))
      .sort((a, b) => a.yearMonth - b.yearMonth);

    const warm55 = yearlyAvgTemps.find(item => item.avgTemp > 55);

    setMonthlyData(monthlyAvgTemps);
    setYearlyData(yearlyAvgTemps);
    setTemperatureTrend(yearMonthAvgTemps);
    setWarm55Year(warm55);
  };

  const MonthlyTemperatureChart = () => (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Monthly Average Temperatures (in Fahrenheit)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={monthlyData.sort((a, b) => a.index - b.index)}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month"
            label={{ value: 'Month', position: 'insideBottomRight', offset: -10 }}
            tick={{ angle: -45, textAnchor: 'end', dy: 10 }}
          />
          <YAxis 
            label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }} 
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip formatter={(value) => `${value.toFixed(2)}°F`} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="avgTemp" 
            name="Average Temperature" 
            stroke="#8884d8" 
            strokeWidth={2} 
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm text-gray-600">
        This visualization shows the average temperature in Fahrenheit for each month of the year at Cornell Tech from 1950 to 2021.
      </div>
    </div>
  );

  const YearlyTemperatureChart = () => (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Yearly Average Temperatures (in Fahrenheit)</h3>
      <div className="mb-4">
        <p className="text-md font-medium">
          First year with average temperature above 55°F: 
          <span className="ml-2 font-bold text-red-600">
            {warm55Year ? warm55Year.year : 'None found'}
          </span>
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={yearlyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }}
            tick={{ angle: -45, textAnchor: 'end', dy: 10 }}
          />
          <YAxis 
            label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }} 
            domain={[50, 58]}
          />
          <Tooltip formatter={(value) => `${value.toFixed(2)}°F`} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="avgTemp" 
            name="Average Temperature" 
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
          {/* Reference line at 55°F */}
          <svg>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </svg>
          <CartesianGrid strokeDasharray="3 3" />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey={() => 55}
            name="55°F Threshold"
            stroke="#FF0000"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm text-gray-600">
        This visualization shows the yearly average temperatures at Cornell Tech from 1950 to 2021. The red dashed line marks the 55°F threshold.
      </div>
    </div>
  );

  const TemperatureTrendChart = () => {
    const filteredData = temperatureTrend.filter((_, index) => index % 12 === 0);
    
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-2">Temperature Trends Over Time (1950-2021)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="yearMonth"
              tickFormatter={(date) => new Date(date).getFullYear()}
              label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis
              label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              labelFormatter={(label) => `${new Date(label).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}`}
              formatter={(value) => `${value?.toFixed(2)}°F`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="avgTemp"
              name="Average Temperature"
              stroke="#ff7300"
              fill="url(#colorGradient)"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 text-sm text-gray-600">
          This visualization shows the temperature trend over time, with data sampled annually to show the long-term trend.
          The data suggests a slight warming trend over the 70+ year period at Cornell Tech.
        </div>
      </div>
    );
  };

  const TemperatureConverter = () => {
    const [kelvin, setKelvin] = useState(273.15);
    const [celsius, setCelsius] = useState(0);
    const [fahrenheit, setFahrenheit] = useState(32);

    const handleKelvinChange = (e) => {
      const k = parseFloat(e.target.value);
      setKelvin(k);
      setCelsius(kelvinToCelsius(k));
      setFahrenheit(kelvinToFahrenheit(k));
    };

    return (
      <div className="p-4 bg-gray-100 rounded-lg mt-4">
        <h3 className="text-lg font-semibold mb-2">Temperature Converter</h3>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <label className="w-24">Kelvin:</label>
            <input
              type="number"
              value={kelvin}
              onChange={handleKelvinChange}
              className="border p-1 rounded w-24"
              step="0.1"
            />
            <span className="ml-2">K</span>
          </div>
          <div className="flex items-center">
            <label className="w-24">Celsius:</label>
            <input
              type="number"
              value={celsius.toFixed(2)}
              className="border p-1 rounded w-24 bg-gray-200"
              readOnly
            />
            <span className="ml-2">°C</span>
          </div>
          <div className="flex items-center">
            <label className="w-24">Fahrenheit:</label>
            <input
              type="number"
              value={fahrenheit.toFixed(2)}
              className="border p-1 rounded w-24 bg-gray-200"
              readOnly
            />
            <span className="ml-2">°F</span>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            The conversion formula from Kelvin to Fahrenheit is:
            <p className="font-mono mt-1">F = (K - 273.15) × (9/5) + 32</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cornell Tech Weather Data Visualization</h1>
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Created by Abhijay Rane (ar2536)</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Navigation Tabs */}
          <div className="flex border-b">
            <button
              className={`py-2 px-4 ${activeTab === 'monthly' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly Averages
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'yearly' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('yearly')}
            >
              Yearly Trends
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'trends' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('trends')}
            >
              Long-term Trends
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'converter' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('converter')}
            >
              Temperature Converter
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="py-4">
            {activeTab === 'monthly' && <MonthlyTemperatureChart />}
            {activeTab === 'yearly' && <YearlyTemperatureChart />}
            {activeTab === 'trends' && <TemperatureTrendChart />}
            {activeTab === 'converter' && <TemperatureConverter />}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherVisualization;