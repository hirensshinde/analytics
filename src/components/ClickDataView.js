import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClickDataView = () => {
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Click Data</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>IP Address</th>
                        <th>ISP</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Country</th>
                        <th>Create Date</th>
                    </tr>
                </thead>
                <tbody>
                    {clicks.map((click) => (
                        <tr key={click.id}>
                            <td>{click.id}</td>
                            <td>{click.ip_address}</td>
                            <td>{click.isp}</td>
                            <td>{click.city}</td>
                            <td>{click.state}</td>
                            <td>{click.country}</td>
                            <td>{new Date(click.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClickDataView;
