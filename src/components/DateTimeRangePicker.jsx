import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DateTimeRangePicker = ({ onDateChange }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const handleStartDateChange = (date) => {
        setStartDate(date);
        onDateChange({
            startDate: date,
            endDate: endDate
        });
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        onDateChange({
            startDate: startDate,
            endDate: date
        });
    };

    return (
        <div className="flex space-x-3">
            <div>
                {/* <label className="block text-gray-700">Start Date & Time</label> */}
                <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="p-2 border border-gray-300 rounded"
                />
            </div>
            <div className="mt-2"> - </div>
            <div>
                {/* <label className="block text-gray-700">End Date & Time</label> */}
                <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="p-2 border border-gray-300 rounded"
                />
            </div>
        </div>
    );
};

export default DateTimeRangePicker;
