import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
import{supabase} from '../lib/supabaseClient';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2, DollarSign, CalendarIcon, FileText, Mail } from 'lucide-react';
import { format, formatDate } from 'date-fns';
import { cn } from '@/lib/utils';
import type { SalaryDetail, Employee } from '@/types/hr';
import { COMPANIES } from '@/types/hr';
import jsPDF from 'jspdf';
import '../fonts/THSarabunNew-normal.js';
import autoTable from 'jspdf-autotable';
// import fontData from './fonts/THSarabunNew.ttf';
import emailjs from 'emailjs-com';
import { send_email } from '@/contexts/service_api';
import { useAuth } from '@/contexts/AuthContext';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function SalaryPayment() {
  const [salaries, setSalaries] = useState<SalaryDetail[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredSalaries, setFilteredSalaries] = useState<SalaryDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<SalaryDetail | null>(null);
  const [previewSalary, setPreviewSalary] = useState<SalaryDetail | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({ EMP_ID: '', COMPANY_NM: '', EMP_NAME: '', EMP_LNAME: '', NICK_NAME: '',TOTAL_SALARY:0, BASE_SALARY: 0, OT_TIME: 0, OT_AMT: 0, ALLOWANCE_AMT: 0, BONUS_AMT: 0, SSO_AMT: 0, WHT_AMT: 0, STUDENT_LOAN: 0, DEDUCTION: 0,DEDUCTION_REMARK:'OTHER', NET_PAYMENT: 0, TRANSFER_DATE: null as Date | null, BANK_NAME: '', BANK_ACC_NUMBER: '', BANK_ACC_NAME: '', DEPARTMENT_NM: '', EMAIL: '' ,REMARK:''});
  const { toast } = useToast();
  const [pdfBase64, setPdfBase64] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    const [salaryRes, empRes] = await Promise.all([supabase.from('SALARY_DETAIL').select('*').order('CREATE_DATE', { ascending: false }), supabase.from('EMPLOYEE').select('*').order('EMP_NAME')]);
  const { data, error } = await supabase
    .from('SALARY_DETAIL')
    .select('*,EMPLOYEE(*)')
    .order('CREATE_DATE', { ascending: false });
    console.log(salaryRes,empRes);
    if (salaryRes.error || empRes.error) toast({ variant: 'destructive', title: 'Error' });
    else { setSalaries(data as SalaryDetail[]); setFilteredSalaries(data as SalaryDetail[]); setEmployees(empRes.data as Employee[]); }
    setIsLoading(false);
  };
  

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { const term = searchTerm.toLowerCase(); setFilteredSalaries(salaries.filter(s => (s.EMPLOYEE.COMPANY_NM?.toLowerCase() || '').includes(term) || (s.EMP_NAME?.toLowerCase() || '').includes(term) || (s.EMP_LNAME?.toLowerCase() || '').includes(term)|| (s.TRANSFER_DATE?.toLowerCase() || '').includes(term))); }, [searchTerm, salaries]);
  useEffect(() => { if (selectedCompany) setFilteredEmployees(employees.filter(e => e.COMPANY_NM === selectedCompany)); else setFilteredEmployees([]); }, [selectedCompany, employees]);
  useEffect(() => { const income = formData.BASE_SALARY + formData.OT_AMT + formData.ALLOWANCE_AMT + formData.BONUS_AMT; const ded = formData.SSO_AMT + formData.WHT_AMT + formData.STUDENT_LOAN + formData.DEDUCTION; setFormData(p => ({ ...p, NET_PAYMENT: income - ded })); }, [formData.BASE_SALARY, formData.OT_AMT, formData.ALLOWANCE_AMT, formData.BONUS_AMT, formData.SSO_AMT, formData.WHT_AMT, formData.STUDENT_LOAN, formData.DEDUCTION]);

  
  const handleEmployeeSelect = (empId: string) => {
 const emp = employees.find(e => e.EMP_ID === empId);
  var cal_sos =0;
  if(emp){
    if(emp.BASE_SALARY <= 1650){
      cal_sos = 83;
    }else if(emp.BASE_SALARY >= 15000){
      cal_sos = 750;
    }else{
      cal_sos = (emp.BASE_SALARY*0.05);
    } 
  }
  var base_salary = emp.BASE_SALARY <= 15000 ? emp.BASE_SALARY  : 15000;
  var Allowance = emp.BASE_SALARY <= 15000 ? 0  : emp.BASE_SALARY -15000;
 if (emp) setFormData(p => ({ ...p, EMP_ID: emp.EMP_ID, COMPANY_NM: emp.COMPANY_NM, EMP_NAME: emp.EMP_NAME, EMP_LNAME: emp.EMP_LNAME,
   NICK_NAME: emp.NICK_NAME || '', TOTAL_SALARY: emp.BASE_SALARY, BASE_SALARY: base_salary, SSO_AMT: cal_sos,ALLOWANCE_AMT:Allowance, BANK_NAME: emp.BANK_NAME || '', BANK_ACC_NUMBER: emp.BANK_ACC_NUMBER || '',
    BANK_ACC_NAME: emp.BANK_ACC_NAME || '', DEPARTMENT_NM: emp.DEPARTMENT_NM || '', EMAIL: emp.EMAIL })); };

  const onChange_Cal_SOS = (amt: number) =>{
      var cal_sos =0;
    if(amt <= 1650){
      cal_sos = 83;
    }else if(amt >= 15000){
      cal_sos = 750;
    }else{
      cal_sos = (amt*0.05);
    }
    return cal_sos;
   setFormData({...formData, SSO_AMT: cal_sos ||0});
  }

  const onChange_OT = (ot_time:number,base_salary:number)=>{
    var cal_ot = Math.round((base_salary/30/8)*ot_time*2);
       return cal_ot;
  }

  const handleOpenDialog = async (salary?: SalaryDetail) => {
    console.log(salary);
      if (salary) { 
    const  { data, error } = await supabase.rpc('get_salary_with_emp_obj', {
    p_ida : salary.IDA
    });
    console.log(data,error)
      setEditingSalary(salary);
       setFormData(data[0]);
         setSelectedCompany(data[0].COMPANY_NM);
      //  setSelectedCompany(salary.COMPANY_NM || '');
      // setFormData({ EMP_ID: camelObj.EMP_ID, COMPANY_NM: camelObj.COMPANY_NM || '', EMP_NAME: camelObj.EMP_NAME || '', EMP_LNAME: camelObj.EMP_LNAME || '', NICK_NAME: camelObj.NICK_NAME || '', BASE_SALARY: camelObj.BASE_SALARY, OT_TIME: camelObj.OT_TIME, OT_AMT: camelObj.OT_AMT, ALLOWANCE_AMT: camelObj.ALLOWANCE_AMT, BONUS_AMT: camelObj.BONUS_AMT, SSO_AMT: camelObj.SSO_AMT, WHT_AMT: camelObj.WHT_AMT, STUDENT_LOAN: camelObj.STUDENT_LOAN, DEDUCTION: camelObj.DEDUCTION, NET_PAYMENT: camelObj.NET_PAYMENT, TRANSFER_DATE: camelObj.TRANSFER_DATE ? new Date(camelObj.TRANSFER_DATE) : null, BANK_NAME: camelObj.BANK_NAME || '', BANK_ACC_NUMBER: camelObj.BANK_ACC_NUMBER || '', BANK_ACC_NAME: camelObj.BANK_ACC_NAME || '', DEPARTMENT_NM: camelObj.DEPARTMENT_NM || '', EMAIL: camelObj.EMAIL || '' }); 
         console.log(setFormData);}
      else { setEditingSalary(null); setSelectedCompany(''); setFormData({ EMP_ID: '', COMPANY_NM: '', EMP_NAME: '', EMP_LNAME: '', NICK_NAME: '',TOTAL_SALARY:0.00, BASE_SALARY: 0.00, OT_TIME: 0.00, OT_AMT: 0.00, ALLOWANCE_AMT: 0.00, BONUS_AMT: 0.00, SSO_AMT: 0.00, WHT_AMT: 0.00, STUDENT_LOAN: 0.00, DEDUCTION: 0.00,DEDUCTION_REMARK:'OTHER', NET_PAYMENT: 0.00, TRANSFER_DATE: null, BANK_NAME: '', BANK_ACC_NUMBER: '', BANK_ACC_NAME: '', DEPARTMENT_NM: '', EMAIL: '',REMARK:'' }); }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.EMP_ID || !formData.COMPANY_NM) { toast({ variant: 'destructive', title: 'Error', description: 'Please select a company and an employee.' }); return; }
    
    const dataToSave = { ...formData, TRANSFER_DATE: formData.TRANSFER_DATE ? format(formData.TRANSFER_DATE, 'yyyy-MM-dd') : null };
    delete dataToSave.COMPANY_NM;
    delete dataToSave.DEPARTMENT_NM;
    dataToSave.EMP_NAME = dataToSave.EMP_NAME + ' ' + dataToSave.EMP_LNAME;
    delete dataToSave.EMP_LNAME;
    delete dataToSave.EMAIL;
    delete dataToSave.NICK_NAME;
    delete dataToSave.BANK_NAME;
    delete dataToSave.BANK_ACC_NUMBER;
    delete dataToSave.BANK_ACC_NAME;
    delete dataToSave.TOTAL_SALARY;
    if (editingSalary) { const { error } = await supabase.from('SALARY_DETAIL').update(dataToSave).eq('IDA', editingSalary.IDA);   console.log(error);if (error) toast({ variant: 'destructive', title: 'Error' }); else { toast({ title: 'Successful.' }); setIsDialogOpen(false); fetchData(); } }
    else { const { error } = await supabase.from('SALARY_DETAIL').insert([dataToSave]);console.log(error); if (error) toast({ variant: 'destructive', title: 'Error' }); else { toast({ title: 'Successful.' }); setIsDialogOpen(false); fetchData(); } }

  };

  const handleDelete = async (IDA: string) => { if (!confirm('Do you want to delete the data?')) return; const { error } = await supabase.from('SALARY_DETAIL').delete().eq('IDA', IDA); if (error) toast({ variant: 'destructive', title: 'Error' }); else { toast({ title: 'Deleted successfully.' }); fetchData(); } };
  const formatCurrency = (amt: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amt);
  const handlePreview = (s: SalaryDetail) => { setPreviewSalary(s); setIsPreviewOpen(true); };


  const handleSendEMAIL = () => {

console.log(previewSalary.EMPLOYEE.EMAIL,new Date(previewSalary.TRANSFER_DATE));

     console.log(send_email(previewSalary.EMPLOYEE.EMAIL,previewSalary.EMPLOYEE.EMP_NAME +' ' + previewSalary.EMPLOYEE.EMP_LNAME,new Date(previewSalary.TRANSFER_DATE),generatePDF('SEND_MAIL')));
    // emailjs.send(
    //   'YOUR_SERVICE_ID',
    //   'YOUR_TEMPLATE_ID',
    //   {
    //     from_name: name,
    //     reply_to: email,
    //     message: msg,
    //   },
    //   'YOUR_PUBLIC_KEY'
    // )
    // .then(() => setResult('ส่งอีเมลSuccessful. ✅'))
    // .catch(() => setResult('ส่งอีเมลไม่Successful. ❌'));
    
    toast({ title: 'EMAIL Sent', description: `Sent to ${previewSalary?.EMPLOYEE.EMAIL}` }); };

