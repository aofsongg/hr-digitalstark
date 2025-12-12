import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
import { supabase } from '../lib/supabaseClient';
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
import { Plus, Search, Pencil, Trash2, Users, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Employee } from '@/types/hr';
import { COMPANIES } from '@/types/hr';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ COMPANY_NM: '', EMAIL: '', EMP_ID: '', EMP_NAME: '', EMP_LNAME: '', NICK_NAME: '', IDENTIFY_NUMBER: '', POSITION_NM: '', DEPARTMENT_NM: '', START_WORKING_DATE: null as Date | null, BASE_SALARY: 0, BANK_NAME: '', BANK_ACC_NUMBER: '', BANK_ACC_NAME: '' });
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('EMPLOYEE').select('*').order('CREATE_DATE', { ascending: false });
    if (error) toast({ variant: 'destructive', title: 'Error', description: 'Unable to load data.' });
    else { setEmployees(data as Employee[]); setFilteredEmployees(data as Employee[]); }
    setIsLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredEmployees(employees.filter(e => e.COMPANY_NM.toLowerCase().includes(term) || e.EMP_NAME.toLowerCase().includes(term) || e.EMP_LNAME.toLowerCase().includes(term) || (e.NICK_NAME?.toLowerCase() || '').includes(term) || e.EMAIL.toLowerCase().includes(term)));
  }, [searchTerm, employees]);

  const handleOpenDialog = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({ COMPANY_NM: emp.COMPANY_NM, EMAIL: emp.EMAIL, EMP_ID: emp.EMP_ID, EMP_NAME: emp.EMP_NAME, EMP_LNAME: emp.EMP_LNAME, NICK_NAME: emp.NICK_NAME || '', IDENTIFY_NUMBER: emp.IDENTIFY_NUMBER || '', POSITION_NM: emp.POSITION_NM || '', DEPARTMENT_NM: emp.DEPARTMENT_NM || '', START_WORKING_DATE: emp.START_WORKING_DATE ? new Date(emp.START_WORKING_DATE) : null, BASE_SALARY: emp.BASE_SALARY, BANK_NAME: emp.BANK_NAME || '', BANK_ACC_NUMBER: emp.BANK_ACC_NUMBER || '', BANK_ACC_NAME: emp.BANK_ACC_NAME || '' });
    } else {
      setEditingEmployee(null);
      setFormData({ COMPANY_NM: '', EMAIL: '', EMP_ID: '', EMP_NAME: '', EMP_LNAME: '', NICK_NAME: '', IDENTIFY_NUMBER: '', POSITION_NM: '', DEPARTMENT_NM: '', START_WORKING_DATE: null, BASE_SALARY: 0, BANK_NAME: '', BANK_ACC_NUMBER: '', BANK_ACC_NAME: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.COMPANY_NM || !formData.EMAIL || !formData.EMP_ID || !formData.EMP_NAME || !formData.EMP_LNAME) { toast({ variant: 'destructive', title: 'Error', description: 'Please fill in the required information.' }); return; }
    const dataToSave = { ...formData, START_WORKING_DATE: formData.START_WORKING_DATE ? format(formData.START_WORKING_DATE, 'yyyy-MM-dd') : null };
    if (editingEmployee) {
      const { error } = await supabase.from('EMPLOYEE').update(dataToSave).eq('IDA', editingEmployee.IDA);
      if (error) toast({ variant: 'destructive', title: 'Error', description: 'Unable to update.' }); else { toast({ title: 'Successful.' }); setIsDialogOpen(false); fetchEmployees(); }
    } else {
      const { error } = await supabase.from('EMPLOYEE').insert([dataToSave]);
      if (error) toast({ variant: 'destructive', title: 'Error', description: error.code === '23505' ? 'Employee ID มีอยู่แล้ว' : 'Unable to add.' }); else { toast({ title: 'Successful.' }); setIsDialogOpen(false); fetchEmployees(); }
    }
  };

  const handleDelete = async (id: string) => { if (!confirm('Do you want to delete the employee data?')) return; const { error } = await supabase.from('EMPLOYEE').delete().eq('IDA', id); if (error) toast({ variant: 'destructive', title: 'Error' }); else { toast({ title: 'Deleted successfully.' }); fetchEmployees(); } };
  const formatCurrency = (amt: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amt);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><Users className="w-6 h-6 text-primary-foreground" /></div><div><h1 className="text-2xl font-bold">Employee Management</h1><p className="text-muted-foreground">จัดการข้อมูลEmployee</p></div></div>
          <Button onClick={() => handleOpenDialog()} className="gap-2 gradient-primary hover:opacity-90"><Plus className="w-4 h-4" /> Add Employee</Button>
        </div>
        <Card className="shadow-card"><CardHeader className="pb-4"><div className="flex items-center justify-between"><CardTitle className="text-lg">Employee Name List</CardTitle><div className="relative w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div></CardHeader>
          <CardContent>{isLoading ? <div className="text-center py-8 text-muted-foreground">Dowloading...</div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Employee ID</TableHead><TableHead>Name</TableHead><TableHead>Position</TableHead><TableHead>Department</TableHead><TableHead className="text-right">Salary</TableHead><TableHead className="text-right">Manage</TableHead></TableRow></TableHeader><TableBody>{filteredEmployees.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Not Found Data.</TableCell></TableRow> : filteredEmployees.map(e => <TableRow key={e.IDA}><TableCell>{e.COMPANY_NM}</TableCell><TableCell className="font-medium">{e.EMP_ID}</TableCell><TableCell>{e.EMP_NAME} {e.EMP_LNAME}</TableCell><TableCell>{e.POSITION_NM || '-'}</TableCell><TableCell>{e.DEPARTMENT_NM || '-'}</TableCell><TableCell className="text-right">{formatCurrency(e.BASE_SALARY)}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => handleOpenDialog(e)}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="destructive" onClick={() => handleDelete(e.IDA)}><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table></div>}</CardContent>
        </Card>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employeeใหม่'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Company *</Label><Select value={formData.COMPANY_NM} onValueChange={v => setFormData({...formData, COMPANY_NM: v})}><SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger><SelectContent className="bg-popover">{COMPANIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label>Employee ID *</Label><Input value={formData.EMP_ID} onChange={e => setFormData({...formData, EMP_ID: e.target.value})} disabled={!!editingEmployee} /></div></div>
          <div className="grid grid-cols-3 gap-4"><div className="grid gap-2"><Label>Name *</Label><Input value={formData.EMP_NAME} onChange={e => setFormData({...formData, EMP_NAME: e.target.value})} /></div><div className="grid gap-2"><Label>LastName *</Label><Input value={formData.EMP_LNAME} onChange={e => setFormData({...formData, EMP_LNAME: e.target.value})} /></div><div className="grid gap-2"><Label>Title</Label><Input value={formData.NICK_NAME} onChange={e => setFormData({...formData, NICK_NAME: e.target.value})} /></div></div>
          <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>EMAIL *</Label><Input type="EMAIL" value={formData.EMAIL} onChange={e => setFormData({...formData, EMAIL: e.target.value})} /></div><div className="grid gap-2"><Label>Identification Number</Label><Input value={formData.IDENTIFY_NUMBER} onChange={e => setFormData({...formData, IDENTIFY_NUMBER: e.target.value})} /></div></div>
          <div className="grid grid-cols-3 gap-4"><div className="grid gap-2"><Label>Position</Label><Input value={formData.POSITION_NM} onChange={e => setFormData({...formData, POSITION_NM: e.target.value})} /></div><div className="grid gap-2"><Label>Department</Label><Input value={formData.DEPARTMENT_NM} onChange={e => setFormData({...formData, DEPARTMENT_NM: e.target.value})} /></div><div className="grid gap-2"><Label>Date of Employment</Label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn('justify-start text-left font-normal', !formData.START_WORKING_DATE && 'text-muted-foreground')}><CalendarIcon className="mr-2 h-4 w-4" />{formData.START_WORKING_DATE ? format(formData.START_WORKING_DATE, 'dd/MM/yyyy') : 'เลือกวันที่'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 bg-popover" align="start"><Calendar mode="single" selected={formData.START_WORKING_DATE || undefined} onSelect={d => setFormData({...formData, START_WORKING_DATE: d || null})} initialFocus className="pointer-events-auto" /></PopoverContent></Popover></div></div>
          <div className="grid gap-2"><Label>Salary (Baht)</Label><Input type="number" value={formData.BASE_SALARY} onChange={e => setFormData({...formData, BASE_SALARY: Number(e.target.value)})} /></div>
          <div className="border-t pt-4"><h4 className="font-medium mb-3">Account Info</h4><div className="grid grid-cols-3 gap-4"><div className="grid gap-2"><Label>Bank Name</Label><Input value={formData.BANK_NAME} onChange={e => setFormData({...formData, BANK_NAME: e.target.value})} /></div><div className="grid gap-2"><Label>Bank Account</Label><Input value={formData.BANK_ACC_NUMBER} onChange={e => setFormData({...formData, BANK_ACC_NUMBER: e.target.value})} /></div><div className="grid gap-2"><Label>Account Name</Label><Input value={formData.BANK_ACC_NAME} onChange={e => setFormData({...formData, BANK_ACC_NAME: e.target.value})} /></div></div></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} className="gradient-primary hover:opacity-90">Save</Button></DialogFooter></DialogContent></Dialog>
    </DashboardLayout>
  );
}
