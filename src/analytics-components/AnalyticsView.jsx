import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
// import Datepicker from "react-tailwindcss-datepicker";
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import DateTimeRangePicker from '../components/DateTimeRangePicker';

Chart.register(...registerables);

const ClickDataView = () => {
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    // const [dateRange, setDateRange] = useState({
    //     endDate: moment().toDate(),
    // });
    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf('day').toDate(),
        endDate: moment().toDate(),
    });

    const [chartData, setChartData] = useState([]);
    const [chartLabels, setChartLabels] = useState([]);
    const [uniqueIPsOnly, setUniqueIPsOnly] = useState(false); // State for unique IP filter
    const [selectedActions, setSelectedActions] = useState([]); // State for selected actions
    const [dropdownOpen, setDropdownOpen] = useState(false); // State to control dropdown visibility
    const [totalClicks, setTotalClicks] = useState(0); // State for total clicks count
    const [activeTab, setActiveTab] = useState('table'); // State for active tab ('chart' or 'table')

    const handleDateChange = (range) => {
        setDateRange(range);
    };


    // const fetchData = useCallback(async () => {
    //     setLoading(true);
    //     try {
    //         const response = await axios.post('https://masterprime.site/analytics/getclicks', {
    //             startDate: moment(dateRange.startDate).startOf('day').toDate(),
    //             endDate: moment(dateRange.endDate).endOf('day').toDate(),
    //         });
    //         setClicks(response.data);
    //         updateChartData(response.data, uniqueIPsOnly, selectedActions);
    //         setLoading(false);
    //     } catch (err) {
    //         setLoading(false);
    //     }
    // }, [dateRange, uniqueIPsOnly, selectedActions]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.post('https://masterprime.site/analytics/getclicks', {
                startDate: moment(dateRange.startDate).toDate(),
                endDate: moment(dateRange.endDate).toDate(),
            });
    
            const fetchedClicks = response.data;
            setClicks(fetchedClicks);
    
            // Apply the same filtering logic to the data used for the chart
            const filteredDataForChart = fetchedClicks.filter(click =>
                selectedActions.length === 0 || selectedActions.includes(click.action)
            );
    
            updateChartData(filteredDataForChart, uniqueIPsOnly);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    }, [dateRange, uniqueIPsOnly, selectedActions]);
    

    useEffect(() => {
        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 300000); // Fetch data every 5 minutes

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [fetchData]);

    const updateChartData = (data, uniqueOnly, actionsFilter) => {
        let groupedData = {};

        // const filteredData = actionsFilter.length > 0
        //     ? data.filter(click => actionsFilter.includes(click.action))
        //     : data;

        data.forEach(click => {
            const timeSlot = moment(click.createdAt).startOf('minute').format('HH:mm');
            if (!groupedData[timeSlot]) {
                groupedData[timeSlot] = new Set();
            }
            if (uniqueOnly) {
                groupedData[timeSlot].add(click.ip_address);
            } else {
                groupedData[timeSlot].add(JSON.stringify(click));
            }
        });

        const labels = Object.keys(groupedData);
        const values = labels.map(label => groupedData[label].size);

        setChartLabels(labels);
        setChartData(values);
        setTotalClicks(data.length);
    };

    const handleUniqueIPToggle = () => {
        setUniqueIPsOnly(!uniqueIPsOnly);
    };

    const handleActionChange = (action) => {
        setSelectedActions(prevActions =>
            prevActions.includes(action)
                ? prevActions.filter(a => a !== action)
                : [...prevActions, action]
        );
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // const filteredClicks = clicks.filter(click =>
    //     click.ip_address.includes(search) ||
    //     click.city.toLowerCase().includes(search) ||
    //     click.state.toLowerCase().includes(search) ||
    //     click.country.toLowerCase().includes(search) ||
    //     click.action.toLowerCase().includes(search)
    // );
    const filteredClicks = clicks.filter(click => {
        // Apply action filter if any actions are selected
        const actionFilter = selectedActions.length === 0 || selectedActions.includes(click.action);
    
        // Apply search filter for IP, city, state, country, or action
        const searchFilter = 
            click.ip_address.includes(search) ||
            click.city.toLowerCase().includes(search) ||
            click.state.toLowerCase().includes(search) ||
            click.country.toLowerCase().includes(search) ||
            click.action.toLowerCase().includes(search);
    
        return actionFilter && searchFilter;
    });

    const sortedClicks = [...filteredClicks].sort((a, b) => {
        if (sortConfig.key) {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClicks = sortedClicks.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(filteredClicks.length / itemsPerPage);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const maxPageButtons = 5;
    const halfPageButtons = Math.floor(maxPageButtons / 2);
    const startPage = Math.max(currentPage - halfPageButtons, 1);
    const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

    const visiblePageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        visiblePageNumbers.push(i);
    }

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirection = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? '▲' : '▼';
        }
        return '';
    };

    const refreshPage = () => {
        fetchData();
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const chartConfig = {
        labels: chartLabels,
        datasets: [
            {
                label: uniqueIPsOnly ? 'Unique IP Clicks Over Time' : 'Total Clicks Over Time',
                data: chartData,
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const uniqueActions = [...new Set(clicks.map(click => click.action))];

    return (
        <div className="container mx-auto p-4">
            {/* Tab Buttons */}

            <div className="flex justify-between mb-4">
                <div className="mb-4 pull-right">
                    <button
                        className={`px-4 py-2 mr-2 ${activeTab === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'} rounded`}
                        onClick={() => setActiveTab('table')}
                    >
                        Table View
                    </button>
                    <button
                        className={`px-4 py-2 mr-2 ${activeTab === 'chart' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'} rounded`}
                        onClick={() => setActiveTab('chart')}
                    >
                        Chart View
                    </button>
                </div>
                <div>
                    <h3 className="text-1xl font-bold">Total Clicks: {totalClicks} | Total Unique: {totalClicks}</h3>
                </div>
            </div>


            {/* Filters */}
            <div className="flex justify-between mb-8">
                <div className="mb-4 flex flex-wrap items-center">
                    <div className="mr-4">
                        <DateTimeRangePicker value={dateRange} onDateChange={handleDateChange} />
                    </div>
                    <div className="relative mr-4">
                        <button onClick={toggleDropdown} className="p-2 border rounded">
                            {dropdownOpen ? 'Hide Actions' : 'Filter Actions'}
                        </button>
                        {dropdownOpen && (
                            <div className="absolute mt-2 bg-white border rounded shadow-lg p-4">
                                {uniqueActions.map((action, index) => (
                                    <div key={index}>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value={action}
                                                checked={selectedActions.includes(action)}
                                                onChange={() => handleActionChange(action)}
                                                className="mr-2"
                                            />
                                            {action}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mr-4">
                        <input
                            type="text"
                            placeholder="Search IP, city, state, country, action..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="p-2 border rounded"
                        />
                    </div>
                    <div className="mr-4">
                        <label>
                            <input
                                type="checkbox"
                                checked={uniqueIPsOnly}
                                onChange={handleUniqueIPToggle}
                                className="mr-2"
                            />
                            Show Unique IPs Only
                        </label>
                    </div>
                </div>
                <div>
                    <button onClick={refreshPage} className="p-2 border rounded bg-blue-500 text-white">
                        Refresh
                    </button>
                </div>
            </div>

            

            {/* Conditional Rendering for Tabs */}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    {activeTab === 'chart' && (
                        <div>
                            <Line data={chartConfig} />
                        </div>
                    )}
                    {activeTab === 'table' && (
                        <div>
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="py-2 border-b text-left cursor-pointer dark:text" onClick={() => requestSort('id')}>
                                            ID {getSortDirection('id')}
                                        </th>
                                        <th className="py-2 border-b text-left cursor-pointer" onClick={() => requestSort('ip_address')}>
                                            IP Address {getSortDirection('ip_address')}
                                        </th>
                                        <th className="py-2 border-b text-left cursor-pointer" onClick={() => requestSort('isp')}>
                                            ISP {getSortDirection('isp')}
                                        </th>
                                        <th className="py-2 border-b text-left cursor-pointer" onClick={() => requestSort('city')}>
                                            City {getSortDirection('city')}
                                        </th>
                                        <th className="py-2 border-b text-left cursor-pointer" onClick={() => requestSort('state')}>
                                            State {getSortDirection('state')}
                                        </th>
                                        <th className="py-2 border-b text-left cursor-pointer" onClick={() => requestSort('country')}>
                                            Country {getSortDirection('country')}
                                        </th>
                                        <th className="py-2 border-b text-left cursor-pointer" onClick={() => requestSort('clicks')}>
                                            Clicks {getSortDirection('clicks')}
                                        </th>
                                        <th className="py-2 border-b text-left cursor-pointer" onClick={() => requestSort('fullscreen')}>
                                            Fullscreen {getSortDirection('fullscreen')}
                                        </th>
                                        <th className="py-2 border-b text-left cursor-pointer" onClick={() => requestSort('action')}>
                                            Action {getSortDirection('action')}
                                        </th>
                                        <th className="py-2 border-b text-left cursor-pointer" onClick={() => requestSort('createdAt')}>
                                            Create Date {getSortDirection('createdAt')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentClicks.map(click => (
                                        <tr key={click.id}>
                                            <td className="py-2 border-b">{click.id}</td>
                                            <td className="py-2 border-b">{click.ip_address}</td>
                                            <td className="py-2 border-b">{click.isp}</td>
                                            <td className="py-2 border-b">{click.city}</td>
                                            <td className="py-2 border-b">{click.state}</td>
                                            <td className="py-2 border-b">{click.country}</td>
                                            <td className="py-2 border-b">{click.clicks}</td>
                                            <td className="py-2 border-b">{click.fullscreen ? 'Yes' : 'No'}</td>
                                            <td className="py-2 border-b">{click.action}</td>
                                            <td className="py-2 border-b">{new Date(click.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex justify-between items-center mt-4">
                                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="bg-gray-200 px-3 py-1 rounded-md">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <div className="flex">
                                    {visiblePageNumbers.map(page => (
                                        <button
                                            key={page}
                                            onClick={() => paginate(page)}
                                            className={`mx-1 px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClickDataView;
