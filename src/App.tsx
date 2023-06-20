import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import UserLanding from './pages/users/landing/landing';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { LanguageContext } from './Contexts';
import { useContext } from "react"
import AdminLanding from './pages/admin/AdminEntry/AdminEntry';
import LoginForm from './auth/auth';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import AdminRoom from './pages/admin/AdminRoom/AdminRoom';

function App() {

    return (
        <div className="App">
            <LanguageDropdown />
            <div className="content">
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<UserLanding />} />
                        <Route path='/admin' element={<AdminLanding />}>
                            <Route path=":roomId" element={<AdminRoom />} />
                            <Route path="login" element={<LoginForm />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
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

                <button type='button' onClick={() => setLanguage("ES")}>ES</button>
                <button type='button' onClick={() => setLanguage("EN")}>EN</button>
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