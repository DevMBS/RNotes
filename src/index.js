import React, {useState} from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './index.css';
import SignUp from './components/signup';
import SignIn from './components/signin';
import NavBar from './components/navbar';
import Notes from './components/notes';
import Button from '@mui/material/Button';
function Note(){
    return <div className={"note"}>
        <span className={"noteTitle"}>Note: </span><p className={"text"}>Register to create, edit and save notes!</p>
    </div>
}
function Main(){
    return <div id={"main"}>
        <h1 id={"title"}>RNotes. Just a <span id={"nm"}>note manager</span></h1>
        <Note/><div className={"signUpButton"}><Button variant="outlined" href={"/signup"}>Sign Up</Button></div>
    </div>
}
function App(){
    return <Router>
        <NavBar/>
        <Routes>
            <Route path='/' element={<Main/>} />
            <Route path='/notes' element={<Notes/>} />
            <Route path='/signup' element={<SignUp/>} />
            <Route path='/login' element={<SignIn/>} />
        </Routes>
    </Router>
}

const root = ReactDOMClient.createRoot(document.querySelector('#app'));
root.render(<App/>);
