import React from 'react';
import { NavLink } from 'react-router-dom';
import '../componentCSS/navbar.css';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';

export default function NavBar(){
    function NavList(){
        return  <div className={"nav"}>
            <NavLink to={'/'} exact className={"link"}>Home</NavLink>
            <NavLink to={'/notes'} exact className={"link"}>My Notes</NavLink>
            <NavLink to={'/login'} exact className={"link"}>Login</NavLink>
            <NavLink to={'/signup'} exact className={"link"}>Sign Up</NavLink>
        </div>;
    }
    function NavMenu(){
        const [anchorEl, setAnchorEl] = React.useState(null);
        const open = Boolean(anchorEl);
        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };

        return (
            <div className={"navMenu"}>
                <MenuIcon aria-controls={open ? 'basic-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={handleClick} className={"menu"}/>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={handleClose}><NavLink to={'/'} exact className={"link2"}>Home</NavLink></MenuItem>
                    <MenuItem onClick={handleClose}><NavLink to={'/notes'} exact className={"link2"}>My Notes</NavLink></MenuItem>
                    <MenuItem onClick={handleClose}><NavLink to={'/login'} exact className={"link2"}>Login</NavLink></MenuItem>
                    <MenuItem onClick={handleClose}><NavLink to={'/signup'} exact className={"link2"}>Sign Up</NavLink></MenuItem>
                </Menu>
            </div>
        );
    }

    class NavBar extends React.Component{
        constructor(props) {
            super(props);
            this.state = {element: <NavList/>};
        }
        componentDidMount() {
            this.checkInterval = setInterval(
                () => this.check(),
                10
            );
        }

        componentWillUnmount() {
            clearInterval(this.checkInterval);
        }

        check(){
            let notes = document.getElementsByClassName('noteElement');
            if(window.innerWidth >= 600){
                if(document.getElementById('title')){
                    document.getElementById('title').style.fontSize = '53px';
                }
                if(notes && notes.length > 0){
                    for(let note=notes.length;note>0;note--){
                        notes[note-1].style.margin = '30px';
                    }
                }
                if(this.state.element != <NavList/>){
                   this.setState({element: <NavList/>})
                }
            }
            else{
                if(document.getElementById('title')){
                    document.getElementById('title').style.fontSize = '25px';
                }
                if(notes && notes.length > 0){
                    for(let note=notes.length;note>0;note--){
                        notes[note-1].style.margin = '10px';
                    }
                }
                if(this.state.element != <NavMenu/>){
                    this.setState({element: <NavMenu/>})
                }
            }
        }

        render (){
            return <div>{this.state.element}</div>
        }

    }
    return <NavBar/>
}