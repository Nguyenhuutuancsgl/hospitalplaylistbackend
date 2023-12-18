require('dotenv').config();
import nodemailer from 'nodemailer';

let sendSimpleEmail = async(dataSend)=>{
    let transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        auth:{
            user:process.env.EMAIL_APP,
            pass:process.env.EMAIL_APP_PASSWORD,
        } })
}
let info = await transporter.sendMail({
    from:'Tuna <tuan.hanaslexis@gmail.com>',
    to:dataSend.reciverEmail,
    subject:'Thông tin đặt lịch khám bệnh',
    html:getBodyHTMLEmail(dataSend),
});
let getBodyHTMLEmail = (dataSend)=>{
    let result=``
    if (dataSend.language ==='vi') {
        result = `
        <h3>Xin chào ${dataSend.patientName}!</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online tại HOSPITAL PLAYLIST</p>
        <p>Thông tin đặt lịch khám bệnh:</p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ : ${dataSend.doctorName}</b></div>
    
        <p>Nếu các thông tin trên hoàn toàn chính xác, vui lòng ấn vào đường dẫn liên kết bên dưới để xác 
            nhận và hoàn tất thủ tục đặt lịch khám bệnh. 
        </p>
        <div>
            <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>
        <div>Xin chân thành cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</div>
        `
    }
    if (dataSend.language ==='en') {
        result = `
        <h3>Dear ${dataSend.patientName}!</h3>
        <p>You've received this email due to your booking at HOSPITAL PLAYLIST</p>
        <p>Information for your appointment:</p>
        <div><b>Time: ${dataSend.time}</b></div>
        <div><b>Doctor : ${dataSend.doctorName}</b></div>
    
        <p>If the above information is correct, please click on the link below to confirm your schedule. 
        </p>
        <div>
            <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>
        <div>Thanks for using our website's services.</div>
        `
    }
    return result;
}
module.exports = {
    sendSimpleEmail:sendSimpleEmail
}