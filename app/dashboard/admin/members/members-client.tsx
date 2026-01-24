"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../../components/ui/table"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "../../../../components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select"
import { useToast } from "../../../../components/ui/use-toast"
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react"
import { createUser, updateUser, deleteUser } from "../../../actions/members"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../../components/ui/alert-dialog"

// Local definition to avoid import issues
type Profile = {
    id: string
    full_name: string
    role: string
    department: string
    email?: string
}

export function MembersClient({ initialProfiles }: { initialProfiles: any[] }) {
    useEffect(() => {
        console.log('--- CLIENT PROPS RECEIVED ---');
        console.log(initialProfiles);
        console.log('--- END CLIENT PROPS ---');
    }, [initialProfiles]);

    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [editingUser, setEditingUser] = useState<any | null>(null)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        role: "staff",
        department: ""
    })

    const filteredProfiles = initialProfiles.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const resetForm = () => {
        setFormData({
            email: "",
            password: "",
            fullName: "",
            role: "staff",
            department: ""
        })
        setEditingUser(null)
    }

    const handleOpenSheet = (user?: any) => {
        if (user) {
            setEditingUser(user)
            setFormData({
                email: user.email || "",
                password: "",
                fullName: user.full_name,
                role: user.role,
                department: user.department || ""
            })
        } else {
            resetForm()
        }
        setIsOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data = new FormData()
            data.append("email", formData.email)
            data.append("password", formData.password)
            data.append("fullName", formData.fullName)
            data.append("role", formData.role)
            data.append("department", formData.department)

            if (editingUser) {
                await updateUser(editingUser.id, data)
                toast({ title: "อัพเดตสำเร็จ", description: "อัพเดตผู้ใช้สำเร็จ", className: "bg-emerald-500 text-white" })
            } else {
                await createUser(data)
                toast({ title: "สร้างสำเร็จ", description: "สร้างผู้ใช้สำเร็จ", className: "bg-emerald-500 text-white" })
            }
            setIsOpen(false)
            resetForm()
        } catch (error: any) {
            console.error(error)
            toast({
                title: "Error",
                description: error.message || "Operation failed",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const confirmDelete = async () => {
        if (!userToDelete) return
        try {
            await deleteUser(userToDelete)
            toast({ title: "ลบสำเร็จ", description: "ลบสมาชิกสำเร็จ", className: "bg-emerald-500 text-white" })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setUserToDelete(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="ค้นหาชื่อหรือแผนก"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-slate-900 border-slate-800 text-white"
                    />
                </div>
                <Button onClick={() => handleOpenSheet()} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                    <Plus className="h-4 w-4" /> เพิ่มสมาชิก
                </Button>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900/50">
                            <TableHead className="text-slate-400">ชื่อ</TableHead>
                            <TableHead className="text-slate-400">ตำแหน่ง</TableHead>
                            <TableHead className="text-slate-400">แผนก</TableHead>
                            <TableHead className="text-right text-slate-400">การกระทำ</TableHead>
                        </TableRow>
                    </TableHeader>  
                    <TableBody>
                        {filteredProfiles.map((user) => (
                            <TableRow key={user.id} className="border-slate-800 hover:bg-slate-900/30">
                                <TableCell className="font-medium text-white">{user.full_name}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                        ? 'bg-red-500/10 text-red-500'
                                        : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell className="text-slate-300">{user.department || '-'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenSheet(user)} className="text-slate-400 hover:text-blue-400">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user.id)} className="text-slate-400 hover:text-red-400">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Sheet */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent className="bg-slate-950 border-l-slate-800 text-white">
                    <SheetHeader>
                        <SheetTitle className="text-white">{editingUser ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่'}</SheetTitle>
                        <SheetDescription className="text-slate-400">
                            {editingUser ? 'แก้ไขข้อมูลสมาชิก' : 'สร้างบัญชีสมาชิก'}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ชื่อจริง</label>
                            <Input
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>

                        {!editingUser && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">อีเมล</label>
                                <Input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-slate-900 border-slate-800"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{editingUser ? 'ตั้งค่ารหัสผ่านใหม่' : 'รหัสผ่าน'}</label>
                            <Input
                                type="password"
                                required={!editingUser}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">ตำแหน่ง</label>
                            <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                                <SelectTrigger className="bg-slate-900 border-slate-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="supervisor">Supervisor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">แผนก</label>
                            <Input
                                value={formData.department}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-slate-400">ยกเลิก</Button>
                            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingUser ? 'เปลี่ยนแปลง' : 'เพิ่มสมาชิก'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Delete Alert */}
            <AlertDialog open={!!userToDelete} onOpenChange={(open: boolean) => !open && setUserToDelete(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>คุณแน่ใจว่าต้องลบบุคลากรนี้หรือไม่?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            ลบบุคลากร
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-700">ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">ลบ</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
