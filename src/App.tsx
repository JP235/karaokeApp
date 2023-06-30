import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import UserLanding from './pages/users/landing/UserLanding';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { LanguageContext } from './Contexts';
import { useContext } from "react"
import AdminLanding from './pages/admin/AdminEntry/AdminEntry';
import LoginForm, { RequireAuth } from './pages/admin/auth/auth';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import AdminRoom from './pages/admin/AdminRoom/AdminRoom';
import UserRoom from './pages/users/room/UserRoom';
import { Language, TLanguages } from './myTypes';
import NotFound from './components/NotFound';
import { HambButton } from './components/Buttons/Buttons';

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

function LanguagePicker() {
    const [show, setShow] = useState(false)
    const { language, setLanguage } = useContext(LanguageContext)


    useEffect(() => {
        document.addEventListener("click", (e) => clickAway(e, "language-hamb", setShow))

        return () => {
            document.removeEventListener("click", (e) => clickAway(e, "language-hamb", setShow));
        };
    }, []);
    return (
        <>
            <nav></nav>
            <div className='language-picker'>
                <HambButton className="language-hamb" onClick={() => setShow(p => !p)} title={language} />
                <div className={show ? "language-selector show" : "language-selector"}>
                    <div className="selector-buttons">
                        {Object.keys(Language).map((key, i) => {
                            const k = key as TLanguages
                            return (
                                <button key={i} onClick={() => setLanguage(k)}>
                                    {Language[k]}
                                </button>
                            )
                        })
                        }
                    </div>
                </div>
            </div>
        </>
    )
}


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


export const clickAway = (event: MouseEvent, elementName: string, setter: Dispatch<SetStateAction<boolean>>) => {
    let target = event.target as HTMLElement;
    let shouldSetFalse = true;
    while (target && !target.className.includes('content')) {
        if (target.className.includes(elementName)) {
            shouldSetFalse = false;
            break;
        }
        target = target.parentElement as HTMLElement;
    }
    if (shouldSetFalse) {
        setter(false);
    }
}
