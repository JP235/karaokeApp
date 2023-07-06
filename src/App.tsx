import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import UserLanding from './pages/users/landing/UserLanding';
import AdminLanding from './pages/admin/AdminEntry/AdminEntry';
import LoginForm, { RequireAuth } from './pages/admin/auth/auth';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import AdminRoom from './pages/admin/AdminRoom/AdminRoom';
import UserRoom from './pages/users/room/UserRoom';
import NotFound from './components/NotFound';
import LanguagePicker from './Language/LanguagePicker';

function App() {
    return (
        <div className="App">
            <Navbar />
            <div className="content">
                <BrowserRouter>
                    <Routes>
                        <Route path="login" element={<LoginForm />} />
                        <Route element={<RequireAuth />}>
                            <Route path='/admin' element={<AdminLanding />}>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path=":roomId" element={<AdminRoom />} />
                            </Route>
                        </Route>
                        <Route path='/' element={<UserLanding />} />
                        <Route path='/sala/:roomId' element={<UserRoom />} />
                        <Route path='/room/:roomId' element={<UserRoom />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </div >
    )
}

export default App


export const Navbar = () => {
    return (
        <nav className='navbar'>
            <ul>
                <li><a href="/">KaraokeApp</a></li>
                {/* <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li> */}
            </ul>
            <LanguagePicker />
        </nav>
    );
};



