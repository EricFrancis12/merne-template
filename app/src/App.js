import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ExampleItems from './pages/ExampleItems';

function App() {
    return (
        <>
            <nav className='w-100 border border-black'>
                <ul className='flex items-center gap-4 m-2 p-2 '>
                    <li>
                        <Link to='/app'>Dashboard</Link>
                    </li>
                    <li>
                        <Link to='/app/example-items'>Example Items</Link>
                    </li>
                </ul>
            </nav>
            <Routes>
                <Route path='/app' element={<Dashboard />} />
                <Route path='/app/example-items' element={<ExampleItems />} />
            </Routes>
        </>
    );
}

export default App;
