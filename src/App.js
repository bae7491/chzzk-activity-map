import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import ChannelSearch from './pages/ChannelSearch/ChannelSearch';
import DayDetail from './pages/DayDetail/DayDetail';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path='/search' element={<ChannelSearch />} />
                <Route path="/dayDetail" element={<DayDetail />} />
            </Routes>
        </BrowserRouter>
    );
}