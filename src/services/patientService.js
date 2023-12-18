import db from "../models/index";
require('dotenv').config();
import emailService from './emailService';

let postBookAppointment = (data)=>{
    return new Promise(async(resolve, reject)=>{
        try {
           if (!data.doctorId || !data.email || !data.timeType|| !data.date|| !data.fullName) {
               resolve({
                   errCode:1,
                   errMessage:'Missing required params'
               })
           } else {
                await emailService.sendSimpleEmail({
                    reciverEmail:data.email,
                    patientName:data.fullName,
                    time:data.timeString,
                    doctorName:data.doctorName,
                    language:data.language,
                    redirectLink:''
                })
                let user = await db.User.findOrCreate({
                    where:{email:data.email},
                    defaults:{
                        mail:data.email,
                        roleId:'R3'
                    },
                })
                console.log('tkstrand user',user[0]);
                if (user&&user[0]) {
                    await db.Booking.findOrCreate({
                        where:{patientId:user[0].id},
                        defaults:{
                            statusId:'S1',
                            doctorId:data.doctorId,
                            patientId:user[0].id,
                            date:data.date,
                            timeType:data.timeType
                        }
                    })
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
module.exports={
    postBookAppointment:postBookAppointment,
}