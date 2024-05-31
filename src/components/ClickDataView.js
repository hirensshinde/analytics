import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Datepicker from "react-tailwindcss-datepicker"; 
// import moment 
import moment from 'moment';

const ClickDataView = () => {
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [dateRange, setDateRange] = useState({ 
        startDate: moment().startOf('month').toDate(), 
        endDate: moment().toDate(), 
    }); 

    const fetchData = useCallback( async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/analytics/getclicks', {
                startDate: moment(dateRange.startDate).startOf('day').toDate(),
                endDate: moment(dateRange.endDate).endOf('day').toDate(),
            });
            setClicks(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchData(); // Initial fetch
        const interval = setInterval(() => {
            fetchData(); // Fetch data every 5 seconds
        }, 5000);
        return () => clearInterval(interval); // Clean up the interval on component unmount
    }, [fetchData]);
    
    const handleValueChange = (newValue) => {
        console.log("newValue:", newValue); 
        setDateRange(newValue); 
    }

    const filteredClicks = clicks.filter(click =>
        click.ip_address.includes(search) ||
        click.city.includes(search) ||
        click.state.includes(search) ||
        click.country.includes(search)
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

    // Calculate the current data to be displayed
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

    // const handleValueChange = (newValue) => {
    //     setDateRange(newValue);
    // };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1); // Reset to first page
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Click Data</h1>
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
                <div className="flex w-96 space-x-6">
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
            <div className="">
            </div>
            <table className="min-w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }} className="py-2 border-b cursor-pointer dark:text" onClick={() => requestSort('id')}>
                            ID {getSortDirection('id')}
                        </th>
                        <th style={{ width: '100px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('ip_address')}>
                            IP Address {getSortDirection('ip_address')}
                        </th>
                        <th style={{ width: '170px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('isp')}>
                            ISP {getSortDirection('isp')}
                        </th>
                        <th style={{ width: '100px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('city')}>
                            City {getSortDirection('city')}
                        </th>
                        <th style={{ width: '100px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('state')}>
                            State {getSortDirection('state')}
                        </th>
                        <th style={{ width: '50px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('country')}>
                            Country {getSortDirection('country')}
                        </th>
                        <th style={{ width: '50px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('clicks')}>
                            Clicks {getSortDirection('clicks')}
                        </th>
                        <th style={{ width: '40px' }} className="py-2 border-b cursor-pointer" onClick={() => requestSort('fullscreen')}>
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
                            <td className="py-2 border-b text-center">{click.fullscreen}</td>
                            <td className="py-2 border-b text-center">{click.action}</td>
                            <td className="py-2 px-3 border-b text-center">{new Date(click.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <nav className="mt-4">
                <ul className="pagination flex justify-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            onClick={() => paginate(1)}
                            className="page-link p-1 w-8 border rounded mx-1"
                            disabled={currentPage === 1}
                        >
                            &laquo;
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            className="page-link p-1 w-8 border rounded mx-1"
                            disabled={currentPage === 1}
                        >
                            &lsaquo;
                        </button>
                    </li>
                    {visiblePageNumbers.map(number => (
                        <li key={number} className={`page-item ${number === currentPage ? 'active' : ''} mx-1`}>
                            <button onClick={() => paginate(number)} className={`page-link p-1 w-8 border rounded ${number === currentPage ? 'bg-blue-500 text-white' : ''}`}>
                                {number}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            className="page-link p-1 w-8 border rounded mx-1"
                            disabled={currentPage === totalPages}
                        >
                            &rsaquo;
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            onClick={() => paginate(totalPages)}
                            className="page-link p-1 w-8 border rounded mx-1"
                            disabled={currentPage === totalPages}
                        >
                            &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default ClickDataView;
