import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    // eslint-disable-next-line
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    })
    res.cookie("jwt", token, {
        httpOnly: true,//more secure
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
        sameSite: "strict", //CSRF(more protective)
    })
    return token;
}

export default generateTokenAndSetCookie;