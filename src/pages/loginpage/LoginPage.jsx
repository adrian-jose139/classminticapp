
import { Link } from "react-router-dom";
import React from "react";
import { useState } from "react";
import ForgotPage from "./ForgotPage/ForgotPage";
import RegisterPage from "./RegisterPage/RegisterPage";
import HooksGral from "../../playground/HooksGral";

function LoginPage(){
    return(
        <div>
            <h1>HOME</h1>
            <Link to=" /register">
            <button>IR A REGISTRO</button>
            </Link>
            <Link to=" /forgot">
            <button>OLVIDE MI CONTRASEÑA</button>
            </Link>
            <Link to="/Hooks">
                <button>IR A HOOKS</button>
            </Link>
        </div>
    );
}

export default LoginPage;