// ถ้ามีอยู่แล้วใช้ของเดิมได้เลย
const thaiMoneyText = (num: number) => {
  const thNum = ["ศูนย์","หนึ่ง","สอง","สาม","สี่","ห้า","หก","เจ็ด","แปด","เก้า"];
  const thDigit = ["","สิบ","ร้อย","พัน","หมื่น","แสน","ล้าน"];

  const readNumber = (n: number): string => {
    let text = "";
    let unit = 0;

    while (n > 0) {
      const digit = n % 10;
      if (digit !== 0) {
        text = thNum[digit] + thDigit[unit] + text;
      }
      unit++;
      n = Math.floor(n / 10);
    }

    return text === "" ? thNum[0] : text;
  };

  const integer = Math.floor(num);
  const satang = Math.round((num - integer) * 100);

  let result = readNumber(integer) + "Baht";

  if (satang === 0) {
    result += "ถ้วน";
  } else {
    result += readNumber(satang) + "สตางค์";
  }

  return result;
};
const generatePDF = (type_p:String) => {
   if (!previewSalary) return;

  const doc = new jsPDF('p', 'mm', 'a4');
  // บอก jsPDF ว่ามีฟอนต์นี้

  

// doc.addFileToVFS('THSarabunNew.ttf', fontData as any);
// doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
  const pageWidth = doc.internal.pageSize.getWidth();

  const marginX = 10;
  const left = marginX;
  const right = pageWidth - marginX;
  const width = right - left;

  let y = 10;

  const formatCurrency = (n?: number) =>
    (n ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ===== กรอบใหญ่ =====
  doc.rect(left, y, width, 260);

  // ===== Header: BALIOS | PAY SLIP | CONFIDENTIAL =====
  const headerH = 25;
  const col1W = width * 0.5;
  const col2W = width * 0.25;
  const col3W = width * 0.25;

  // กรอบ 3 ช่อง
  doc.rect(left, y, col1W, headerH);
  doc.rect(left + col1W, y, col2W, headerH);
  doc.rect(left + col1W + col2W, y, col3W, headerH);

  // BALIOS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(previewSalary.EMPLOYEE.COMPANY_NM, left + 4, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    'No. 4 Soi Sukhumvit 29 (Lakket) Khlong Toei Nua, Watthana,',
    left + 4,
    y += 17
  );
  doc.text(
    'Bangkok 10110. TEL. 02 001 0790',
    left + 4,
    y + 4
  );
  doc.setFont('helvetica', 'bold');
  if(previewSalary.EMPLOYEE.COMPANY_NM =='BALIOS'){
    doc.text('TAX ID 0105554096858', left + 4, y + 15);
  }else if(previewSalary.EMPLOYEE.COMPANY_NM =='IMAGINE WHALES'){
    doc.text('TAX ID 0105563005665', left + 4, y + 15);
  }else if(previewSalary.EMPLOYEE.COMPANY_NM =='DIAMOND HUNTERS'){
    doc.text('TAX ID 0105559111961', left + 4, y + 15);
  }

  // PAY SLIP
  doc.setFontSize(20);
  doc.text('PAY SLIP', left + col1W + col2W / 2, y , { align: 'center' });

  // CONFIDENTIAL
  doc.setFontSize(16);
  doc.text(
    'CONFIDENTIAL',
    left + col1W + col2W + col3W / 2,
    y ,
    { align: 'center' }
  );

  // ===== แถบเดือน =====
  y += headerH;
  const monthH = 10;
  doc.rect(left, y, width, monthH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('NOVEMBER', left + width / 2, y + 7, { align: 'center' });

  // ===== ข้อมูลEmployee =====
  y += monthH;
  const infoH = 25;
  doc.rect(left, y, width, infoH);

  const midX = left + width / 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  let lineY = y + 7;
  doc.text('Name                  :', left + 4, lineY);
  doc.text('Identification Number :', left + 4, (lineY += 6));
  doc.text('Title                 :', left + 4, (lineY += 6));

  lineY = y + 7;
  const name = `${previewSalary.EMP_NAME ?? ''} ${previewSalary.EMP_LNAME ?? ''}`.trim() || '-';
  doc.text(name, left + 50, lineY);
  doc.text(`${previewSalary.EMP_ID ?? '-'}`, left + 50, (lineY += 6));
  doc.text(`${previewSalary.EMPLOYEE.NICK_NAME ?? ''}`, left + 50, (lineY += 6));

  lineY = y + 7;
  doc.text('Date of Employment :', midX + 4, lineY);
  doc.text('Position           :', midX + 4, (lineY += 6));
  doc.text('Department         :', midX + 4, (lineY += 6));

  lineY = y + 7;
  doc.text(`${previewSalary.TRANSFER_DATE ?? ''}`, midX + 45, lineY);
  doc.text(`${previewSalary.EMPLOYEE.POSITION_NM ?? ''}`, midX + 45, (lineY += 6));
  doc.text(`${previewSalary.EMPLOYEE.DEPARTMENT_NM ?? ''}`, midX + 45, (lineY += 6));

  // ===== Header ตาราง =====
  y += infoH;
  const tableHeaderH = 8;
  const tableHeaderTopY = y;
  const rowH = 7;

  // ตำแหน่งคอลัมน์ (ใช้ค่าชุดเดียวทุกที่)
  const colEarnX = left + width * 0.55;
  const colDedX = left + width * 0.80;

  // กรอบ header
  doc.rect(left, tableHeaderTopY, width, tableHeaderH);

  // ตัวหนังสือหัวตาราง
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Description', left + 4, tableHeaderTopY + 6);
  doc.text('Earnings', (colEarnX + colDedX) / 2, tableHeaderTopY + 6, { align: 'center' });
  doc.text('Deductions', (colDedX + right) / 2, tableHeaderTopY + 6, { align: 'center' });

  // ===== แถวข้อมูล =====
  y = tableHeaderTopY + tableHeaderH;

  type Row = { label: string; earning?: number; deduction?: number; };

  const rows: Row[] = [
    { label: 'Basic Salary',      earning: previewSalary.BASE_SALARY },
    { label: 'Allowance',         earning: previewSalary.ALLOWANCE_AMT},
    { label: 'OT',                earning: previewSalary.OT_AMT },
    { label: 'Bonus',             earning: previewSalary.BONUS_AMT},
    { label: 'SSO Contribution',  deduction: previewSalary.SSO_AMT },
    { label: 'Student Loan Fund', deduction: previewSalary.STUDENT_LOAN },
    { label: 'Withholding Tax',   deduction: previewSalary.WHT_AMT },
    { label: 'DEDUCTION ('+ previewSalary.DEDUCTION_REMARK +')', deduction: previewSalary.DEDUCTION },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const firstRowTopY = y;

  rows.forEach((r) => {
    const rowTop = y;
    const rowBottom = y + rowH;

    // เส้นล่างแถว
    doc.line(left, rowBottom, right, rowBottom);

    // ข้อความ
    doc.text(r.label, left + 4, rowTop + 5);

    if (r.earning != null) {
      const text = formatCurrency(r.earning);
      doc.text(text, colDedX - 4, rowTop + 5, { align: 'right' });
    }

    if (r.deduction != null) {
      const text = formatCurrency(r.deduction);
      doc.text(text, right - 4, rowTop + 5, { align: 'right' });
    }

    y += rowH;
  });

  const lastRowBottomY = y; // ตำแหน่งเส้นล่างสุดของแถวปกติ

  // ===== เส้นตั้งของตาราง (วาดทีเดียวจากหัวถึง Total) =====
  const tableBottomY = lastRowBottomY + rowH; // รวมแถว Total ด้วย

  // เส้นตั้ง Description | Earnings | Deductions
  doc.line(colEarnX, tableHeaderTopY, colEarnX, tableBottomY);
  doc.line(colDedX, tableHeaderTopY, colDedX, tableBottomY);

  // ===== แถว Total =====
  const totalEarnings =
    (previewSalary.BASE_SALARY ?? 0) +
    (previewSalary.BONUS_AMT ?? 0) +
    (previewSalary.OT_AMT ?? 0) +
    (previewSalary.ALLOWANCE_AMT ?? 0);

  const totalDeductions =
    (previewSalary.SSO_AMT ?? 0) +
    (previewSalary.STUDENT_LOAN ?? 0) +
    (previewSalary.WHT_AMT ?? 0) +
    (previewSalary.DEDUCTION ?? 0);

  // กรอบ Total ใช้ tableBottomY แน่นอน → เส้นตรง
  const totalTopY = lastRowBottomY;
  doc.setFont('helvetica', 'bold');
  doc.rect(left, totalTopY, width, rowH); // กรอบทั้งแถว

  doc.text('Total', left + 4, totalTopY + 5);
  doc.text(formatCurrency(totalEarnings), colDedX - 4, totalTopY + 5, { align: 'right' });
  doc.text(formatCurrency(totalDeductions), right - 4, totalTopY + 5, { align: 'right' });

  // ===== ข้อมูลธนาคาร (ซ้ายล่าง) =====
  y = tableBottomY + 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  let infoY = y;
  doc.text('Transfer Date     :', left + 4, (infoY+=3));
  doc.text('Bank Name         :', left + 4, (infoY += 6));
  doc.text('Bank Account Name :', left + 4, (infoY += 6));
  doc.text('Bank Account Number :', left + 4, (infoY += 6));
  doc.setFontSize(8);
   doc.text('This document is generated automatically by the system. Transactions can be processed without a signature.', left + 4, (infoY += 30));

  doc.setFontSize(10);
  infoY = y;
  doc.text(`${previewSalary.TRANSFER_DATE ?? ''}`, left + 35, (infoY+=3));
  doc.text(`${previewSalary.EMPLOYEE.BANK_NAME ?? ''}`, left + 35, (infoY += 6));
  doc.setFont('THSarabunNew', 'normal');
  doc.setFontSize(15);
  doc.text(`${previewSalary.EMPLOYEE.BANK_ACC_NAME ?? ''}`, left + 40, (infoY += 6));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${previewSalary.EMPLOYEE.BANK_ACC_NUMBER ?? ''}`, left +43, (infoY += 6));

  // ===== กล่อง NET PAY (ติดกับเส้น colEarnX & Total) =====
  const netPay = previewSalary.NET_PAYMENT ?? totalEarnings - totalDeductions;

// ความสูงของกล่อง
const netBoxW = right - colEarnX;
const netBoxH = 35;

// ขยับลงมากขึ้น
const netBoxX = colEarnX;
const netBoxY = totalTopY + 10;  //  <--- ตรงนี้แหละ

// หัว NET PAY
doc.rect(netBoxX, netBoxY, netBoxW, 8);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.text('NET PAY', netBoxX + netBoxW / 2, netBoxY + 5, { align: 'center' });

// ตัวกล่องจำนวนเงิน
doc.rect(netBoxX, netBoxY + 8, netBoxW, netBoxH);

// ขยับเลขลงเพื่อให้ตรงกลางพอดี
doc.setFontSize(18);
doc.text(formatCurrency(netPay), netBoxX + netBoxW / 2, netBoxY + 8 + 20, {
  align: 'center',
});


// ใช้ฟอนต์ไทย
doc.setFont('THSarabunNew', 'normal');
console.log(thaiMoneyText(netPay));
doc.text(
  thaiMoneyText(netPay),
  netBoxX + netBoxW / 2,
  netBoxY + 8 + 35,
  { align: 'center' }
);
if(type_p=='EXPORT'){
  doc.save(`pay_slip_${previewSalary.EMP_ID}.pdf`);
}else{
 return doc.output('datauristring').split(',')[1];
}
};

function autoFitColumns(rows: SalaryDetail[], columns: (keyof SalaryDetail)[]) {
  return columns.map((key) => {
    const header = String(key); // ชื่อหัวคอลัมน์
    const maxCellLength = Math.max(
      header.length,
      ...rows.map((row) => {
        const v = row[key];
        if (v === null || v === undefined) return 0;

        const s =
          v instanceof Date ? v.toISOString().slice(0, 10) : String(v);

        // ถ้ามีตัวอักษรไทย ให้เผื่อความกว้างเพิ่มอีกนิด
        const thaiCount = s.replace(/[^\u0E00-\u0E7F]/g, "").length;
        return s.length + thaiCount; // ไทยกินที่มากกว่าตัวอังกฤษ
      })
    );

    return { wch: maxCellLength + 2 }; // +2 padding กันหัวโดนตัด
  });
};

const exportSalaryToExcel = async (rows: SalaryDetail[]) => {
  if (!rows || rows.length === 0) return;
 const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Salary");
  // ลำดับ column ตามที่ต้องการ
  const headerOrder: (keyof SalaryDetail)[] = [
    "EMP_ID",
    "COMPANY_NM",
    "EMP_NAME",
    "NICK_NAME",
    "DEPARTMENT_NM",
    "BASE_SALARY",
    "OT_TIME",
    "OT_AMT",
    "ALLOWANCE_AMT",
    "BONUS_AMT",
    "SSO_AMT",
    "WHT_AMT",
    "STUDENT_LOAN",
    "DEDUCTION",
    "DEDUCTION_REMARK",
    "NET_PAYMENT",
    "TRANSFER_DATE",
    "BANK_NAME",
    "BANK_ACC_NUMBER",
    "BANK_ACC_NAME",
    "EMAIL",
    "REMARK"
  ];
    sheet.addRow(headerOrder);

  // แปลง TRANSFER_DATE เป็น string ก่อน (Excel อ่านง่าย)
  const exportData = rows.map((r) => ({
    ...r,
    TRANSFER_DATE: r.TRANSFER_DATE
      ? r.TRANSFER_DATE.toString().slice(0, 10) // YYYY-MM-DD
      : "",
      NICK_NAME: r.EMPLOYEE.NICK_NAME,
      EMAIL: r.EMPLOYEE.EMAIL,
      COMPANY_NM: r.EMPLOYEE.COMPANY_NM,
      DEPARTMENT_NM: r.EMPLOYEE.DEPARTMENT_NM,
      BANK_NAME: r.EMPLOYEE.BANK_NAME,
      BANK_ACC_NAME: r.EMPLOYEE.BANK_ACC_NAME,
      BANK_ACC_NUMBER: r.EMPLOYEE.BANK_ACC_NUMBER,
  }));

  // header style
  sheet.getRow(1).eachCell((cell,colNumber) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3F3F3F" },  // สีเทาเข้ม
    };
    cell.alignment = { horizontal: "center" };
    // AUTO-FIT COLUMN BY HEADER & DATA
    const column = sheet.getColumn(colNumber);

    // คำนวณ max width จาก header + data
    const maxTextLength = Math.max(
      cell.value!.toString().length,
      ...rows.map((r) => String(Object.values(r)[colNumber - 1] ?? "").length)
    );

    // เผื่อ padding + ไทย
    column.width = maxTextLength + 3;
  });
  autoFitColumns(exportData,headerOrder);

  // rows

  exportData.forEach(row => {
  const rowData = headerOrder.map(key => row[key]);
  sheet.addRow(rowData);
});
  

  // download
  const buf = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buf]), "salary.xlsx");
};



  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><DollarSign className="w-6 h-6 text-primary-foreground" /></div><div><h1 className="text-2xl font-bold">Salary & Payment</h1><p className="text-muted-foreground">Salary Detail</p></div></div><Button onClick={() => handleOpenDialog()} className="gap-2 gradient-primary hover:opacity-90"><Plus className="w-4 h-4" /> Add Item</Button></div>
        <Card className="shadow-card"><CardHeader className="pb-4"><div className="flex items-center justify-between"><CardTitle className="text-lg">Salary Detail</CardTitle><div className="relative w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" /></div> <Button onClick={() => exportSalaryToExcel(filteredSalaries)} className="gap-2 gradient-primary"><Plus className="w-4 h-4" /> Export Excel By Filter</Button></div></CardHeader>
          <CardContent>{isLoading ? <div className="text-center py-8 text-muted-foreground">Dowloading...</div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Employee</TableHead><TableHead className="text-right">Salary</TableHead><TableHead className="text-right">Income</TableHead><TableHead className="text-right">Deduction</TableHead><TableHead className="text-right">Net</TableHead><TableHead>Transfer Date</TableHead><TableHead className="text-right">Manage</TableHead></TableRow></TableHeader><TableBody>{filteredSalaries.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">ไม่พบข้อมูล</TableCell></TableRow> : filteredSalaries.map(s => { const inc = s.BASE_SALARY + s.OT_AMT + s.ALLOWANCE_AMT + s.BONUS_AMT; const ded = s.SSO_AMT + s.WHT_AMT + s.STUDENT_LOAN + s.DEDUCTION; return <TableRow key={s.IDA}><TableCell>{s.EMPLOYEE.COMPANY_NM}</TableCell><TableCell>{s.EMP_NAME} {s.EMP_LNAME}</TableCell><TableCell className="text-right">{formatCurrency(s.BASE_SALARY)}</TableCell><TableCell className="text-right text-success">{formatCurrency(inc)}</TableCell><TableCell className="text-right text-destructive">{formatCurrency(ded)}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(s.NET_PAYMENT)}</TableCell><TableCell>{s.TRANSFER_DATE || '-'}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => handlePreview(s)}><FileText className="w-4 h-4" /></Button><Button size="sm" variant="outline" onClick={() => handleOpenDialog(s)}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="destructive" onClick={() => handleDelete(s.IDA)}><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>; })}</TableBody></Table></div>}</CardContent>
        </Card>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingSalary ? 'Edit' : 'Add Item'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Company *</Label><Select value={selectedCompany} onValueChange={v => { setSelectedCompany(v); setFormData(p => ({ ...p, COMPANY_NM: v })); }}><SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger><SelectContent className="bg-popover">{COMPANIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2">
          <Label>Employee *</Label><Select value={formData.EMP_ID} onValueChange={handleEmployeeSelect} disabled={!selectedCompany}><SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger><SelectContent className="bg-popover">{filteredEmployees.map(e => <SelectItem key={e.EMP_ID} value={e.EMP_ID}>{e.EMP_NAME} {e.EMP_LNAME}</SelectItem>)}</SelectContent></Select></div></div>
          <div className="grid grid-cols-3 gap-4"><div className="grid gap-2"><Label>Employee ID</Label><Input value={formData.EMP_ID} disabled className="bg-muted" /></div><div className="grid gap-2"><Label>Title</Label><Input value={formData.NICK_NAME} disabled className="bg-muted" /></div><div className="grid gap-2"><Label>Department</Label><Input value={formData.DEPARTMENT_NM} disabled className="bg-muted" /></div></div>
          <div className="border-t pt-4"><h4 className="font-medium mb-3 text-success">Income</h4><div className="grid grid-cols-4 gap-4">
            <div className="grid gap-2"><Label>Base Salary</Label><Input value={formData.TOTAL_SALARY} disabled className="bg-muted" /></div><div className="grid gap-2"><Label>Salary</Label><Input type="number" value={formData.BASE_SALARY} onChange={e => setFormData({ ...formData, BASE_SALARY: Number(e.target.value), SSO_AMT:onChange_Cal_SOS(Number(e.target.value)) })} /></div><div className="grid gap-2"><Label>Allowance</Label><Input type="number" value={formData.ALLOWANCE_AMT} onChange={e => setFormData({ ...formData, ALLOWANCE_AMT: Number(e.target.value) })} /></div><div className="grid gap-2"><Label>OT (Hour)</Label><Input type="number" value={formData.OT_TIME} onChange={e => setFormData({ ...formData, OT_TIME: Number(e.target.value),OT_AMT:onChange_OT(Number(e.target.value),formData.TOTAL_SALARY) })} /></div><div className="grid gap-2"><Label>OT (Baht)</Label><Input type="number" value={formData.OT_AMT} onChange={e => setFormData({ ...formData, OT_AMT: Number(e.target.value) })} disabled className="bg-muted" /></div><div className="grid gap-2"><Label>Bonus</Label><Input type="number" value={formData.BONUS_AMT} onChange={e => setFormData({ ...formData, BONUS_AMT: Number(e.target.value) })} /></div></div></div>
          <div className="border-t pt-4"><h4 className="font-medium mb-3 text-destructive">Deduction Item</h4><div className="grid grid-cols-4 gap-4"><div className="grid gap-2"><Label>SSO Contribution</Label><Input type="number" value={formData.SSO_AMT} onChange={e => setFormData({ ...formData, SSO_AMT: Number(e.target.value) })} /></div><div className="grid gap-2"><Label>Withholding Tax</Label><Input type="number" value={formData.WHT_AMT} onChange={e => setFormData({ ...formData, WHT_AMT: Number(e.target.value) })} /></div><div className="grid gap-2"><Label>Student Loan Fund .</Label><Input type="number" value={formData.STUDENT_LOAN} onChange={e => setFormData({ ...formData, STUDENT_LOAN: Number(e.target.value) })} /></div><div className="grid gap-2"><Label>Other Deduction</Label><Input type="number" value={formData.DEDUCTION} onChange={e => setFormData({ ...formData, DEDUCTION: Number(e.target.value) })} /></div></div></div>
           <div className="border-t pt-4"><Label>Remark Other Deduction </Label><Input value={formData.DEDUCTION_REMARK} onChange={e => setFormData({ ...formData, DEDUCTION_REMARK: String(e.target.value) })} /></div>
          <div className="border-t pt-4"><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>วันที่โอน</Label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn('justify-start text-left font-normal', !formData.TRANSFER_DATE && 'text-muted-foreground')}><CalendarIcon className="mr-2 h-4 w-4" />{formData.TRANSFER_DATE ? format(formData.TRANSFER_DATE, 'dd/MM/yyyy') : 'เลือกวันที่'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 bg-popover" align="start"><Calendar mode="single" selected={formData.TRANSFER_DATE || undefined} onSelect={d => setFormData({ ...formData, TRANSFER_DATE: d || null })} initialFocus className="pointer-events-auto" /></PopoverContent></Popover></div><div className="grid gap-2"><Label className="text-lg font-semibold">Net Amount</Label><div className="text-2xl font-bold text-primary">{formatCurrency(formData.NET_PAYMENT)}</div></div></div></div>
          <div className="border-t pt-4"><div className="grid gap-2"><Label>Remark</Label><textarea value={formData.REMARK}  onChange={e => setFormData({ ...formData, REMARK: String(e.target.value) })}/></div></div>
          <div className="border-t pt-4"><h4 className="font-medium mb-3">Account Info</h4><div className="grid grid-cols-3 gap-4"><div className="grid gap-2"><Label>Bank Name</Label><Input value={formData.BANK_NAME} disabled className="bg-muted" /></div><div className="grid gap-2"><Label>Bank Account</Label><Input value={formData.BANK_ACC_NUMBER} disabled className="bg-muted" /></div><div className="grid gap-2"><Label>Account</Label><Input value={formData.BANK_ACC_NAME} disabled className="bg-muted" /></div></div></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} className="gradient-primary hover:opacity-90">Save</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}><DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Salary Slip Preview</DialogTitle>
        </DialogHeader>{previewSalary && <div className="space-y-4 py-4"><div className="bg-muted p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Company</p>
            <p className="font-medium">{previewSalary.EMPLOYEE.COMPANY_NM}</p></div>
            <div><p className="text-sm text-muted-foreground">Transfer Date</p>
            <p className="font-medium">{previewSalary.TRANSFER_DATE || '-'}</p></div>
            <div><p className="text-sm text-muted-foreground">Employee</p><p className="font-medium">{previewSalary.EMP_NAME} {previewSalary.EMP_LNAME}</p>
            </div><div><p className="text-sm text-muted-foreground">Department</p><p className="font-medium">{previewSalary.EMPLOYEE.DEPARTMENT_NM || '-'}</p></div>
            </div></div><div className="grid grid-cols-2 gap-6"><div><h4 className="font-medium text-success mb-2">Income</h4>
            <div className="space-y-1 text-sm"><div className="flex justify-between"><span>Salary</span>
            <span>{formatCurrency(previewSalary.BASE_SALARY)}</span></div><div className="flex justify-between"><span>Allowance</span>
            <span>{formatCurrency(previewSalary.ALLOWANCE_AMT)}</span></div><div className="flex justify-between"><span>OT</span>
            <span>{formatCurrency(previewSalary.OT_AMT)}</span></div><div className="flex justify-between"><span>Bonus</span>
            <span>{formatCurrency(previewSalary.BONUS_AMT)}</span></div>
            <div className="flex justify-between"><span></span>
            <span></span></div></div></div><div>
              <h4 className="font-medium text-destructive mb-2">Deduction Item</h4>
              <div className="space-y-1 text-sm"><div className="flex justify-between"><span>SSO Contribution</span>
              <span>{formatCurrency(previewSalary.SSO_AMT)}</span></div><div className="flex justify-between"><span>Withholding Tax</span>
              <span>{formatCurrency(previewSalary.WHT_AMT)}</span></div><div className="flex justify-between"><span>Student Loan Fund .</span>
              <span>{formatCurrency(previewSalary.STUDENT_LOAN)}</span></div><div className="flex justify-between"><span>Other Deduction</span>
              <span>{formatCurrency(previewSalary.DEDUCTION)}</span></div><div className="flex justify-between"><span>Remark Deduction</span>
              <span>{previewSalary.DEDUCTION_REMARK}</span></div>
              </div></div></div><div className="border-t pt-4 flex justify-between items-center">
              <span className="text-lg font-medium">Net Amount</span><span className="text-2xl font-bold text-primary">{formatCurrency(previewSalary.NET_PAYMENT)}</span>
              </div>
                 <div className="ext-lg font-medium"><span>Remark :  {previewSalary.REMARK}</span></div>
                <div className="ext-lg font-medium"><span>Email :  {previewSalary.EMPLOYEE.EMAIL}</span></div>
              </div>}<DialogFooter><Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button><Button variant="outline" onClick={handleSendEMAIL} className="gap-2"><Mail className="w-4 h-4" /> Send EMAIL</Button><Button onClick={() => generatePDF('EXPORT')} className="gap-2 gradient-primary hover:opacity-90"><FileText className="w-4 h-4" /> Download PDF</Button></DialogFooter></DialogContent></Dialog>
    </DashboardLayout>
  );
}
