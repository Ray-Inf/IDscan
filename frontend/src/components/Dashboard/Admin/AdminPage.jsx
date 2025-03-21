// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import UserCard from '../../UserCard';
// import CountChartContainer from '../../CountChartContainer';
// import AttendanceChartContainer from '../../AttendanceChartContainer';
// import FinanceChart from '../../FinanceChart';
// import EventCalendarContainer from '../../EventCalendarContainer';
// import Announcements from '../../Announcements';

// const AdminPage = () => {
//     const [data, setData] = useState(null);

//     useEffect(() => {
//         axios.get('http://127.0.0.1:5000/api/admin') // ✅ Fixed missing "//"
//             .then(response => setData(response.data))
//             .catch(error => console.error(error));
//     }, []);

//     if (!data) return <div>Loading...</div>;

//     // ✅ Ensure userCards is an array before mapping
//     const userCards = data.userCards || [];
//     const countChart = data.countChart || { boys: 0, girls: 0 };
//     // const attendanceChart = data.attendanceChart || [];
//     const financeChart = data.financeChart || [];
//     const events = data.events || [];
//     const announcements = data.announcements || [];

//     return (
//         <div className="p-4 flex gap-4 flex-col md:flex-row">
//             {/* LEFT */}
//             <div className="w-full lg:w-2/3 flex flex-col gap-8">
//                 {/* USER CARDS */}
//                 <div className="flex gap-4 justify-between flex-wrap">
//                     {userCards.length > 0 ? (
//                         userCards.map(card => (
//                             <UserCard key={card.type} type={card.type} count={card.count} />
//                         ))
//                     ) : (
//                         <p>No user data available.</p>
//                     )}
//                 </div>
//                 {/* MIDDLE CHARTS */}
//                 <div className="flex gap-4 flex-col lg:flex-row">
//                     {/* COUNT CHART */}
//                     <div className="w-full lg:w-1/3 h-[450px]">
//                         <CountChartContainer boys={countChart.boys} girls={countChart.girls} />
//                     </div>
//                     {/* ATTENDANCE CHART */}
//                     <div className="w-full lg:w-2/3 h-[450px]">
//                         <AttendanceChartContainer data={attendanceChart} />
//                     </div>
//                 </div>
//                 {/* BOTTOM CHART */}
//                 <div className="w-full h-[500px]">
//                     <FinanceChart data={financeChart} />
//                 </div>
//             </div>
//             {/* RIGHT */}
//             <div className="w-full lg:w-1/3 flex flex-col gap-8">
//                 <EventCalendarContainer events={events} />
//                 <Announcements announcements={announcements} />
//             </div>
//         </div>
//     );
// };

// export default AdminPage;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from '../../UserCard';
import CountChartContainer from '../../CountChartContainer';
import AttendanceChartContainer from '../../AttendanceChartContainer';
import FinanceChart from '../../FinanceChart';
import EventCalendarContainer from '../../EventCalendarContainer';
import Announcements from '../../Announcements';

const AdminPage = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/api/admin')
            .then(response => setData(response.data))
            .catch(error => console.error(error));
    }, []);

    if (!data) return <div>Loading...</div>;

    // Ensure userCards is an array before mapping
    const userCards = data.userCards || [];
    const countChart = data.countChart || { boys: 0, girls: 0 };
    const attendanceChart = data.attendanceChart || []; // Define attendanceChart
    const financeChart = data.financeChart || [];
    const events = data.events || [];
    const announcements = data.announcements || [];

    return (
        <div className="p-4 flex gap-4 flex-col md:flex-row">
            {/* LEFT */}
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
                {/* USER CARDS */}
                <div className="flex gap-4 justify-between flex-wrap">
                    {userCards.length > 0 ? (
                        userCards.map(card => (
                            <UserCard key={card.type} type={card.type} count={card.count} />
                        ))
                    ) : (
                        <p>No user data available.</p>
                    )}
                </div>
                {/* MIDDLE CHARTS */}
                <div className="flex gap-4 flex-col lg:flex-row">
                    {/* COUNT CHART */}
                    <div className="w-full lg:w-1/3 h-[450px]">
                        <CountChartContainer boys={countChart.boys} girls={countChart.girls} />
                    </div>
                    {/* ATTENDANCE CHART */}
                    <div className="w-full lg:w-2/3 h-[450px]">
                        <AttendanceChartContainer data={attendanceChart} />
                    </div>
                </div>
                {/* BOTTOM CHART */}
                <div className="w-full h-[500px]">
                    <FinanceChart data={financeChart} />
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
                <EventCalendarContainer events={events} />
                <Announcements announcements={announcements} />
            </div>
        </div>
    );
};

export default AdminPage;