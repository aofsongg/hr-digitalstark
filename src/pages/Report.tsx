import { useState, useMemo, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
import{supabase} from '../lib/supabaseClient';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, Download } from 'lucide-react';
import type { SalaryDetail } from '@/types/hr';
import { COMPANIES } from '@/types/hr';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/TablePagination';

export default function Report() {
  const [salaries, setSalaries] = useState<SalaryDetail[]>([]);
  const [filteredSalaries, setFilteredSalaries] = useState<SalaryDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast(); 

  const fetchData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('SALARY_DETAIL').select('*,EMPLOYEE(*)').order('TRANSFER_DATE', { ascending: false });
    if (error) toast({ variant: 'destructive', title: 'Error' });
    else { setSalaries(data as SalaryDetail[]); setFilteredSalaries(data as SalaryDetail[]); }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let filtered = [...salaries];
    const term = searchTerm.toLowerCase();
    if (term) filtered = filtered.filter(s => (s.EMP_NAME?.toLowerCase() || '').includes(term) || (s.EMP_LNAME?.toLowerCase() || '').includes(term)|| (s.EMPLOYEE.NICK_NAME?.toLowerCase() || '').includes(term)  || (s.EMP_ID?.toLowerCase() || '').includes(term));
    if (selectedCompany !== 'all') filtered = filtered.filter(s => s.EMPLOYEE.COMPANY_NM === selectedCompany);
    if (selectedMonth !== 'all') filtered = filtered.filter(s => s.TRANSFER_DATE?.substring(0, 7) === selectedMonth);
    setFilteredSalaries(filtered);
  }, [searchTerm, selectedCompany, selectedMonth, salaries]);

  const formatCurrency = (amt: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amt);
  const getUniqueMonths = () => Array.from(new Set(salaries.filter(s => s.TRANSFER_DATE).map(s => s.TRANSFER_DATE!.substring(0, 7)))).sort().reverse();
  const totals = filteredSalaries.reduce((a, c) => ({ totalIncome: a.totalIncome + c.BASE_SALARY + c.OT_AMT + c.ALLOWANCE_AMT + c.BONUS_AMT+ c.HOLIDAY_AMT, totalDEDUCTIONs: a.totalDEDUCTIONs + c.SSO_AMT + c.WHT_AMT + c.STUDENT_LOAN + c.DEDUCTION, totalNet: a.totalNet + c.NET_PAYMENT }), { totalIncome: 0, totalDEDUCTIONs: 0, totalNet: 0 });

  const generateReportPDF = () => {
    const doc = new jsPDF('landscape');
  const formatCurrency = (n?: number) =>
    (n ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    doc.setFontSize(18); doc.text('Salary Report', 148, 15, { align: 'center' });
    doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')}`, 148, 22, { align: 'center' });
    autoTable(doc, { startY: 35, head: [['EMP ID', 'Name', 'Company', 'Base', 'Income', 'DEDUCTIONs', 'Net', 'Date']], body: filteredSalaries.map(s => [s.EMP_ID, `${s.EMPLOYEE.TITLE} ${s.EMPLOYEE.EMP_NAME} ${s.EMPLOYEE.EMP_LNAME}`+'(' + s.EMPLOYEE.NICK_NAME + ')', s.EMPLOYEE.COMPANY_NM || '-', formatCurrency(s.BASE_SALARY), formatCurrency(s.BASE_SALARY + s.OT_AMT + s.ALLOWANCE_AMT + s.BONUS_AMT+ s.HOLIDAY_AMT), formatCurrency(s.SSO_AMT + s.WHT_AMT + s.STUDENT_LOAN + s.DEDUCTION), formatCurrency(s.NET_PAYMENT), s.TRANSFER_DATE || '-']), foot: [['', 'TOTAL', '', '', formatCurrency(totals.totalIncome), formatCurrency(totals.totalDEDUCTIONs), formatCurrency(totals.totalNet), '']], styles: { fontSize: 8 }, headStyles: { fillColor: [30, 58, 95] }, footStyles: { fillColor: [30, 58, 95] } });
    doc.save(`salary_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Download Successful' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><FileText className="w-6 h-6 text-primary-foreground" /></div><div><h1 className="text-2xl font-bold">Report</h1><p className="text-muted-foreground">Salary Report</p></div></div><Button onClick={generateReportPDF} className="gap-2 gradient-primary hover:opacity-90"><Download className="w-4 h-4" /> Download PDF</Button></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card className="shadow-card"><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Net Income</div><div className="text-2xl font-bold text-success">{formatCurrency(totals.totalIncome)}</div></CardContent></Card><Card className="shadow-card"><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Total Deduction</div><div className="text-2xl font-bold text-destructive">{formatCurrency(totals.totalDEDUCTIONs)}</div></CardContent></Card><Card className="shadow-card"><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Net Amount</div><div className="text-2xl font-bold text-primary">{formatCurrency(totals.totalNet)}</div></CardContent></Card></div>
        <Card className="shadow-card"><CardHeader className="pb-4"><div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"><CardTitle className="text-lg">Salary Report</CardTitle><div className="flex flex-col md:flex-row gap-3 w-full md:w-auto"><div className="relative w-full md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" /></div><Select value={selectedCompany} onValueChange={setSelectedCompany}><SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Company" /></SelectTrigger><SelectContent className="bg-popover"><SelectItem value="all">All</SelectItem>{COMPANIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger className="w-full md:w-40"><SelectValue placeholder="เดือน" /></SelectTrigger><SelectContent className="bg-popover"><SelectItem value="all">All</SelectItem>{getUniqueMonths().map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div></div></CardHeader>
          <CardContent>{isLoading ?  <LoadingSpinner text="Loading..." />  : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Employee ID</TableHead><TableHead>Name</TableHead><TableHead>Company</TableHead><TableHead className="text-right">Total Compensation</TableHead><TableHead className="text-right">Net Income</TableHead><TableHead className="text-right">Total Deduction</TableHead><TableHead className="text-right">Net</TableHead><TableHead>Transfer Date</TableHead></TableRow></TableHeader><TableBody>{filteredSalaries.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Not Found Data.</TableCell></TableRow> : filteredSalaries.map(s => <TableRow key={s.IDA}><TableCell className="font-medium">{s.EMP_ID}</TableCell><TableCell>{s.EMPLOYEE.TITLE} {s.EMP_NAME} {s.EMP_LNAME}({s.EMPLOYEE.NICK_NAME})</TableCell><TableCell>{s.EMPLOYEE.COMPANY_NM}</TableCell><TableCell className="text-right">{formatCurrency(s.EMPLOYEE.BASE_SALARY)}</TableCell><TableCell className="text-right text-success">{formatCurrency(s.BASE_SALARY + s.OT_AMT + s.ALLOWANCE_AMT + s.BONUS_AMT)}</TableCell><TableCell className="text-right text-destructive">{formatCurrency(s.SSO_AMT + s.WHT_AMT + s.STUDENT_LOAN + s.DEDUCTION)}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(s.NET_PAYMENT)}</TableCell><TableCell>{s.TRANSFER_DATE || '-'}</TableCell></TableRow>)}</TableBody></Table></div>}</CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
