import userService from '../services/userService';

let handleLogin = async(req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if(!email || !password) {
        return res.status(500).json({
            errCode : 1,
            message: 'Missing input information',
        })
    }

    //hứng userData từ bên userService ném qua (hứng thì phải ở controller)
    let userData = await userService.handleUserLogin(email, password)
    return res.status(200).json({
        errCode : userData.errCode,
        message : userData.errMessage,
        user: userData.user ? userData.user : {},
    })
    
    

}

let handleGetAllUsers = async (req, res) => {
    let id = req.query.id; //ALL, id (lấy tất cả or chỉ lấyv 1 người có id tương ứng thôi)
    if(!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'missing required params',
            users :[]
        })
    }
    let users = await userService.getAllUsers(id);
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        users
    })
}

let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);
    console.log(message);
    return res.status(200).json(message);
}
let handleEditUser = async (req, res) => {
    let message = await userService.updateUserData(req.body);
    return res.status(200).json(message);
}

let handleDeleteUser = async (req, res) => {
    if(!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required params!',
        })
    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
}
let getAllCode = async (req, res) => {
    try {
         let data = await userService.getAllCodeService(req.query.type);
         return res.status(200).json(data)
        
    } catch (e) {
        console.log('getall code err', e );
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
    

}
module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,

    getAllCode: getAllCode,
}
