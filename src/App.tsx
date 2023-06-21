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
        <>
            <button className={show ? "language-hamb hide" : "language-hamb"} type='button' onClick={() => setShow(p => !p)} title={language} >
                <HambButton />
            </button>
            <div className={show ? "language-selector" : "language-selector hide"}>
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
        </>)
}

function HambButton() {
    return (<>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
    </>)
}

export const clickAway = (event: MouseEvent, parentName: string, setter: Dispatch<SetStateAction<boolean>>) => {
    const target = event.target as HTMLElement
    if (!target.className.includes(parentName) && !target.parentElement?.className.includes(parentName)) {
        setter(false)
    }
}
function NotFound() {
    return <h1>Not Found</h1>;
}