import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, Droplet, TrendingUp } from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { getAnalyticsData } from '../services/firebase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  labels: string[];
  waterContainers: number[];
  distances: number[];
}

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    labels: [],
    waterContainers: [],
    distances: []
  });
  const [loading, setLoading] = useState(true);
  const [totalContainers, setTotalContainers] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'pie'>('line');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAnalyticsData(timeRange);
        setAnalyticsData(data);
        
        // Calculate totals
        const containerTotal = data.waterContainers.reduce((sum, val) => sum + val, 0);
        const distanceTotal = data.distances.reduce((sum, val) => sum + val, 0);
        
        setTotalContainers(containerTotal);
        setTotalDistance(distanceTotal);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Line chart data
  const lineChartData: ChartData<'line'> = {
    labels: analyticsData.labels,
    datasets: [
      {
        label: 'Water Containers',
        data: analyticsData.waterContainers,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Distance (km)',
        data: analyticsData.distances,
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.3,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  // Bar chart data
  const barChartData: ChartData<'bar'> = {
    labels: analyticsData.labels,
    datasets: [
      {
        label: 'Water Containers',
        data: analyticsData.waterContainers,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'Distance (km)',
        data: analyticsData.distances,
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
      },
    ],
  };

  // Pie chart data
  const pieChartData: ChartData<'pie'> = {
    labels: ['Water Containers', 'Distance (km)'],
    datasets: [
      {
        data: [totalContainers, totalDistance],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(14, 165, 233, 0.7)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(14, 165, 233)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Water Containers',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Distance (km)',
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: `Water Delivery Trends (${timeRange})`,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Water Delivery Comparison (${timeRange})`,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribution of Metrics',
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>

      {/* Time Range Selector */}
      <div className="flex flex-wrap mb-6 gap-2">
        <TimeRangeButton
          label="Day"
          value="day"
          current={timeRange}
          onClick={setTimeRange}
        />
        <TimeRangeButton
          label="Week"
          value="week"
          current={timeRange}
          onClick={setTimeRange}
        />
        <TimeRangeButton
          label="Month"
          value="month"
          current={timeRange}
          onClick={setTimeRange}
        />
        <TimeRangeButton
          label="Year"
          value="year"
          current={timeRange}
          onClick={setTimeRange}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SummaryCard
          title="Total Water Containers"
          value={totalContainers}
          icon={<Droplet size={24} className="text-primary-500" />}
          color="bg-primary-50"
        />
        <SummaryCard
          title="Total Distance"
          value={`${totalDistance.toFixed(1)} km`}
          icon={<TrendingUp size={24} className="text-secondary-500" />}
          color="bg-secondary-50"
        />
      </div>

      {/* Chart Type Selector */}
      <div className="flex flex-wrap mb-6 gap-2">
        <ChartTypeButton
          label="Line Chart"
          value="line"
          current={activeChart}
          icon={<svg width="20\" height="20\" viewBox="0 0 24 24\" fill="none\" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3V21H21\" stroke="currentColor\" strokeWidth="2\" strokeLinecap="round"/>
            <path d="M3 12L8.5 7L12.5 10L18 5\" stroke="currentColor\" strokeWidth="2\" strokeLinecap="round\" strokeLinejoin="round"/>
          </svg>}
          onClick={setActiveChart}
        />
        <ChartTypeButton
          label="Bar Chart"
          value="bar"
          current={activeChart}
          icon={<BarChart size={20} />}
          onClick={setActiveChart}
        />
        <ChartTypeButton
          label="Pie Chart"
          value="pie"
          current={activeChart}
          icon={<PieChart size={20} />}
          onClick={setActiveChart}
        />
      </div>

      {/* Chart Display */}
      <div className="w-full h-96 mt-4">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <BarChart size={48} className="text-primary-300 mb-2" />
              <p className="text-gray-500">Loading analytics data...</p>
            </div>
          </div>
        ) : analyticsData.labels.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <BarChart size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Data Available</h3>
            <p className="text-gray-500 text-center max-w-md">
              There is no data available for the selected time range. Try selecting a different range or add some water delivery records.
            </p>
          </div>
        ) : (
          <>
            {activeChart === 'line' && (
              <Line data={lineChartData} options={lineChartOptions} />
            )}
            {activeChart === 'bar' && (
              <Bar data={barChartData} options={barChartOptions} />
            )}
            {activeChart === 'pie' && (
              <div className="max-w-md mx-auto">
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface TimeRangeButtonProps {
  label: string;
  value: 'day' | 'week' | 'month' | 'year';
  current: string;
  onClick: (value: 'day' | 'week' | 'month' | 'year') => void;
}

const TimeRangeButton: React.FC<TimeRangeButtonProps> = ({
  label,
  value,
  current,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 rounded-md transition-colors ${
        current === value
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
};

interface ChartTypeButtonProps {
  label: string;
  value: 'line' | 'bar' | 'pie';
  current: string;
  icon: React.ReactNode;
  onClick: (value: 'line' | 'bar' | 'pie') => void;
}

const ChartTypeButton: React.FC<ChartTypeButtonProps> = ({
  label,
  value,
  current,
  icon,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
        current === value
          ? 'bg-primary-100 text-primary-700 border border-primary-300'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
};

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <div className={`rounded-lg shadow-sm p-4 ${color} border border-gray-200`}>
      <div className="flex items-center">
        <div className="mr-4">{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;