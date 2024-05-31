import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClickDataView = () => {
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // You can change the number of items per page here

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/analytics/getclicks');
                setClicks(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredClicks = clicks.filter(click =>
        click.ip_address.includes(search) ||
        click.city.includes(search) ||
        click.state.includes(search) ||
        click.country.includes(search)
    );

    // Calculate the current data to be displayed
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClicks = filteredClicks.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Click Data</h1>
            <input
                type="text"
                placeholder="Search..."
                className="mb-4 p-2 border border-gray-300 rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">IP Address</th>
                        <th className="py-2 px-4 border-b">ISP</th>
                        <th className="py-2 px-4 border-b">City</th>
                        <th className="py-2 px-4 border-b">State</th>
                        <th className="py-2 px-4 border-b">Country</th>
                        <th className="py-2 px-4 border-b">Create Date</th>
                    </tr>
                </thead>
                <tbody>
                    {currentClicks.map((click) => (
                        <tr key={click.id}>
                            <td className="py-2 px-4 border-b text-center">{click.id}</td>
                            <td className="py-2 px-4 border-b text-center">{click.ip_address}</td>
                            <td className="py-2 px-4 border-b text-center">{click.isp}</td>
                            <td className="py-2 px-4 border-b text-center">{click.city}</td>
                            <td className="py-2 px-4 border-b text-center">{click.state}</td>
                            <td className="py-2 px-4 border-b text-center">{click.country}</td>
                            <td className="py-2 px-4 border-b text-center">{new Date(click.createdAt).toLocaleString()}</td>
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
