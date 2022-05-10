import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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

export default function SignIn() {
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorText, setEmailErrorText] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorText, setPasswordErrorText] = React.useState('');
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if(data.get('email') == ''){
            setEmailError(true);
            setEmailErrorText('Required');
        }
        else if(data.get('password') == ''){
            setPasswordError(true);
            setPasswordErrorText('Required');
        }
        else{
            socket.emit('loginReq', {email: data.get("email"), password: data.get("password")});
            if(localStorage.getItem('uid')){
                localStorage.removeItem('uid');
            }
            if(sessionStorage.getItem('uid')){
                sessionStorage.removeItem('uid');
            }
            socket.on('loginRes', (res) => {
                if(res.body == 'success'){
                    if(data.get("remember")){
                        localStorage.setItem('uid', res.uid);
                        location.href = '../notes';
                    }
                    else{
                        sessionStorage.setItem('uid', res.uid);
                        location.href = '../notes';
                    }
                }
                else if(res.body == 'emailError'){
                    setEmailError(true);
                    setEmailErrorText('Hmm... We can\'t find this email in our database');
                }
                else if(res.body == 'passwordError'){
                    setPasswordError(true);
                    setPasswordErrorText('Wrong password');
                }
            });
        }
    };
    const typingEmail = (event) =>{
        event.preventDefault();
        setEmailErrorText('');
        event.currentTarget.value = event.currentTarget.value.replace(/[^A-z.@^0-9]/g, '');
    }

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
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            error={emailError}
                            helperText={emailErrorText}
                            onChange={typingEmail}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            error={passwordError}
                            helperText={passwordErrorText}
                            onChange={()=>{setPasswordErrorText(''); setPasswordError(false);}}
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" defaultChecked />}
                            label="Remember me"
                            name="remember"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="/forgotpassword" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}