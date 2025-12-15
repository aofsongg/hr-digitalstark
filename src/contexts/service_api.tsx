  import React, { createContext, useContext, useState, useEffect } from 'react';
//import { supabase } from '@/integrations/supabase/client';
import{supabase} from '../lib/supabaseClient';
import type { UserInfo } from '@/types/hr';


export const getMonthNameEn =(monthNumber) =>{
  console.log(monthNumber);
  const months = [
    null, // ช่องที่ 0 ไม่ใช้ จะได้เรียกด้วยเลขเดือนตรง ๆ
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  // ถ้าไม่อยู่ในช่วง 1–12 ให้คืนค่า null หรือจะโยน error ก็ได้
  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  return months[monthNumber];
}


export const send_email = async (to,NAME,TRANSFER_DATE:Date,pdfBase64,Remark) => {
  console.log(TRANSFER_DATE.getMonth());
  var date_str = getMonthNameEn(TRANSFER_DATE.getMonth()+1) +' ' +TRANSFER_DATE.getFullYear().toString();

    console.log(date_str,to);
    var text_str = "<b>Dear "+NAME+",</b><br/>";
    if(Remark.length>0){
     text_str += "<br/> Remark: "+ Remark 
    }
    text_str += "<br/> The payslip for "+ date_str +" is attached below."
    // jf@digitalstark.co
  await fetch("/api/send-mail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: to,
      cc:"nook@digitalstark.co, aofsong1478@gmail.com",
      subject: "[Salary Payroll] " + date_str,
      text: text_str,
      fileBase64: pdfBase64
    }),
  });
};
// export const send_email2 = (pdfBase64) => {
    
//   const context = send_email_old;
//   console.log(context);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

function convertToBase64(pdfFile: any) {
    throw new Error('Function not implemented.');
}
