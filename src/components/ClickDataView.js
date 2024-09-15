import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Datepicker from "react-tailwindcss-datepicker";
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const ClickDataView = () => {
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [dateRange, setDateRange] = useState({
        endDate: moment().toDate(),
    });
    const [chartData, setChartData] = useState([]);
    const [chartLabels, setChartLabels] = useState([]);
    const [uniqueIPsOnly, setUniqueIPsOnly] = useState(false); // State for unique IP filter
    const [selectedActions, setSelectedActions] = useState([]); // State for selected actions
    const [dropdownOpen, setDropdownOpen] = useState(false); // State to control dropdown visibility
    const [totalClicks, setTotalClicks] = useState(0); // State for total clicks count

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.post('https://masterprime.site/analytics/getclicks', {
                startDate: moment(dateRange.startDate).startOf('day').toDate(),
                endDate: moment(dateRange.endDate).endOf('day').toDate(),
            });
            setClicks(response.data);
            updateChartData(response.data, uniqueIPsOnly, selectedActions);
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

        // Filter by selected actions
        const filteredData = actionsFilter.length > 0
            ? data.filter(click => actionsFilter.includes(click.action))
            : data;

        filteredData.forEach(click => {
            const timeSlot = moment(click.createdAt).startOf('minute').format('HH:mm');
            if (!groupedData[timeSlot]) {
                groupedData[timeSlot] = new Set(); // Use a set to store unique IPs or clicks
            }
            if (uniqueOnly) {
                groupedData[timeSlot].add(click.ip_address); // Add only unique IPs
            } else {
                groupedData[timeSlot].add(JSON.stringify(click)); // Just to get the count of all clicks
            }
        });

        const labels = Object.keys(groupedData);
        const values = labels.map(label => groupedData[label].size); // Get size of the set (unique IP count or total clicks)

        setChartLabels(labels);
        setChartData(values);
        setTotalClicks(filteredData.length); // Update total clicks count
    };

    const handleValueChange = (newValue) => {
        setDateRange(newValue);
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

    const filteredClicks = clicks.filter(click =>
        click.ip_address.includes(search) ||
        click.city.toLowerCase().includes(search) ||
        click.state.toLowerCase().includes(search) ||
        click.country.toLowerCase().includes(search) ||
        click.action.toLowerCase().includes(search)
    );

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
        setCurrentPage(1); // Reset to first page
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

    const uniqueActions = [...new Set(clicks.map(click => click.action))]; // Get unique actions from clicks

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Click Data</h1>
            <div className="relative">
                <div className="flex justify-between mb-4">
                    <div className="w-80">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="p-2 border border-gray-300 rounded w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex w-auto space-x-6">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={refreshPage}>Refresh</button>
                        <Datepicker
                            primaryColor={"blue"}
                            value={dateRange}
                            onChange={handleValueChange}
                            showShortcuts={true}
                            wrapperClassName="border border-gray-300 w-full"
                        />
                        <select
                            className="p-2 border border-gray-300 rounded"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="font-bold text-lg">Total Clicks: {totalClicks}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={uniqueIPsOnly}
                                onChange={handleUniqueIPToggle}
                                className="form-checkbox"
                            />
                            <span>Unique IPs Only</span>
                        </label>
                        <div className="relative">
                            <button
                                onClick={toggleDropdown}
                                className="bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Select Actions
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-100 py-2 bg-white border border-gray-300 rounded-md shadow-lg">
                                    {uniqueActions.map(action => (
                                        <label key={action} className="flex items-center px-4 py-2 hover:bg-gray-100">
                                            <input
                                                type="checkbox"
                                                checked={selectedActions.includes(action)}
                                                onChange={() => handleActionChange(action)}
                                                className="form-checkbox"
                                            />
                                            <span className="ml-2">{action}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 z-10">
                        <div className="loader"></div>
                    </div>
                )}
                <Line data={chartConfig} />
                <table className="table min-w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mt-4">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }} className="py-2 border-b cursor-pointer dark:text" onClick={() => requestSort('id')}>
                                ID {getSortDirection('id')}
                            </th>
                            <th style={{ width: '100px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('ip_address')}>
                                IP Address {getSortDirection('ip_address')}
                            </th>
                            <th style={{ width: '100px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('isp')}>
                                ISP {getSortDirection('isp')}
                            </th>
                            <th style={{ width: '100px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('city')}>
                                City {getSortDirection('city')}
                            </th>
                            <th style={{ width: '100px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('state')}>
                                State {getSortDirection('state')}
                            </th>
                            <th style={{ width: '100px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('country')}>
                                Country {getSortDirection('country')}
                            </th>
                            <th style={{ width: '50px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('clicks')}>
                                Clicks {getSortDirection('clicks')}
                            </th>
                            <th style={{ width: '50px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('fullscreen')}>
                                Fullscreen {getSortDirection('fullscreen')}
                            </th>
                            <th style={{ width: '50px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('action')}>
                                Action {getSortDirection('action')}
                            </th>
                            <th style={{ width: '50px' }} className="py-2 px-3 border-b cursor-pointer" onClick={() => requestSort('createdAt')}>
                                Create Date {getSortDirection('createdAt')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentClicks.map((click) => (
                            <tr key={click.id}>
                                <td className="py-2 border-b text-center">{click.id}</td>
                                <td className="py-2 border-b text-center">{click.ip_address}</td>
                                <td className="py-2 border-b text-center">{click.isp}</td>
                                <td className="py-2 border-b text-center">{click.city}</td>
                                <td className="py-2 border-b text-center">{click.state}</td>
                                <td className="py-2 border-b text-center">{click.country}</td>
                                <td className="py-2 border-b text-center">{click.clicks}</td>
                                <td className="py-2 border-b text-center">{click.fullscreen ? "Yes" : "No"}</td>
                                <td className="py-2 border-b text-center">{click.action}</td>
                                <td className="py-2 px-3 border-b text-center">{new Date(click.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <nav className="mt-4">
                <ul className="pagination flex justify-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(1)}>First</button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                    </li>
                    {visiblePageNumbers.map(number => (
                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                            <button onClick={() => paginate(number)} className="page-link">{number}</button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(totalPages)}>Last</button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default ClickDataView;
