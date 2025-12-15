import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2, UserCog } from 'lucide-react';
import type { UserInfo } from '@/types/hr';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function UserManagement() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [formData, setFormData] = useState({
    USER_NAME: '',
    USER_PASS: '',
    NAME: '',
    LNAME: '',
    NICK_NAME: '',
    EMAIL: '',
  });
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('USER_INFO').select('*').order('CREATE_DATE', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Unable to load data.' });
    } else {
      setUsers(data as UserInfo[]);
      setFilteredUsers(data as UserInfo[]);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredUsers(users.filter(u => u.NAME.toLowerCase().includes(term) || u.LNAME.toLowerCase().includes(term) || (u.NICK_NAME?.toLowerCase() || '').includes(term) || u.EMAIL.toLowerCase().includes(term)));
  }, [searchTerm, users]);

  const handleOpenDialog = (user?: UserInfo) => {
    if (user) {
      setEditingUser(user);
      setFormData({ USER_NAME: user.USER_NAME, USER_PASS: user.USER_PASS, NAME: user.NAME, LNAME: user.LNAME, NICK_NAME: user.NICK_NAME || '', EMAIL: user.EMAIL });
    } else {
      setEditingUser(null);
      setFormData({ USER_NAME: '', USER_PASS: '', NAME: '', LNAME: '', NICK_NAME: '', EMAIL: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.USER_NAME || !formData.USER_PASS || !formData.NAME || !formData.LNAME || !formData.EMAIL) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in the required information.' });
      return;
    }
    if (editingUser) {
      const { error } = await supabase.from('USER_INFO').update(formData).eq('IDA', editingUser.IDA);
      console.log(error);
      if (error) toast({ variant: 'destructive', title: 'Error', description: 'Unable to update.' });
      else { toast({ title: 'Successful.', description: 'Information updated successfully.' }); setIsDialogOpen(false); fetchUsers(); }
    } else {
      const { error } = await supabase.from('USER_INFO').insert([formData]);
      if (error) toast({ variant: 'destructive', title: 'Error', description: error.code === '23505' ? 'Username or email already exists.' : 'Unable to load data.' });
      else { toast({ title: 'Successful.', description: 'User added successfully.' }); setIsDialogOpen(false); fetchUsers(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Do you want to delete this user?')) return;
    const { error } = await supabase.from('USER_INFO').delete().eq('IDA', id);
    if (error) toast({ variant: 'destructive', title: 'Error', description: 'Unable to delete.' });
    else { toast({ title: 'Successful.', description: 'Deleted successfully.' }); fetchUsers(); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><UserCog className="w-6 h-6 text-primary-foreground" /></div>
            <div><h1 className="text-2xl font-bold">User Management</h1><p className="text-muted-foreground">จัดการข้อมูลผู้ใช้</p></div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2 gradient-primary hover:opacity-90"><Plus className="w-4 h-4" /> Add User</Button>
        </div>
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">User List</CardTitle>
              <div className="relative w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ?  <LoadingSpinner text="กำลังโหลดข้อมูลพนักงาน..." />  : (
              <Table>
                <TableHeader><TableRow><TableHead>Username</TableHead><TableHead>Name</TableHead><TableHead>Title</TableHead><TableHead>EMAIL</TableHead><TableHead className="text-right">Manage</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No Data Found!!</TableCell></TableRow> : filteredUsers.map((user) => (
                    <TableRow key={user.IDA}><TableCell className="font-medium">{user.USER_NAME}</TableCell><TableCell>{user.NAME} {user.LNAME}</TableCell><TableCell>{user.NICK_NAME || '-'}</TableCell><TableCell>{user.EMAIL}</TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => handleOpenDialog(user)}><Pencil className="w-4 h-4" /></Button><Button size="sm" variant="destructive" onClick={() => handleDelete(user.IDA)}><Trash2 className="w-4 h-4" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Username *</Label><Input value={formData.USER_NAME} onChange={(e) => setFormData({ ...formData, USER_NAME: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Password *</Label><Input type="password" value={formData.USER_PASS} onChange={(e) => setFormData({ ...formData, USER_PASS: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Name *</Label><Input value={formData.NAME} onChange={(e) => setFormData({ ...formData, NAME: e.target.value })} /></div><div className="grid gap-2"><Label>LastName *</Label><Input value={formData.LNAME} onChange={(e) => setFormData({ ...formData, LNAME: e.target.value })} /></div></div>
            <div className="grid gap-2"><Label>Title</Label><Input value={formData.NICK_NAME} onChange={(e) => setFormData({ ...formData, NICK_NAME: e.target.value })} /></div>
            <div className="grid gap-2"><Label>EMAIL *</Label><Input type="EMAIL" value={formData.EMAIL} onChange={(e) => setFormData({ ...formData, EMAIL: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} className="gradient-primary hover:opacity-90">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
