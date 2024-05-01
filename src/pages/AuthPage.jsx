//rafce - Short form to create component

import { useRecoilValue } from "recoil";
import Login from "../components/Login"
import Signup from "../components/Signup"
import authScreenAtom from './../atoms/authAtom';

const AuthPage = () => {
    const authScreenState = useRecoilValue(authScreenAtom);//kind of like useState
    // useSetRecoilState(authScreenState)
    // console.log(authScreenState)
    return (
        <>
            {authScreenState === "login" ? <Login /> : <Signup />}
        </>
    )
}

export default AuthPage
