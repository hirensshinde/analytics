import React from 'react';
import MainLayout from '../components/MainLayout';
import AnalyticsView from '../analytics-components/AnalyticsView';

const ClickDataView = () => {
    return (
        <MainLayout>
            {/* <h1 className="text-2xl font-bold mb-4">Click Data View</h1> */}
            <AnalyticsView />
        </MainLayout>
    );
};

export default ClickDataView;
