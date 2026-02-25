import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Weight from './pages/Weight';
import Diet from './pages/Diet';
import Fitness from './pages/Fitness';
import Report from './pages/Report';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Layout>
  );
}

export default App;
