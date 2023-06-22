import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import UserLanding from './pages/users/landing/UserLanding';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { LanguageContext } from './Contexts';
import { useContext } from "react"
import AdminLanding from './pages/admin/AdminEntry/AdminEntry';
import LoginForm from './auth/auth';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import AdminRoom from './pages/admin/AdminRoom/AdminRoom';
import UserRoom from './pages/users/room/UserRoom';
import { Language, TLanguages } from './myTypes';
import HambButton from './components/HambButton';
import NotFound from './components/NotFound';

function App() {

    return (
        <div className="App">
            <LanguageDropdown />
            <div className="content">
                <BrowserRouter>
                    <Routes>
                        <Route path='/admin' element={<AdminLanding />}>
                            <Route path="login" element={<LoginForm />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path=":roomId" element={<AdminRoom />} />
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

function LanguageDropdown() {
    const [show, setShow] = useState(false)
    const { language, setLanguage } = useContext(LanguageContext)


    useEffect(() => {
        document.addEventListener("click", (e) => clickAway(e, "language-hamb", setShow))

        return () => {
            document.removeEventListener("click", (e) => clickAway(e, "language-hamb", setShow));
        };
    }, []);
    return (
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
        </div>)
}



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
