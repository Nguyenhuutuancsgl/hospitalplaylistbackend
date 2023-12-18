import db from '../models/index';
require('dotenv').config();
import _ from 'lodash';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
let getTopDoctorHome = (limitInput) =>{
    return new Promise(async(resolve, reject)=>{
        try {
            let users = await db.User.findAll({
                limit:limitInput,
                where :{roleId: 'R2' },
                order:[['createdAt', 'DESC']],
                include: [
                    {model:db.Allcode, as:'positionData', attributes:['valueEn','valueVi']},
                    {model:db.Allcode, as:'genderData', attributes:['valueEn','valueVi']},
                ],
                raw:true,
                nest:true
            })
            resolve({
                errCode:0,
                data:users
            })
        } catch (e) {
            reject(e);
        }
    })
}
let getAllExitingDoctors = ()=>{
    return new Promise(async(resolve, reject)=>{
        try {
            let doctors = await db.User.findAll({ raw:true, attributes: {
                exclude:['password','image']
            },
                where: {roleId:'R2'}})
            resolve({
                errCode:0,
                data:doctors
            })
        } catch (e) {
            reject(e)
        }
    })
}
 let saveDetailInforDoctor = (inputData)=>{
     return new Promise(async(resolve, reject)=>{
         try {
            if (!inputData.doctorId || !inputData.contentHTML
                 || !inputData.contentMarkdown|| !inputData.action
                 || !inputData.selectedPrice || !inputData.selectedPayment 
                 || !inputData.selectedProvince || !inputData.nameClinic 
                 || !inputData.addressClinic || !inputData.note  ) {
                resolve({
                    errCode:1,
                    errMessage:'Missing params'
                })
            } else {
                // to markdown
                if (inputData.action==='CREATE'){
                    await db.Markdown.create({
                        contentHTML:inputData.contentHTML,
                        contentMarkdown:inputData.contentMarkdown,
                        description:inputData.description,
                        doctorId:inputData.doctorId
                    })
                }else if (inputData.action==='EDIT'){
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: {doctorId: inputData.doctorId},raw: false
                    })
                    if(doctorMarkdown){
                        doctorMarkdown.contentHTML=inputData.contentHTML,
                        doctorMarkdown.contentMarkdown=inputData.contentMarkdown,
                        doctorMarkdown.description=inputData.description,
                        doctorMarkdown.updateAt = new Date();
                        await doctorMarkdown.save()
                    }
                }
                //to doctor infor table
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where:{
                        doctorId:inputData.doctorId,
                    },
                    raw:true
                })
                if (doctorInfor) {
                    //update stuff
                    doctorInfor.doctorId=inputData.doctorId;
                    doctorInfor.priceId=inputData.selectedPrice;
                    doctorInfor.provinceId=inputData.selectedProvince;
                    doctorInfor.paymentId=inputData.selectedPayment;
                    doctorInfor.nameClinic=inputData.nameClinic;
                    doctorInfor.addressClinic=inputData.addressClinic;
                    doctorInfor.note=inputData.note;
                    await doctorInfor.save()
                    
                } else {
                    //create stuff
                    await db.Doctor_Infor.create({
                    doctorId:inputData.doctorId,
                    priceId:inputData.selectedPrice,
                    provinceId:inputData.selectedProvince,
                    paymentId:inputData.selectedPayment,
                    nameClinic:inputData.nameClinic,
                    addressClinic:inputData.addressClinic,
                    note:inputData.note,
                    })
                }
                resolve({
                    errCode:0,
                    errMessage:'Save dr info successfully'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getDetailDoctorById = (inputId) =>{
    return new Promise(async(resolve, reject)=>{
        try {
            if (!inputId) {
                resolve({
                    errCode:1,
                    errMessage:'Missing required parameters'
                })
            } else {
                let data = await db.User.findOne({
                    where : {
                        id:inputId
                    },
                    attributes: {
                        exclude:['password']
                    },
                    include: [
                        {model:db.Markdown, attributes:['description','contentHTML','contentMarkdown']},
                        {model:db.Allcode, as:'positionData', attributes:['valueEn','valueVi']},
                        {model:db.Doctor_Infor,
                            attributes: {
                            exclude:['id', 'doctorId']
                        },
                        include: [
                            {model:db.Allcode, as:'priceTypeData', attributes:['valueEn','valueVi']},
                            {model:db.Allcode, as:'provinceTypeData', attributes:['valueEn','valueVi']},
                            {model:db.Allcode, as:'paymentTypeData', attributes:['valueEn','valueVi']},
                        ], },
                    ],
                    raw:false,
                    nest:true
                })
                if(data&&data.image){
                    data.image= new Buffer(data.image,'base64').toString('binary');
                }
                if(!data) data={};
            resolve({
                errCode:0,
                data:data
            })
        }
        } catch (e) {
            reject(e);
        }
    })
}
let bulkCreateSchedule = (data)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            console.log('tui check data', data);
           if (!data.doctorId || !data.arrSchedule || !data.formatedDate) {
               resolve({
                   errCode:1,
                   errMessage:'Missing required params'
               })
           } else {
            let schedule = data.arrSchedule;
               if (schedule && schedule.length>0){
                schedule = schedule.map(item=>{
                    item.maxNumber = MAX_NUMBER_SCHEDULE;
                    return item;
                })
               }
               //get it all existing datta
               let existing = await db.Schedule.findAll(
                {
                    where: {doctorId: data.doctorId, date: data.formatedDate},
                    attributes:['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw:true
                });
                //sosanh
                let  toCreate = _.differenceWith(schedule,existing, (a,b)=>{
                    return a.timeType === b.timeType && +a.date=== +b.date;
                });
                //tạo data
                if(toCreate&&toCreate.length>0) {
                    await db.Schedule.bulkCreate(toCreate);
                }
               resolve({
                   errCode:0,
                   errMessage:'Save dr plans successfully'
               })
           }
       } catch (e) {
           reject(e)
       }
   })
}
let getScheduleByDate = (doctorId, date) =>{
    return new Promise(async(resolve, reject)=>{
        try {
            if (!doctorId||!date) {
                resolve({
                    errCode:1,
                   errMessage:'Missing sth params'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where : {doctorId:doctorId, date: date},
                    include: [
                        {model: db.Allcode, as:'timeTypeData', attributes:['valueEn','valueVi']},
                        {model: db.User, as:'doctorData', attributes:['firstName','lastName']},
                    ],
                    raw:false,
                    nest:true
                })
                if (!dataSchedule) dataSchedule =[];
                resolve({
                    errCode:0,
                    data:dataSchedule
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getExtraInforDoctorById = (idInput) =>{
    return new Promise(async(resolve, reject)=>{
        try {
            if (!idInput) {
                resolve({
                    errCode:1,
                    errMessage:'Missing required parameters'
                })
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where : {
                        doctorId:idInput
                    },
                    attributes: {
                        exclude:['id','doctorId']
                    },
                    include: [
                        {model:db.Allcode, as:'priceTypeData', attributes:['valueEn','valueVi']},
                        {model:db.Allcode, as:'provinceTypeData', attributes:['valueEn','valueVi']},
                        {model:db.Allcode, as:'paymentTypeData', attributes:['valueEn','valueVi']},
                    ],
                    raw:false,
                    nest:true
                })
                if(!data) data={};
            resolve({
                errCode:0,
                data:data
            })
        }
        } catch (e) {
            reject(e);
        }
    })
}
let getProfileDoctorById = (inputId) =>{
    return new Promise(async(resolve, reject)=>{
        try {
            if (!inputId) {
                resolve({
                    errCode:1,
                   errMessage:'Missing sth params'
                })
            } else {
                let data = await db.User.findOne({
                    where : {id:inputId},
                    attributes:{exclude:['password']},
                    include: [
                        {model:db.Markdown, attributes:['description','contentHTML','contentMarkdown']},
                        {model:db.Allcode, as:'positionData', attributes:['valueEn','valueVi']},
                        {model:db.Doctor_Infor,
                            attributes: {
                            exclude:['id', 'doctorId']
                        },
                        include: [
                            {model:db.Allcode, as:'priceTypeData', attributes:['valueEn','valueVi']},
                            {model:db.Allcode, as:'provinceTypeData', attributes:['valueEn','valueVi']},
                            {model:db.Allcode, as:'paymentTypeData', attributes:['valueEn','valueVi']},
                        ], },
                    ],
                    raw:false,
                    nest:true
                })
                if(data&&data.image){
                    data.image= new Buffer(data.image,'base64').toString('binary');
                }
                if(!data) data={};
                resolve({
                    errCode:0,
                    data:data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    getTopDoctorHome:getTopDoctorHome,
    getAllExitingDoctors:getAllExitingDoctors,
    saveDetailInforDoctor:saveDetailInforDoctor,
    getDetailDoctorById:getDetailDoctorById,
    bulkCreateSchedule:bulkCreateSchedule,
    getScheduleByDate:getScheduleByDate,
    getExtraInforDoctorById:getExtraInforDoctorById,
    getProfileDoctorById: getProfileDoctorById
}