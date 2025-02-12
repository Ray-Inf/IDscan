// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import Register from './components/Register';
// import Login from './components/Login';
// import './index.css';
// import QRCodeScan from './components/QRcode';
// import QRCodeScanner from './components/QRcode';
// import IDScan from './components/IDScan';

// // import IDScan from './components/IDScan';

// export default function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
//         <nav className="bg-indigo-600 p-4 shadow-lg">
//           <div className="max-w-7xl mx-auto">
//             <ul className="flex space-x-6">
//               <li className="text-white hover:text-indigo-200">
//                 <Link to="/" className="text-lg font-semibold">
//                   Login
//                 </Link>
//               </li>
//               <li className="text-white hover:text-indigo-200">
//                 <Link to="/register" className="text-lg font-semibold">
//                   Register
//                 </Link>
//               </li>
//               {/* <li className="text-white hover:text-indigo-200">
//                 <Link to="/login" className="text-lg font-semibold">
//                   Login
//                 </Link>
//               </li> */}
//               <li className="text-white hover:text-indigo-200">
//                 <Link to="/idScan" className="text-lg font-semibold">
//                   IDScan
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </nav>
//         <div className="flex-grow">
//           <Routes>
//             <Route path="/" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/idScan" element={<IDScan/>} />
//           </Routes>
//         </div>
//         <footer className="bg-gray-800 text-white py-4 mt-8">
//           <div className="max-w-7xl mx-auto text-center">
//             <p>&copy; 2024 IDScanner. All rights reserved.</p>
//           </div>
//         </footer>
//       </div>
//     </Router>
//   );
// }
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import Register from "./components/Register"
import Login from "./components/Login"
import IDScan from "./components/IDScan"
import "./index.css"
import IDVERIFY from "./components/IDVERIFY"

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
        <nav className="bg-indigo-600 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <ul className="flex space-x-6">
              <li className="text-white hover:text-indigo-200">
                <Link to="/" className="text-lg font-semibold">
                  Login
                </Link>
              </li>
              <li className="text-white hover:text-indigo-200">
                <Link to="/register" className="text-lg font-semibold">
                  Register
                </Link>
              </li>
              <li className="text-white hover:text-indigo-200">
                <Link to="/idScan" className="text-lg font-semibold">
                  IDScan
                </Link>
              </li>
              <li className="text-white hover:text-indigo-200">
                <Link to="/idVerify" className="text-lg font-semibold">
                  IDVERIFY
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/idScan" element={<IDScan />} />
            <Route path="/idVerify" element={<IDVERIFY/>}/>
          </Routes>
        </div>
        <footer className="bg-gray-800 text-white py-4 mt-8">
          <div className="max-w-7xl mx-auto text-center">
            <p>&copy; 2024 IDScanner. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

