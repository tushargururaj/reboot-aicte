import bcrypt from 'bcrypt';

export const encryptPassword = async function (password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(password, salt);
        console.log('password Hashed!');
        return passwordHashed;
    } catch (err) {
        console.log('error hashing your password!');
        throw err;
    }
};

export const comparePassword = async function (password, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (err) {
        console.log('error comparing your password!');
        throw err;
    }
};

export default { encryptPassword, comparePassword };