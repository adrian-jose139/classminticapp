
import { Link } from "react-router-dom";

function ForgotPage(){
    return(
        <div>
            <h1>OLVIDE LA CONTRASEÑA</h1>
            <Link to="/">
            <button>VOLVER AL LOGIN</button>
            </Link>
        </div>
    );
}


export default ForgotPage;