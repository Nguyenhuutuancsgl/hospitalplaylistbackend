import db from '../models/index';

import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);

let createNewUser = async (data) => {
    return new Promise( async(resolve, reject) =>{
        try {
            // check email đã có trùng chưa
            // let check = await checkUserEmail(data.email);
            // if(check === true ) {
            //     resolve({
            //         errCode: 0,
            //         message: 'Your email is already exist in use, pls try another one'
            //     });
            // }
            // hàm createNewUser sử dụng await để đợi kết quả của hàm hashUserPassword trước khi tiếp tục thực thi lệnh db.User.create(). Điều này đảm bảo rằng password được truyền vào khi tạo người dùng đã được mã hóa từ data.password thông qua hàm hashUserPassword. Sử dụng await cho phép đảm bảo rằng quá trình mã hóa mật khẩu đã hoàn tất trước khi tạo người dùng mới, tránh việc lưu mật khẩu chưa được mã hóa vào cơ sở dữ liệu.
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

            })
            resolve('ok đã tạo');
        } catch (e) {
            reject(e);
            
        }
    });
}
// createNewUser ở trên bị lồng nhau, chờ nh au, hell quá nên phải sử lí cách khác => promise chain á
//Dưới đây là một phiên bản của hàm createNewUser sử dụng Promise chaining để tránh callback hell và promise hell:

// javascript
// Copy code
// let createNewUser = (data) => {
//     return hashUserPassword(data.password)
//         .then((hashPasswordFromBcrypt) => {
//             return db.User.create({ 
//                 // Các thông tin về người dùng
//                 password: hashPasswordFromBcrypt
//             });
//         })
//         .then((createdUser) => {
//             // Thêm logic xử lý sau khi tạo người dùng thành công (nếu cần)
//             return createdUser;
//         })
//         .catch((error) => {
//             // Xử lý lỗi nếu có
//             throw error;
//         });
// };
// Trong phiên bản này, chúng ta sử dụng then để liên kết các Promise và xử lý kết quả tuần tự. Điều này giúp tránh callback hell và promise hell và làm cho mã trở nên dễ đọc hơn.

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
// let deleteUserById = ()=>{
//     return new Promise( async(resolve, reject) =>{
//         try {
            
//         } catch (e) {
//             reject(e);
            
//         }
//     })
// }
let getAllUser = () => {
    return new Promise( async(resolve, reject) =>{
        try {
            let users = await db.User.findAll({raw:true});
            resolve(users);
        } catch (e) {
            reject(e);
            
        }
    })
}
 
let getUserInforById = (userId)=>{
        return new Promise( async(resolve, reject) =>{
            try {
                let user = await db.User.findOne({where:{id:userId}, raw:true});
                if (user) {
                    resolve(user)
                } else {
                    resolve({})
                }
            } catch (e) {
                reject(e);
            }
        })
    }
    

let updateUserData = (data)=>{
    return new Promise( async(resolve, reject) =>{
        try {
            let user = await db.User.findOne({where:{id:data.id}, 
                raw: false,})
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;

                await user.save();
                let allUsers = await db.User.findAll();
                resolve(allUsers);

            }else {
                resolve();
            }
            
        } catch (e) {
            reject(e);
            
        }
    })
}

let deleteUserById = (userId)=>{
    return new Promise( async(resolve, reject) =>{
        try {
            let user = await db.User.findOne({where:{id:userId},
                 });
            if (user) {
                await user.destroy();
            }
            resolve(); //giống return thôi
        } catch (e) {
            reject(e);
            
        }
    })
}

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
    getUserInforById: getUserInforById,
    updateUserData: updateUserData,
    deleteUserById: deleteUserById,
}