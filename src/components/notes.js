import * as React from 'react';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';
import Slide from '@mui/material/Slide';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import '../componentCSS/notes.css';
import io from 'socket.io-client';
const socket = io('http://localhost:8000');
const theme = createTheme(
    {
        palette: {
            primary: {
                main: '#02238f',
            },
            secondary: {
                light: '#9ec6ff',
                main: '#0044ff',
            },
            contrastThreshold: 3,
            tonalOffset: 0.2,
        },
    }
);

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} style={{zIndex: 99}}/>;
});
let authorized = false;
let notesList = [];
let editMode = false;
let editedNote;
export default function Notes(){
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [nickname, setNickname] = React.useState('');
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const logOut = () => {
        setAnchorEl(null);
        if(localStorage.getItem('uid')){
            localStorage.removeItem('uid');
        }
        else{
            sessionStorage.removeItem('uid');
        }
        location.href = '../login';
    };
    if(localStorage.getItem('uid') || sessionStorage.getItem('uid')){
        if(!authorized){
            if(localStorage.getItem('uid')){
                socket.emit('uid', localStorage.getItem('uid'));
            }
            else if(sessionStorage.getItem('uid')){
                socket.emit('uid', sessionStorage.getItem('uid'));
            }
            authorized = true;
        }
    }
    else{
        location.href = '../login';
    }
    socket.on('uidRes', (nickname) => {
        setNickname(nickname);
    });
    function deleteNote(index){
        if(localStorage.getItem('uid')){
            socket.emit('delete', {uid: localStorage.getItem('uid'), index: index});
        }
        else if(sessionStorage.getItem('uid')){
            socket.emit('delete', {uid: sessionStorage.getItem('uid'), index: index});
        }
    }
    const [openNewNote, setOpenNewNote] = React.useState(false);
    const handleClickOpen = () => {
        setOpenNewNote(true);
    };
    const handleNoteClose = () => {
        setOpenNewNote(false);
    };
    function editNote(index){
        let title = document.getElementById(`title${index}`).dataset.title;
        let text = document.getElementById(`text${index}`).dataset.text;
        setTimeout(()=>{
            document.getElementById('noteTitle').value = title;
            document.getElementById('noteArea').value = text;
        }, 100);
        editMode = true;
        editedNote = index;
    }
    function Note(props){
        return (
            <div className={"noteElement"}>
                <span className={"noteElementTitle"} id={`title${props.number}`} data-title={props.title}>{props.title}</span>
                <p className={"noteElementText"} id={`text${props.number}`} data-text={props.text}>{props.text}</p>
                <DeleteIcon className={"delete"} onClick={(event)=>{event.preventDefault();deleteNote(props.number)}}/>
                <EditIcon className={"edit"} onClick={()=>{handleClickOpen();editNote(props.number)}}/>
            </div>
        )
    }

    const [notes, setNotes] = React.useState([]);
    if(notes.length === 0){
        if(localStorage.getItem('uid')){
            socket.emit('uid', localStorage.getItem('uid'));
        }
        else if(sessionStorage.getItem('uid')){
            socket.emit('uid', sessionStorage.getItem('uid'));
        }
    }
    socket.on('notes', savedNotes => {
        if(!sessionStorage.getItem('notes')){
            sessionStorage.setItem('notes', JSON.stringify(savedNotes));
        }
        for(let key = savedNotes.length;key>0;key--){
            if(!savedNotes[key-1].type){
                savedNotes[key-1] = <Note title={savedNotes[key-1].title} text={savedNotes[key-1].text} key={key-1} number={key-1}/>
            }
        }
        setNotes(savedNotes);
    });
    if(sessionStorage.getItem('notes')){
        notesList = JSON.parse(sessionStorage.getItem('notes'));
        sessionStorage.removeItem('notes');
    }
    const saveNote = () => {
        if(document.getElementById('noteTitle').value != '' || document.getElementById('noteArea').value != ''){
            if(editMode){
                console.log(editedNote);
                notesList.splice(editedNote,1);
                setNotes(notes.splice(editedNote, 1));
                editMode = false;
                editedNote = false;
            }
            setOpenNewNote(false);
            setNotes([<Note title={document.getElementById('noteTitle').value} text={document.getElementById('noteArea').value} key={notes.length + 1}/>, ...notes]);
            notesList.unshift({title: document.getElementById('noteTitle').value, text: document.getElementById('noteArea').value});
            if(localStorage.getItem('uid')){
                socket.emit('notes', {uid: localStorage.getItem('uid'), notes: notesList});
            }
            else if(sessionStorage.getItem('uid')){
                socket.emit('notes', {uid: sessionStorage.getItem('uid'), notes: notesList});
            }
        }
    };
    function Notes(){
        return (
            <div id={"notesContainer"}>
                {notes}
            </div>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <div id="account">
                <AccountBoxIcon
                    id="accountButton"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                />
                <Menu
                    id="accountMenu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem disabled id={'nickname'}>{nickname}</MenuItem>
                    <MenuItem onClick={logOut}>Logout</MenuItem>
                </Menu>
            </div>
            <div>
                <Notes/>
                <div id="newNote">
                    <Button variant="text" id="addNewNote" onClick={handleClickOpen}><AddIcon/></Button>
                </div>
                <Dialog
                    fullScreen
                    open={openNewNote}
                    onClose={handleNoteClose}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{ position: 'relative' }}>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleNoteClose}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                                New Note
                            </Typography>
                            <Button autoFocus color="inherit" onClick={saveNote}>
                                save
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <Box sx={{ display: 'flex' }}>
                        <CssBaseline />
                        <Box
                            component="main"
                            sx={{ flexGrow: 1, p: 3, width: { sm: `100%` } }}
                        >
                            <Toolbar />
                            <TextField id="noteTitle" label="Title" variant="standard" style={{marginTop: '-70px'}} autoFocus/>
                            <TextareaAutosize
                                aria-label="empty textarea"
                                placeholder="Text"
                                id="noteArea"
                                style={{ width: '100%', height: '75vh', border: 'none', outline: 'none', resize: 'none', overflow: 'auto' }}
                            />
                        </Box>
                    </Box>
                </Dialog>
            </div>
        </ThemeProvider>)
}