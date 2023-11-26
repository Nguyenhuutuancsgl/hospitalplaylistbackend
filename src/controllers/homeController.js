import db from '../models/index';
import CRUDService from '../services/CRUDService';


let getHomePage = async(req, res) => {
    try {
        let data = await db.User.findAll();
        

        return res.render('homepage.ejs',{
            data: JSON.stringify(data)
        });
    } catch (error) {
        console.log(error);
    }
    

}

let getCRUD = (req, res) => {
    return res.render('crud.ejs')
}
let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    return res.render('crud.ejs')
}
let displayGetCRUD = async (req, res) => {

    let data = await CRUDService.getAllUser();
    return res.render('displayCRUD.ejs',{
        dataTable: data
    })
}
let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if(userId) {
        let userData = await CRUDService.getUserInforById(userId);
        //check user data

        
        return res.render('editCRUD.ejs',{
            user: userData,
        })
    }
    else {
        return res.send(' 0000 tìm thấy user.ejs')

    }

    
}

let putCRUD = async (req, res) => {
    let allUsers = await CRUDService.updateUserData(req.body);
    return res.render('displayCRUD.ejs',{
        dataTable: allUsers
    })
}


let deleteCRUD = async (req, res) => {
    let userId = req.query.id;
    if(userId) {
        await CRUDService.deleteUserById(userId);
        return res.send('displayCRUDiooj',)

        // let userData = await CRUDService.deleteUserById(userId);
        // return res.render('displayCRUD.ejs',)
    }  
    else {
        return res.send(' 0000 tìm thấy user.ejs')

    }
        
}
module.exports = {
    getHomePage: getHomePage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
}
