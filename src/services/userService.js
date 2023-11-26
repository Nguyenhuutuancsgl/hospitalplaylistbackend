import db from '../models/index';
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise( async(resolve, reject) =>{
        try {
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}
let handleUserLogin = (email, password) => {
    return new Promise( async(resolve, reject) =>{
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);
            if (isExist) {
                //dù đã check ở trên nhưng phải check lại 1 lần nữa phòng TH có ng vừa xóa
                let user = await db.User.findOne({
                    where:{email : email},
                    attributes:  ['email', 'roleId', 'password', 'firstName', 'lastName'], raw: true
                
                })
                if (user) {
                     //sosanh password bang thu viện đã có làm sẵn r compareSync() -> trả ra true/false
                    let check = await bcrypt.compareSync( password, user.password )
                    if(check) {
                    userData.errCode = 0; //sosanh thanh cong
                    userData.errMessage = 'OK';
                    delete user.password;
                    userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';

                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `This user isn't ever exist in our system, so please try other emails`
                }

            } else {
                userData.errCode = 1;
                userData.errMessage = `Your email isn't ever exist in our system, so please try other emails`
            }
            resolve(userData) //giống return, chỉ dùng 1 lần lúc cuối ni khi mà đã gán gtri cho object userData thành công 

        } catch (e) {
            reject(e);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise( async(resolve, reject) =>{
        try {
            let user = await db.User.findOne({
                where:{email : userEmail}, raw: true
            })

            console.log(user);

            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e);
        }
    })
}


let getAllUsers = (userId) => {
    return new Promise( async(resolve, reject) =>{
        try {
            let users = '';
            if (userId === 'ALL'){
                users = await db.User.findAll({ 
                    attributes :{
                        exclude: ['password']
                    }, raw:true
                })
            }
            if ( userId && userId !== 'ALL'){
                users = await db.User.findOne({
                     where: { id: userId }, 
                     attributes :{
                    exclude: ['password']
                    }, raw:true
                });
            }
            resolve(users);
        } catch (e) {
            reject(e);
        }
    })
}
let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if email already exists
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already exist in use, please try another one'
                });
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender ,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image:data.avatar
                });
                resolve({
                    errCode: 0,
                    errMessage: 'User created successfully'
                });
            }
        } catch (e) {
            reject(e);
        }
    });
}
let deleteUser = (userId)=>{
    return new Promise( async(resolve, reject) =>{
        try {
            let user = await db.User.findOne({where:{id:userId},
                raw: true, });
            if(!user) {
                return res.status(200).json({
                    errCode: 2,
                    errMessage: `This user isn't exist`,
                })
            }
            await db.User.destroy({where:{id:userId},
                 });
            
            resolve({
                errCode: 0,
                errMessage: `This user was destroyed`,
            }); //giống return thôi
        } catch (e) {
            reject(e);
            
        }
    })
}
let updateUserData = (data)=>{
    return new Promise( async(resolve, reject) =>{
        try {
            if(!data.id ||!data.roleId ||!data.positionId ||!data.gender ) {
                resolve({
                    errCode: 2,
                    errMessage: `Missing required params`,
                })
            }
            let user = await db.User.findOne({where:{id:data.id}, raw:false
                 })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                if (data.avatar) {
                    user.image= data.avatar;
                }

                await user.save();

                resolve({
                    errCode: 0,
                    errMessage: `This user was updated successfully`,
                });

            }else {
                resolve({
                    errCode: 1,
                    errMessage: `This user was not found`,
                });
            }
            
        } catch (e) {
            reject(e);
            
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise( async(resolve, reject) =>{
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: `missing required params`,
                })
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({ raw:true,
                where: {type : typeInput}
                    })
                res.errCode = 0;
                res.data = allcode;
                 resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    handleUserLogin: handleUserLogin,
    checkUserEmail: checkUserEmail,

    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,

    getAllCodeService: getAllCodeService
}
