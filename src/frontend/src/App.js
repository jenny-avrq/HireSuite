import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import AdminHP from "./pages/AdminHP";
import ApplicantHomepage from "./pages/ApplicantHomepage";

function App() {
  return (
    <Router>
      <Routes>
        {/*main landing page */}
        <Route path="/" element={<Homepage/>} />

        {/* Applicant Homepage */}
        <Route path="/applicant-home" element={<ApplicantHomepage />} />
        
        {/* Applicant Homepage */}
        <Route path="/admin-home" element={<AdminHP />} />
        
      </Routes>
    </Router>
  );
}

export default App;


