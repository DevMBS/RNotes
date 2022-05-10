import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
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

export default function SignUp() {
    const [emailErrorText, setEmailErrorText] = React.useState('');
    const [emailError, setEmailError] = React.useState(false);
    const [emptyPasswordError, setEmptyPasswordError] = React.useState('');
    const [emptyFirstNameError, setEmptyFirstNameError] = React.useState('');
    const [emptyLastNameError, setEmptyLastNameError] = React.useState('');
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if(data.get('firstName') == ''){
            setEmptyFirstNameError('Required');
        }
        else if(data.get('password') == ''){
            setEmptyPasswordError('Required');
        }
        else if(data.get('email') == ''){
            setEmailErrorText('Required');
        }
        else if(data.get('lastName') == ''){
            setEmptyLastNameError('Required');
        }
        else{
            socket.emit('signUpReq', {
                email: data.get('email'),
                password: data.get('password'),
                firstName: data.get('firstName'),
                lastName: data.get('lastName')
            });
        }
    };
    const typingFirstName = (event) => {
        event.preventDefault();
        setEmptyFirstNameError('');
        event.currentTarget.value = event.currentTarget.value.replace(/[^A-z]/g, '');
    }
    const typingLastName = (event) => {
        event.preventDefault();
        setEmptyLastNameError('');
        event.currentTarget.value = event.currentTarget.value.replace(/[^A-z]/g, '');
    }
    const typingEmail = (event) =>{
        event.preventDefault();
        setEmailErrorText('');
        event.currentTarget.value = event.currentTarget.value.replace(/[^A-z.@^0-9]/g, '');
    }

    const [text, setText] = React.useState("Enter verification code from the email we sent:");
    const [open, setOpen] = React.useState(false);
    socket.on('signUpRes', res =>{
        if(res.body === 'emailError'){
            setEmailError(true);
            setEmailErrorText("A user with this nickname already exist!");
        }
        else if(res.body === 'verificationCodeError'){
            setText("Wrong verification code! Please try again:");
            setOpen(true);
        }
        else if(res.body === 'success'){
            localStorage.setItem('uid', res.uid);
            location.href = '../notes';
        }
    });
    const [buttonType, setButtonType] = React.useState(true);
    socket.on('checkVerificationCode', ()=>{
        setButtonType(false);
    });
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const send = () => {
        socket.emit('verificationCode', document.getElementById('code').value);
        setOpen(false);
    };
    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    onChange={typingFirstName}
                                    helperText={emptyFirstNameError}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                    onChange={typingLastName}
                                    helperText={emptyLastNameError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    helperText={emailErrorText}
                                    error={emailError}
                                    onChange={typingEmail}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    helperText={emptyPasswordError}
                                    onChange={()=>{setEmptyPasswordError('')}}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            id={"submit"}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
            <div style={{marginTop: '80px', display: 'flex', justifyContent: 'center'}}>
                <Button variant="outlined" onClick={handleClickOpen} disabled={buttonType}>
                    Send verification code
                </Button>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Verification code</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {text}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="code"
                            label="Code"
                            fullWidth
                            variant="standard"
                            name="verCode"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={send}>Send</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </ThemeProvider>
    );
}