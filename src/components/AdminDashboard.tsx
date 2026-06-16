import React, { useState } from 'react';
import { Database, saveDatabase, generateId } from '../utils/db';
import { User, Room, SystemThemeSchedule, SystemThemeSettings } from '../types';
import { Shield, Users, UserPlus, FileDown, Upload, RefreshCw, Key, Trash, CheckCircle, AlertTriangle, Search, Edit, ArrowRightLeft, Check, X, Filter, Users2, Calendar, Clock, Sun, Moon, Sparkles, Plus, Settings } from 'lucide-react';

interface AdminDashboardProps {
  db: Database;
  onRefreshDb: () => void;
  activeTheme?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ db, onRefreshDb, activeTheme }) => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'excel' | 'classes' | 'themes'>('teachers');
  
  // Teachers state
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPass, setTeacherPass] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // Excel Import states
  const [importType, setImportType] = useState<'teachers' | 'students'>('teachers');
  const [excelInput, setExcelInput] = useState('');
  const [importLogs, setImportLogs] = useState<{ type: 'ok' | 'error'; msg: string }[]>([]);

  // Password reset helper
  const [passFormUserId, setPassFormUserId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // --- SYSTEM THEME STATE & HANDLERS ---
  const [themeFormName, setThemeFormName] = useState('');
  const [themeFormThemeId, setThemeFormThemeId] = useState('tet');
  const [themeFormType, setThemeFormType] = useState<'always' | 'scheduled' | 'time_of_day'>('scheduled');
  const [themeFormStartDate, setThemeFormStartDate] = useState('');
  const [themeFormEndDate, setThemeFormEndDate] = useState('');
  const [themeFormStartHour, setThemeFormStartHour] = useState(18);
  const [themeFormEndHour, setThemeFormEndHour] = useState(6);
  const [themeFormIsTemporary, setThemeFormIsTemporary] = useState(true);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const handleToggleSchedule = (sid: string) => {
    if (!db.themeSettings) return;
    const updatedSchedules = db.themeSettings.schedules.map(s => {
      if (s.id === sid) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    });
    
    db.themeSettings = {
      ...db.themeSettings,
      schedules: updatedSchedules
    };
    saveDatabase(db);
    onRefreshDb();
  };

  const handleDeleteSchedule = (sid: string) => {
    if (!db.themeSettings) return;
    openCustomConfirm(
      "XÓA HẸN GIỜ THEME",
      "Bạn chắc chắn muốn xóa quy tắc hẹn giờ này của hệ thống?",
      () => {
        db.themeSettings = {
          ...db.themeSettings!,
          schedules: db.themeSettings!.schedules.filter(s => s.id !== sid)
        };
        saveDatabase(db);
        onRefreshDb();
      }
    );
  };

  const handleSaveThemeSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeFormName.trim()) {
      alert("Vui lòng nhập tên ngày lễ hoặc sự kiện!");
      return;
    }
    if (!db.themeSettings) {
      db.themeSettings = { activeThemeId: 'light', schedules: [] };
    }

    const newSchedule: SystemThemeSchedule = {
      id: editingScheduleId || 'sch-' + generateId(),
      name: themeFormName.trim(),
      themeId: themeFormThemeId,
      type: themeFormType,
      isTemporary: themeFormType === 'always' ? false : themeFormIsTemporary,
      isActive: true,
      ...(themeFormType === 'scheduled' ? {
        startDate: themeFormStartDate,
        endDate: themeFormEndDate,
      } : {}),
      ...(themeFormType === 'time_of_day' ? {
        startHour: Number(themeFormStartHour),
        endHour: Number(themeFormEndHour),
      } : {})
    };

    let updatedSchedules = [...db.themeSettings.schedules];
    if (editingScheduleId) {
      updatedSchedules = updatedSchedules.map(s => s.id === editingScheduleId ? newSchedule : s);
      setEditingScheduleId(null);
    } else {
      updatedSchedules.push(newSchedule);
    }

    db.themeSettings = {
      ...db.themeSettings,
      schedules: updatedSchedules
    };
    saveDatabase(db);
    onRefreshDb();

    // Reset Form
    setThemeFormName('');
    setThemeFormThemeId('tet');
    setThemeFormType('scheduled');
    setThemeFormStartDate('');
    setThemeFormEndDate('');
    setThemeFormStartHour(18);
    setThemeFormEndHour(6);
    setThemeFormIsTemporary(true);
  };

  const handleEditScheduleState = (s: SystemThemeSchedule) => {
    setEditingScheduleId(s.id);
    setThemeFormName(s.name);
    setThemeFormThemeId(s.themeId);
    setThemeFormType(s.type);
    setThemeFormStartDate(s.startDate || '');
    setThemeFormEndDate(s.endDate || '');
    setThemeFormStartHour(s.startHour !== undefined ? s.startHour : 18);
    setThemeFormEndHour(s.endHour !== undefined ? s.endHour : 6);
    setThemeFormIsTemporary(s.isTemporary);
  };

  const handleResetToDefaultThemes = () => {
    openCustomConfirm(
      "ĐẶT LẠI MẶC ĐỊNH THEMES",
      "Hành động này sẽ khôi phục toàn bộ danh sách hẹn giờ hệ thống về mẫu ban ngày, ban đêm, tết cổ truyền và giáng sinh mặc định. Bạn có muốn tiếp tục?",
      () => {
        db.themeSettings = {
          activeThemeId: 'light',
          schedules: [
            { id: 'sch-tet', name: 'Mừng Xuân Tết Cổ Truyền', themeId: 'tet', type: 'scheduled', startDate: '2026-01-15', endDate: '2026-02-15', isTemporary: true, isActive: true },
            { id: 'sch-mid-autumn', name: 'Trung Thu Đoàn Viên', themeId: 'mid_autumn', type: 'scheduled', startDate: '2026-09-10', endDate: '2026-10-05', isTemporary: true, isActive: true },
            { id: 'sch-christmas', name: 'Hộp Quà Giáng Sinh Diệu Kỳ', themeId: 'christmas', type: 'scheduled', startDate: '2026-12-15', endDate: '2026-12-28', isTemporary: true, isActive: true },
            { id: 'sch-halloween', name: 'Đêm Hội Bí Ngô Halloween', themeId: 'halloween', type: 'scheduled', startDate: '2026-10-25', endDate: '2026-11-01', isTemporary: true, isActive: true },
            { id: 'sch-night', name: 'Hẹn Giờ Đổi Theme Ban Đêm', themeId: 'dark', type: 'time_of_day', startHour: 18, endHour: 6, isTemporary: false, isActive: true },
            { id: 'sch-summer', name: 'Sự Kiện Mùa Hè rực rỡ', themeId: 'summer', type: 'scheduled', startDate: '2026-06-01', endDate: '2026-06-30', isTemporary: true, isActive: true }
          ]
        };
        saveDatabase(db);
        onRefreshDb();
      }
    );
  };

  const handleUpdateFallbackTheme = (themeId: string) => {
    if (!db.themeSettings) return;
    db.themeSettings = {
      ...db.themeSettings,
      activeThemeId: themeId
    };
    saveDatabase(db);
    onRefreshDb();
  };

  // --- STUDENT EDITING & SEARCH STATES ---
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentName, setEditingStudentName] = useState('');
  const [editingStudentCode, setEditingStudentCode] = useState('');
  const [editingStudentClass, setEditingStudentClass] = useState('');

  // Filtering students in the list
  const [studentsSearch, setStudentsSearch] = useState('');
  const [studentsClassFilter, setStudentsClassFilter] = useState('');

  // Selected students for batch changes
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  // Individual/Batch transfer target class selection
  const [batchTargetClass, setBatchTargetClass] = useState('');

  // Whole Class Transfer (Source class -> Destination class)
  const [sourceClassTransfer, setSourceClassTransfer] = useState('');
  const [destClassTransfer, setDestClassTransfer] = useState('');

  // Custom Modal Confirmation state to bypass standard blocking window.confirm() inside iframe
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const openCustomConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // --- HANDLERS FOR STUDENT PROFILES ---
  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId || !editingStudentName.trim() || !editingStudentClass) {
      alert("Vui lòng điền họ tên học sinh và lớp!");
      return;
    }

    const updated = [...db.users];
    const idx = updated.findIndex(u => u.id === editingStudentId);
    if (idx !== -1) {
      const oldStudent = updated[idx];
      const finalFullName = `${editingStudentName.trim()} (${editingStudentClass})`;
      
      updated[idx] = {
        ...oldStudent,
        fullName: finalFullName,
        studentCode: editingStudentCode.trim() || oldStudent.studentCode,
        adminClass: editingStudentClass,
      };

      // Ensure class exists in database adminClasses list
      if (!db.adminClasses.includes(editingStudentClass)) {
        db.adminClasses.push(editingStudentClass);
      }

      db.users = updated;
      saveDatabase(db);
      onRefreshDb();
      setEditingStudentId(null);
      alert(`Đã cập nhật học sinh thành công!`);
    }
  };

  const startEditStudent = (student: User) => {
    setEditingStudentId(student.id);
    const parts = student.fullName.split(' (');
    setEditingStudentName(parts[0]);
    setEditingStudentCode(student.studentCode || '');
    setEditingStudentClass(student.adminClass || parts[1]?.replace(')', '') || 'Lớp 5A');
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = db.users.find(u => u.id === studentId);
    const studentLabel = student ? student.fullName : 'Học sinh này';
    
    openCustomConfirm(
      "XÁC NHẬN XÓA TÀI KHOẢN HỌC SINH",
      `Bạn thật sự có chắc chắn muốn XÓA VĨNH VIỄN tài khoản học sinh [ ${studentLabel} ] khỏi EduQuest? Tất cả thông tin học bạ, điểm số học tập và vật phẩm, báu vật đang sở hữu sẽ bị xóa vĩnh viễn!`,
      () => {
        db.users = db.users.filter(u => u.id !== studentId);
        // Clean up in participant logs too
        db.participants = db.participants.filter(p => p.studentId !== studentId);
        saveDatabase(db);
        onRefreshDb();
        setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
      }
    );
  };

  // Batch move selected students
  const handleBatchChangeClass = () => {
    if (selectedStudentIds.length === 0) {
      alert("Vui lòng tích chọn ít nhất một học sinh trong danh sách ở bảng dưới!");
      return;
    }
    if (!batchTargetClass) {
      alert("Vui lòng chọn lớp hành chính đích để chuyển đoàn!");
      return;
    }

    const updated = [...db.users];
    let count = 0;
    
    updated.forEach((u, idx) => {
      if (u.role === 'student' && selectedStudentIds.includes(u.id)) {
        const cleanName = u.fullName.split(' (')[0];
        updated[idx] = {
          ...u,
          adminClass: batchTargetClass,
          fullName: `${cleanName} (${batchTargetClass})`
        };
        count++;
      }
    });

    db.users = updated;
    saveDatabase(db);
    onRefreshDb();
    setSelectedStudentIds([]);
    alert(`Chuyển lớp hàng loạt thành công: ${count} học sinh đã được dời sang lớp [${batchTargetClass}]!`);
  };

  // Mass transfer Entire Class -> Another Class
  const handleClassWideTransfer = () => {
    if (!sourceClassTransfer) {
      alert("Vui lòng chọn lớp hành chính nguồn cần dời!");
      return;
    }
    if (!destClassTransfer) {
      alert("Vui lòng chọn lớp hành chính đích nhận học sinh!");
      return;
    }
    if (sourceClassTransfer === destClassTransfer) {
      alert("Lớp nguồn và lớp đích nhận trùng lắp! Bất hợp lý.");
      return;
    }

    const updated = [...db.users];
    let count = 0;

    updated.forEach((u, idx) => {
      if (u.role === 'student' && (u.adminClass === sourceClassTransfer || u.fullName.endsWith(`(${sourceClassTransfer})`))) {
        const cleanName = u.fullName.split(' (')[0];
        updated[idx] = {
          ...u,
          adminClass: destClassTransfer,
          fullName: `${cleanName} (${destClassTransfer})`
        };
        count++;
      }
    });

    if (count === 0) {
      alert(`Không tìm thấy học sinh nào thuộc lớp ${sourceClassTransfer} để chuyển.`);
      return;
    }

    db.users = updated;
    saveDatabase(db);
    onRefreshDb();
    setSourceClassTransfer('');
    setDestClassTransfer('');
    alert(`Thuyên chuyển sĩ số toàn diện thành công! Đã chuyển ${count} học sinh từ ${sourceClassTransfer} sang ${destClassTransfer}.`);
  };

  // Count items
  const teachersCount = db.users.filter(u => u.role === 'teacher').length;
  const studentsCount = db.users.filter(u => u.role === 'student').length;
  const activeRoomsCount = db.rooms.length;
  const lockedDevicesCount = db.users.filter(u => u.role === 'student' && u.registeredDeviceId).length;

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherEmail || !teacherPass) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherEmail)) {
      alert("Email không đúng định dạng!");
      return;
    }

    const updatedUsers = [...db.users];

    if (editingTeacherId) {
      // Update
      const idx = updatedUsers.findIndex(u => u.id === editingTeacherId);
      if (idx !== -1) {
        updatedUsers[idx] = {
          ...updatedUsers[idx],
          fullName: teacherName,
          email: teacherEmail,
          passwordHash: teacherPass,
        };
      }
      setEditingTeacherId(null);
    } else {
      // Create new
      // Check duplicate email
      if (db.users.some(u => u.email?.toLowerCase() === teacherEmail.toLowerCase())) {
        alert("Email này đã tồn tại trên hệ thống!");
        return;
      }
      updatedUsers.push({
        id: 'usr-teacher-' + generateId(),
        role: 'teacher',
        fullName: teacherName,
        email: teacherEmail,
        passwordHash: teacherPass,
        isFirstLogin: true, // Forces password change on first login
        activeAvatarPath: 'default_nam.png',
        activeFramePath: null,
        activeEffectPath: null,
      });
    }

    db.users = updatedUsers;
    saveDatabase(db);
    onRefreshDb();

    // Reset Form
    setTeacherName('');
    setTeacherEmail('');
    setTeacherPass('');
  };

  const handleEditTeacher = (teacher: User) => {
    setEditingTeacherId(teacher.id);
    setTeacherName(teacher.fullName);
    setTeacherEmail(teacher.email || '');
    setTeacherPass(teacher.passwordHash || 'password123');
  };

  const handleDeleteTeacher = (id: string) => {
    const teacherUser = db.users.find(u => u.id === id);
    const teacherNameLabel = teacherUser ? teacherUser.fullName : 'Giáo viên này';
    openCustomConfirm(
      "XÁC NHẬN XÓA TÀI KHOẢN GIÁO VIÊN",
      `Bạn có chắc muốn xoá vĩnh viễn tài khoản [ ${teacherNameLabel} ] khỏi danh sách EduQuest?`,
      () => {
        db.users = db.users.filter(u => u.id !== id);
        saveDatabase(db);
        onRefreshDb();
      }
    );
  };

  // Device Lock Operations
  const handleResetDevice = (studentId: string) => {
    const updatedUsers = [...db.users];
    const idx = updatedUsers.findIndex(u => u.id === studentId);
    if (idx !== -1) {
      updatedUsers[idx].registeredDeviceId = null;
      db.users = updatedUsers;
      saveDatabase(db);
      onRefreshDb();
      alert(`Đã xoá khoá thiết bị đăng ký cho học sinh ${updatedUsers[idx].fullName} thành công!`);
    }
  };

  const handleAdminChangePassword = (userId: string) => {
    setPassFormUserId(userId);
    const userObj = db.users.find(u => u.id === userId);
    setNewPasswordValue(userObj?.passwordHash || '');
  };

  const submitAdminChangePassword = () => {
    if (!newPasswordValue) return;
    const updated = [...db.users];
    const uIdx = updated.findIndex(u => u.id === passFormUserId);
    if (uIdx !== -1) {
      updated[uIdx].passwordHash = newPasswordValue;
      db.users = updated;
      saveDatabase(db);
      onRefreshDb();
      setPassFormUserId(null);
      setNewPasswordValue('');
      alert("Thay đổi mật khẩu thành công!");
    }
  };

  // Excel template downloader using client side blob data
  const downloadTemplate = (type: 'teachers' | 'students') => {
    let csvContent = "";
    let fileName = "";
    
    if (type === 'teachers') {
      csvContent = "Họ và Tên,Email,Mật khẩu ban đầu\n" +
                   "Nguyễn Văn A,vancap1@eduquest.com,abcteacher1\n" +
                   "Trần Thị B,bichvanlv2@eduquest.com,pass555\n" +
                   "Lâm Học Sĩ,lamscholar@eduquest.com,qwerty999\n";
      fileName = "Teacher_Template.csv";
    } else {
      csvContent = "Họ và Tên,Mã Học Sinh,Lớp Hành Chính\n" +
                   "Bùi Cảnh Dương,HS-2026-101,Lớp 5A\n" +
                   "Hoàng Cẩm Tú,HS-2026-102,Lớp 5B\n" +
                   "Vũ Đức Trí,HS-2026-103,Lớp 5A\n";
      fileName = "Student_Template.csv";
    }

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Text / CSV parser that simulates scanning an excel upload block
  const handleExcelImport = () => {
    if (!excelInput.trim()) {
      alert("Vui lòng dán dữ liệu hoặc điền danh sách theo mẫu!");
      return;
    }

    const lines = excelInput.split('\n');
    const logs: { type: 'ok' | 'error'; msg: string }[] = [];
    const addedUsers: User[] = [];

    // Skip header
    const header = lines[0].toLowerCase();
    
    if (importType === 'teachers') {
      if (!header.includes("họ") && !header.includes("email") && !header.includes("mật")) {
        logs.push({ type: 'error', msg: "LỖI CẤU TRÚC: Cột không khớp với mẫu Teacher_Template.xlsx!" });
        setImportLogs(logs);
        return;
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        if (cols.length < 3) {
          logs.push({ type: 'error', msg: `Dòng ${i + 1}: Lỗi định dạng dòng thiếu cột. Bỏ qua dòng.` });
          continue;
        }

        const fullName = cols[0].trim();
        const email = cols[1].trim();
        const initialPass = cols[2].trim();

        if (!fullName || !email || !initialPass) {
          logs.push({ type: 'error', msg: `Dòng ${i + 1}: Chứa ô trống. Không thể khởi tạo.` });
          continue;
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          logs.push({ type: 'error', msg: `Dòng ${i + 1}: Email '${email}' không đúng định dạng!` });
          continue;
        }

        // Check duplicate
        if (db.users.some(u => u.email?.toLowerCase() === email.toLowerCase()) || addedUsers.some(u => u.email?.toLowerCase() === email.toLowerCase())) {
          logs.push({ type: 'error', msg: `Dòng ${i + 1}: Email '${email}' đã tồn tại trên cơ sở dữ liệu.` });
          continue;
        }

        addedUsers.push({
          id: 'usr-teacher-' + generateId(),
          role: 'teacher',
          fullName,
          email,
          passwordHash: initialPass,
          isFirstLogin: true,
          activeAvatarPath: 'default_nam.png',
          activeFramePath: null,
          activeEffectPath: null
        });

        logs.push({ type: 'ok', msg: `Dòng ${i + 1}: [Thành công] Tạo giáo viên '${fullName}' - Email: ${email}` });
      }
    } else {
      // Students
      if (!header.includes("họ") && !header.includes("mã") && !header.includes("lớp")) {
        logs.push({ type: 'error', msg: "LỖI CẤU TRÚC: Cột không khớp với mẫu Student_Template.xlsx!" });
        setImportLogs(logs);
        return;
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        if (cols.length < 3) {
          logs.push({ type: 'error', msg: `Dòng ${i + 1}: Lỗi định dạng dòng (thiếu cột).` });
          continue;
        }

        const fullName = cols[0].trim();
        const studentCode = cols[1].trim();
        const adminClass = cols[2].trim(); // administrative class is logged

        if (!fullName || !studentCode || !adminClass) {
          logs.push({ type: 'error', msg: `Dòng ${i + 1}: Chứa ô trống. Không thể khởi tạo.` });
          continue;
        }

        // Check duplicate student code
        if (db.users.some(u => u.studentCode === studentCode) || addedUsers.some(u => u.studentCode === studentCode)) {
          logs.push({ type: 'error', msg: `Dòng ${i + 1}: Mã học sinh '${studentCode}' đã tồn tại.` });
          continue;
        }

        addedUsers.push({
          id: 'usr-student-' + generateId(),
          role: 'student',
          fullName: `${fullName} (${adminClass})`,
          studentCode,
          registeredDeviceId: null, // Clean device
          activeAvatarPath: 'default_nam.png',
          activeFramePath: null,
          activeEffectPath: null,
          adminClass: adminClass
        });

        // Auto add custom imported class to classes list
        if (adminClass && !db.adminClasses.includes(adminClass)) {
          db.adminClasses.push(adminClass);
        }

        logs.push({ type: 'ok', msg: `Dòng ${i + 1}: [Thành công] Thêm học sinh '${fullName}' (${adminClass}) - Mã: ${studentCode}` });
      }
    }

    if (addedUsers.length > 0) {
      db.users = [...db.users, ...addedUsers];
      saveDatabase(db);
      onRefreshDb();
      setExcelInput('');
    }

    setImportLogs(logs);
  };

  const loadPresetSpreadsheetData = () => {
    if (importType === 'teachers') {
      setExcelInput(
        "Họ và Tên,Email,Mật khẩu ban đầu\n" +
        "Phan Thanh Giản,thanhgian@eduquest.com,pass1122\n" +
        "Lê Văn Duyệt,vanduyet@eduquest.com,pass3344"
      );
    } else {
      setExcelInput(
        "Họ và Tên,Mã Học Sinh,Lớp Hành Chính\n" +
        "Tống Duy Tân,HS-2026-444,Lớp 5C\n" +
        "Trương Vĩnh Ký,HS-2026-555,Lớp 5C"
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden" id="admin-panel">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-lg">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Khu Vực Quản Trị Tối Cao</h2>
            <p className="text-white/80 text-xs">Quản lý tài khoản toàn trường, reset khóa thiết bị và nhập danh sách Excel hàng loạt.</p>
          </div>
        </div>
      </div>

      {/* Quick stats board */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 bg-slate-50/50">
        <div className="p-4 flex flex-col justify-center border-r border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tổng Giáo viên</span>
          <span className="text-2xl font-bold text-red-600">{teachersCount}</span>
        </div>
        <div className="p-4 flex flex-col justify-center border-r border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tổng Học sinh</span>
          <span className="text-2xl font-bold text-orange-600">{studentsCount}</span>
        </div>
        <div className="p-4 flex flex-col justify-center border-r border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Số Phòng hoạt động</span>
          <span className="text-2xl font-bold text-amber-600">{activeRoomsCount}</span>
        </div>
        <div className="p-4 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Thiết bị bị khóa</span>
          <span className="text-2xl font-bold text-indigo-600">{lockedDevicesCount}</span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-slate-100 bg-white overflow-x-auto">
        <button
          onClick={() => { setActiveTab('teachers'); setImportLogs([]); }}
          className={`flex-1 min-w-[130px] py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'teachers' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          QUẢN LÝ GIÁO VIÊN
        </button>
        <button
          onClick={() => { setActiveTab('classes'); setImportLogs([]); }}
          className={`flex-1 min-w-[160px] py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'classes' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          🏫 QUẢN LÝ LỚP HÀNH CHÍNH
        </button>
        <button
          onClick={() => { setActiveTab('students'); setImportLogs([]); }}
          className={`flex-1 min-w-[130px] py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'students' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          DANH SÁCH HỌC SINH & KHÓA THIẾT BỊ
        </button>
        <button
          onClick={() => { setActiveTab('excel'); setImportLogs([]); }}
          className={`flex-1 min-w-[180px] py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'excel' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          NHẬP DỮ LIỆU EXCEL/CSV HÀNG LOẠT
        </button>
        <button
          onClick={() => { setActiveTab('themes'); setImportLogs([]); }}
          className={`flex-1 min-w-[170px] py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'themes' ? 'border-amber-600 text-amber-600 font-extrabold bg-amber-50/20' : 'border-transparent text-slate-600 hover:bg-slate-50'
          }`}
        >
          🎨 QUẢN LÝ THEME HỆ THỐNG
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'teachers' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left side: Add/Edit Form */}
            <form onSubmit={handleSaveTeacher} className="lg:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <UserPlus className="h-4 w-4 text-red-600" />
                {editingTeacherId ? "CẬP NHẬT GIÁO VIÊN" : "THÊM GIÁO VIÊN MỚI"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Họ và Tên</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Thị Bích Vân"
                    className="w-full text-xs p-2.5 rounded border border-slate-300 focus:ring-1 focus:ring-red-400 focus:outline-none bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={teacherEmail}
                    onChange={e => setTeacherEmail(e.target.value)}
                    placeholder="email@tranthichuan.com"
                    className="w-full text-xs p-2.5 rounded border border-slate-300 focus:ring-1 focus:ring-red-400 focus:outline-none bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Mật khẩu {editingTeacherId ? "(Mới)" : "mặc định ban đầu"}
                  </label>
                  <input
                    type="text"
                    value={teacherPass}
                    onChange={e => setTeacherPass(e.target.value)}
                    placeholder="Mật khẩu tạm thời đăng nhập lần đầu"
                    className="w-full text-xs p-2.5 rounded border border-slate-300 focus:ring-1 focus:ring-red-400 focus:outline-none bg-white font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Giáo viên bắt buộc phải đổi mật khẩu lúc đăng nhập lần đầu tiên.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white font-bold text-xs py-2.5 rounded hover:bg-red-700 transition"
                  >
                    {editingTeacherId ? "CẬP NHẬT" : "THÊM TÀI KHOẢN"}
                  </button>
                  {editingTeacherId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTeacherId(null);
                        setTeacherName('');
                        setTeacherEmail('');
                        setTeacherPass('');
                      }}
                      className="bg-slate-300 text-slate-700 font-bold text-xs px-3 rounded hover:bg-slate-400"
                    >
                      HỦY
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Right side: Teachers List */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                Danh sách Giáo viên ({teachersCount})
              </h3>
              
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-150 text-slate-600 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Họ và Tên</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Mật khẩu lưu trữ</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {db.users
                      .filter(u => u.role === 'teacher')
                      .map(teacher => (
                        <tr key={teacher.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold">{teacher.fullName}</td>
                          <td className="p-3 font-mono">{teacher.email}</td>
                          <td className="p-3">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-600">
                              {teacher.passwordHash}
                            </span>
                            {teacher.isFirstLogin && (
                              <span className="ml-1 text-[9px] bg-red-100 text-red-700 px-1 rounded font-bold">
                                Chờ Đổi
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right flex justify-end gap-1">
                            <button
                              onClick={() => handleEditTeacher(teacher)}
                              className="bg-amber-100 text-amber-800 hover:bg-amber-200 p-1 rounded font-bold text-[11px]"
                              title="Chỉnh sửa thông tin"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              className="bg-red-105 bg-red-100 text-red-800 hover:bg-red-200 p-1 rounded font-bold text-[11px]"
                              title="Xoá vĩnh viễn"
                            >
                              Xoá
                            </button>
                          </td>
                        </tr>
                      ))}
                    {teachersCount === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400">
                          Chưa có giáo viên nào trong danh mục.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex sm:items-center justify-between gap-4 max-sm:flex-col border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-850 text-sm flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-red-600 animate-bounce" />
                  HỒ SƠ HỌC SINH & CHUYỂN LỚP HÀNG LOẠT
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kiểm soát sĩ số lớp hành chính, tinh chỉnh thông tin hiển thị cá nhân và thuyên chuyển lớp học bạ toàn diện.
                </p>
              </div>
            </div>

            {/* A. DYNAMIC INDIVIDUAL EDIT FORM CONTAINER */}
            {editingStudentId && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-4">
                  <h3 className="font-black text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Edit className="h-4 w-4 text-amber-700 animate-pulse" />
                    Chỉnh sửa thông tin cá nhân học sinh
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setEditingStudentId(null)}
                    className="text-amber-805 hover:bg-amber-100 p-1 rounded-full text-xs font-bold"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={handleSaveStudentEdit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">Họ và Tên Hiển Thị</label>
                    <input
                      type="text"
                      value={editingStudentName}
                      onChange={e => setEditingStudentName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Cảnh Dương"
                      className="w-full text-xs p-2.5 rounded border border-amber-300 focus:outline-none bg-white font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">Mã Học Sinh</label>
                    <input
                      type="text"
                      value={editingStudentCode}
                      onChange={e => setEditingStudentCode(e.target.value)}
                      placeholder="HS-2026-X"
                      className="w-full text-xs p-2.5 rounded border border-amber-300 focus:outline-none bg-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-650 uppercase mb-1">Lớp Hành chính</label>
                    <select
                      value={editingStudentClass}
                      onChange={e => setEditingStudentClass(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-amber-300 focus:outline-none bg-white font-medium"
                      required
                    >
                      {db.adminClasses && db.adminClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                      <option value="Khác">Lớp Hành chính Khác...</option>
                    </select>
                  </div>
                  {editingStudentClass === 'Khác' && (
                    <div className="md:col-span-3 bg-amber-100/50 p-2.5 rounded border border-amber-200 mt-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nhập Lớp Mới trực tiếp</label>
                      <input
                        type="text"
                        placeholder="Gõ ví dụ: Lớp 5D, Lớp 11A..."
                        className="w-full text-xs p-2 rounded border border-amber-300 bg-white"
                        onBlur={(e) => {
                          const val = e.target.value.trim();
                          if (val) {
                            setEditingStudentClass(val);
                          }
                        }}
                      />
                    </div>
                  )}
                  <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-amber-200/50">
                    <button
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded shadow transition"
                    >
                      CẬP NHẬT HỒ SƠ
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStudentId(null)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-4 py-2 rounded transition"
                    >
                      BỎ QUA
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* B. BATCH OPERATIONS CONTROL DECK */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 p-5 rounded-xl">
              
              {/* Batch Action #1 - Move Selected Students */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">Cách 1</span>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Chuyển lớp cho học sinh đã tích chọn</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tích chọn học sinh mong muốn trong bảng danh sách phía dưới, sau đó chọn lớp hành chính mới bên dưới để thuyên chuyển đồng loạt.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex shadow-sm rounded border border-slate-300 bg-white divide-x">
                    <span className="text-[11px] px-2.5 py-1.5 bg-slate-100 text-slate-650 font-bold">
                      Đã chọn: {selectedStudentIds.length} HS
                    </span>
                    <select
                      value={batchTargetClass}
                      onChange={e => setBatchTargetClass(e.target.value)}
                      className="text-xs px-2.5 py-1.5 focus:outline-none bg-white font-medium"
                    >
                      <option value="">-- Chọn lớp đích --</option>
                      {db.adminClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleBatchChangeClass}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded transition flex items-center gap-1 shadow-sm"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Chuyển Lớp Cho {selectedStudentIds.length} HS
                  </button>
                </div>
              </div>

              {/* Batch Action #2 - Move All Class To Another Class */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">Cách 2</span>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Di dời sĩ số Toàn bộ lớp hành chính</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Chuyển nhanh tệp học sinh của một lớp này sang một lớp khác (Ví dụ lên lớp, gộp lớp, dời lớp).
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex shadow-sm rounded border border-slate-300 bg-white items-center text-xs">
                    <select
                      value={sourceClassTransfer}
                      onChange={e => setSourceClassTransfer(e.target.value)}
                      className="px-2 py-1.5 focus:outline-none bg-white font-medium"
                    >
                      <option value="">Lớp Nguồn...</option>
                      {db.adminClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <span className="px-1 text-slate-400">➔</span>
                    <select
                      value={destClassTransfer}
                      onChange={e => setDestClassTransfer(e.target.value)}
                      className="px-2 py-1.5 focus:outline-none bg-white font-medium"
                    >
                      <option value="">Lớp Đích...</option>
                      {db.adminClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleClassWideTransfer}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded transition flex items-center gap-1 shadow"
                  >
                    Bắt đầu Di Dời Sĩ Số
                  </button>
                </div>
              </div>

            </div>

            {/* C. SEARCH AND FILTERS TOOLBAR */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
              <div className="w-full md:w-1/2 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh tên học sinh hoặc mã học sinh..."
                  value={studentsSearch}
                  onChange={e => setStudentsSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-none bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="w-full md:w-auto flex items-center gap-2 justify-end self-end">
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1 shrink-0">
                  <Filter className="h-3.5 w-3.5" />
                  Lọc Sĩ Số:
                </span>
                <select
                  value={studentsClassFilter}
                  onChange={e => {
                    setStudentsClassFilter(e.target.value);
                    setSelectedStudentIds([]);
                  }}
                  className="text-xs p-2 border border-slate-300 rounded bg-white font-medium"
                >
                  <option value="">Tất cả học sinh ({studentsCount} HS)</option>
                  {db.adminClasses.map(cls => {
                    const count = db.users.filter(u => u.role === 'student' && (u.adminClass === cls || u.fullName.endsWith(`(${cls})`))).length;
                    return (
                      <option key={cls} value={cls}>{cls} ({count} học sinh)</option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* D. STUDENTS TABLE */}
            <div className="overflow-x-auto border border-slate-150 rounded-lg bg-white shadow-sm">
              <table className="w-full text-left text-xs table-auto">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-600 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          db.users.filter(u => u.role === 'student').length > 0 &&
                          db.users
                            .filter(u => u.role === 'student')
                            .filter(student => {
                              const cleanName = student.fullName.toLowerCase();
                              const code = (student.studentCode || '').toLowerCase();
                              const searchLower = studentsSearch.toLowerCase();
                              const matchesSearch = cleanName.includes(searchLower) || code.includes(searchLower);
                              if (!studentsClassFilter) return matchesSearch;
                              return matchesSearch && (student.adminClass === studentsClassFilter || student.fullName.endsWith(`(${studentsClassFilter})`));
                            })
                            .every(s => selectedStudentIds.includes(s.id))
                        }
                        onChange={() => {
                          const visibleStudents = db.users
                            .filter(u => u.role === 'student')
                            .filter(student => {
                              const cleanName = student.fullName.toLowerCase();
                              const code = (student.studentCode || '').toLowerCase();
                              const searchLower = studentsSearch.toLowerCase();
                              const matchesSearch = cleanName.includes(searchLower) || code.includes(searchLower);
                              if (!studentsClassFilter) return matchesSearch;
                              return matchesSearch && (student.adminClass === studentsClassFilter || student.fullName.endsWith(`(${studentsClassFilter})`));
                            });
                          const visibleIds = visibleStudents.map(s => s.id);
                          const allVisibleSelected = visibleIds.every(id => selectedStudentIds.includes(id));
                          
                          if (allVisibleSelected) {
                            setSelectedStudentIds(prev => prev.filter(id => !visibleIds.includes(id)));
                          } else {
                            setSelectedStudentIds(prev => Array.from(new Set([...prev, ...visibleIds])));
                          }
                        }}
                        className="rounded text-red-650 focus:ring-red-400 cursor-pointer"
                        title="Chọn tất cả học sinh đang hiển thị"
                      />
                    </th>
                    <th className="p-3">Họ và tên học sinh</th>
                    <th className="p-3 text-center">Lớp hành chính</th>
                    <th className="p-3">Mã Học sinh</th>
                    <th className="p-3">Mật khẩu lưu trữ</th>
                    <th className="p-3">Khóa thiết bị</th>
                    <th className="p-3 text-right">Lệnh Đặc Quyền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.users
                    .filter(u => u.role === 'student')
                    .filter(student => {
                      const cleanName = student.fullName.toLowerCase();
                      const code = (student.studentCode || '').toLowerCase();
                      const searchLower = studentsSearch.toLowerCase();
                      const matchesSearch = cleanName.includes(searchLower) || code.includes(searchLower);
                      if (!studentsClassFilter) return matchesSearch;
                      return matchesSearch && (student.adminClass === studentsClassFilter || student.fullName.endsWith(`(${studentsClassFilter})`));
                    })
                    .map(student => {
                      const isLocked = !!student.registeredDeviceId;
                      const parts = student.fullName.split(' (');
                      const cleanNameCustom = parts[0];
                      const clsBadgeCustom = student.adminClass || parts[1]?.replace(')', '') || 'Chưa gán';
                      const isChecked = selectedStudentIds.includes(student.id);

                      return (
                        <tr 
                          key={student.id} 
                          className={`hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-red-50/20' : ''}`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedStudentIds(prev => 
                                  prev.includes(student.id) ? prev.filter(x => x !== student.id) : [...prev, student.id]
                                );
                              }}
                              className="rounded text-red-650 focus:ring-red-400 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 font-semibold text-slate-800">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900">{cleanNameCustom}</span>
                              <span className="text-[10px] text-slate-400 block font-normal">
                                Tên gốc: {student.fullName}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-amber-100/80 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-tight inline-block">
                              🏫 {clsBadgeCustom}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-600 font-bold">{student.studentCode}</td>
                          <td className="p-3">
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px] border border-slate-200 text-slate-600">
                              {student.passwordHash}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-500">
                            {student.registeredDeviceId ? (
                              student.registeredDeviceId === 'dev-chrome-windows' ? (
                                <span className="text-red-600 font-extrabold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                                  Chrome Win11
                                </span>
                              ) : (
                                <span className="text-red-650 font-bold">{student.registeredDeviceId}</span>
                              )
                            ) : (
                              <span className="text-slate-400 italic">Mở</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex gap-1.5 items-center">
                              <button
                                onClick={() => startEditStudent(student)}
                                className="text-amber-805 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded font-bold text-[10px] transition"
                                title="Sửa thông tin học sinh"
                              >
                                Sửa
                              </button>
                              {isLocked ? (
                                <button
                                  onClick={() => handleResetDevice(student.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded text-[10px] transition flex items-center gap-1 font-semibold"
                                  title="Giải phóng khóa liên kết máy tính"
                                >
                                  <RefreshCw className="h-3 w-3 animate-spin duration-1000" />
                                  Reset Máy
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[10px] italic pr-1">Bảo vệ</span>
                              )}
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-slate-400 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
                                title="Xóa học sinh khỏi cơ sở dữ liệu"
                              >
                                <Trash className="h-3.5 w-3.5 shrink-0" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {db.users.filter(u => u.role === 'student').length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                        Chưa có học sinh nào. Hãy thêm qua bảng Excel hoặc Import dữ liệu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'excel' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tải File Excel Mẫu Trực Tiếp</h4>
                <p className="text-xs text-slate-500 mt-1">Xây dựng dữ liệu đúng quy chuẩn hai dòng mẫu trong các biểu bảng Excel để tránh lỗi dòng.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadTemplate('teachers')}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs px-3 py-2 rounded flex items-center gap-1.5 transition"
                >
                  <FileDown className="h-4 w-4" />
                  Mẫu Giáo Viên (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => downloadTemplate('students')}
                  className="bg-orange-600 text-white hover:bg-orange-700 font-bold text-xs px-3 py-2 rounded flex items-center gap-1.5 transition"
                >
                  <FileDown className="h-4 w-4" />
                  Mẫu Học Sinh (.xlsx)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Import Form */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Cấu hình Đích Nhập:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setImportType('teachers'); setImportLogs([]); }}
                      className={`px-3 py-1 text-xs rounded-full font-bold ${
                        importType === 'teachers' ? 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Giáo Viên
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImportType('students'); setImportLogs([]); }}
                      className={`px-3 py-1 text-xs rounded-full font-bold ${
                        importType === 'students' ? 'bg-orange-100 text-orange-850 ring-1 ring-orange-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Học Sinh
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">
                      Nội dung Dữ liệu Tải lên (Đột Phá CSV / Paste Copy)
                    </label>
                    <button
                      type="button"
                      onClick={loadPresetSpreadsheetData}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Điền nhanh Dữ liệu Thử nghiệm
                    </button>
                  </div>
                  <textarea
                    value={excelInput}
                    onChange={e => setExcelInput(e.target.value)}
                    placeholder={
                      importType === 'teachers'
                        ? "Họ và Tên,Email,Mật khẩu ban đầu\nTrần Văn X,teacherX@school.edu.vn,123456"
                        : "Họ và Tên,Mã Học Sinh,Lớp Hành Chính\nTống Đức Hải,HS-2026-666,Lớp 5A"
                    }
                    className="w-full h-44 text-xs p-3 rounded border border-slate-300 font-mono focus:ring-1 focus:ring-red-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Định vị theo dấu phẩy (CSV) để biểu diễn cột. Dòng đầu tiên là tiêu đề bắt buộc.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExcelImport}
                  className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-lg hover:bg-slate-800 flex items-center justify-center gap-1.5 shadow transition"
                >
                  <Upload className="h-4 w-4" />
                  Xác Thực Dữ liệu & Đẩy vào Cơ Sở Dữ Liệu
                </button>
              </div>

              {/* Import outputs */}
              <div className="lg:col-span-2 space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest block">
                  Trình Nhật ký Quét lỗi dòng:
                </span>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 h-64 overflow-y-auto space-y-2 font-mono text-[11px]">
                  {importLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border leading-relaxed flex items-start gap-1.5 ${
                        log.type === 'ok'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-150'
                          : 'bg-red-50 text-red-800 border-red-150'
                      }`}
                    >
                      {log.type === 'ok' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <span>{log.msg}</span>
                    </div>
                  ))}
                  {importLogs.length === 0 && (
                    <div className="text-slate-400 text-center py-16 italic">
                      Dán dữ liệu hoặc nhấn "Điền nhanh" và nhấn "Xác thực" để chạy bộ đọc.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column: Form and Class List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5 border-b border-slate-150 pb-2">
                    <UserPlus className="h-4 w-4 text-red-600" />
                    ĐĂNG KÝ LỚP MỚI
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tên Lớp Hành chính</label>
                      <div className="flex gap-2">
                        <input
                          id="new-class-input"
                          type="text"
                          placeholder="Ví dụ: Lớp 5D, Lớp 12A..."
                          className="flex-1 text-xs p-2.5 rounded border border-slate-300 focus:outline-none bg-white font-medium"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.currentTarget;
                              const val = input.value.trim();
                              if (val) {
                                if (db.adminClasses.includes(val)) {
                                  alert("Lớp hành chính này đã tồn tại!");
                                  return;
                                }
                                db.adminClasses.push(val);
                                onRefreshDb();
                                input.value = '';
                                alert(`Đã đăng ký lớp ${val} vào danh bạ!`);
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('new-class-input') as HTMLInputElement;
                            const val = input?.value.trim();
                            if (!val) {
                              alert("Vui lòng nhập tên lớp!");
                              return;
                            }
                            if (db.adminClasses.includes(val)) {
                              alert("Lớp hành chính này đã tồn tại!");
                              return;
                            }
                            db.adminClasses.push(val);
                            onRefreshDb();
                            if (input) input.value = '';
                            alert(`Đã đăng ký lớp ${val} vào danh bạ!`);
                          }}
                          className="bg-red-650 text-white font-bold text-xs px-4 py-2.5 rounded hover:bg-red-700 transition"
                        >
                          Đăng Ký
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block leading-tight">
                        * Nhấn Enter hoặc Đăng ký để chèn lớp vào danh bạ quốc gia EduQuest.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Class directory cards */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Danh Sách Thư Mục Lớp ({db.adminClasses.length})
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {db.adminClasses.map(cls => {
                      // Sĩ số
                      const classStudents = db.users.filter(u => u.role === 'student' && (u.adminClass === cls || u.fullName.endsWith(`(${cls})`)));
                      // Associated rooms
                      const associatedRooms = db.rooms.filter(r => r.adminClass === cls || r.roomName.endsWith(cls) || r.roomName.includes(`- ${cls}`));
                      
                      return (
                        <div
                          key={cls}
                          className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 text-sm">{cls}</span>
                            <div className="text-[10.5px] text-slate-500 font-medium flex items-center gap-2">
                              <span>Sĩ số: <strong className="text-orange-600">{classStudents.length} HS</strong></span>
                              <span>•</span>
                              <span>Số phòng: <strong className="text-indigo-600">{associatedRooms.length} phòng</strong></span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                openCustomConfirm(
                                  "XÓA LỚP HÀNH CHÍNH",
                                  `Bạn muốn xóa lớp '${cls}' khỏi danh mục? (Học sinh cũ thuộc lớp này sẽ không bị xóa mà chỉ mất liên kết lớp hành chính)`,
                                  () => {
                                    db.adminClasses = db.adminClasses.filter(c => c !== cls);
                                    saveDatabase(db);
                                    onRefreshDb();
                                  }
                                );
                              }}
                              className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                              title="Xóa lớp hành chính"
                            >
                              <Trash className="h-4 w-4 shrink-0 text-slate-400 hover:text-red-600" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Students of selected Classes & connectedRooms */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-150 pb-2">
                    Kiểm Tra Thống Kê Học Sinh & Phòng Theo Lớp
                  </h3>

                  <div className="space-y-4">
                    {db.adminClasses.map(cls => {
                      const classStudents = db.users.filter(u => u.role === 'student' && (u.adminClass === cls || u.fullName.endsWith(`(${cls})`)));
                      const associatedRooms = db.rooms.filter(r => r.adminClass === cls || r.roomName.endsWith(cls) || r.roomName.includes(`- ${cls}`));

                      return (
                        <div key={cls} className="bg-white border border-slate-200 p-4 rounded-lg space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold">
                            <span className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                              🏫 {cls} <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold ml-1">{classStudents.length} Học Sinh</span>
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-mono">Quản Trị Học Bạ</span>
                          </div>

                          {/* List of rooms created for this class */}
                          <div className="text-xs">
                            <span className="font-bold text-slate-500 block mb-1 uppercase text-[10px]">Phòng giảng đã mở cho {cls}:</span>
                            {associatedRooms.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {associatedRooms.map(r => (
                                  <span key={r.id} className="bg-indigo-50 border border-indigo-150 text-indigo-850 px-2 py-1 rounded inline-flex items-center gap-1 font-semibold text-[11px]">
                                    📂 {r.roomName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px] block">Chưa giáo viên nào mở phòng học cho lớp này.</span>
                            )}
                          </div>

                          {/* Student names in this class */}
                          <div className="text-xs">
                            <span className="font-bold text-slate-550 block mb-1 uppercase text-[10px]">Danh sách học sinh hành chính:</span>
                            {classStudents.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                                {classStudents.map(student => (
                                  <div key={student.id} className="bg-slate-50 px-2.5 py-1.5 rounded flex items-center justify-between border border-slate-100">
                                    <span className="font-medium text-slate-800">{student.fullName.split(' (')[0]}</span>
                                    <span className="font-mono text-slate-400 text-[10px] bg-white px-1 py-0.5 rounded border">{student.studentCode}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px] block">Chưa có học sinh nào được gán vào lớp này. Thêm học sinh bằng Excel ở tab trên!</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="space-y-6" id="themes-management-tab">
            <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500 animate-spin-slow" />
                  Quản Lý Theme Hệ Thống & Hẹn Giờ Ngày Lễ
                </h3>
                <p className="text-xs text-slate-550 mt-0.5">
                  Thiết lập tự động thay đổi giao diện theo khung giờ, mùa sự kiện, hoặc các ngày lễ hội (Tết, Giáng Sinh, Trung Thu) toàn trường học.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaultThemes}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs py-2 px-3.5 rounded-lg border border-slate-200 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  ĐẶT LẠI MẶC ĐỊNH THEMES
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Form panel (left) */}
              <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2.5">
                  <Settings className="h-4 w-4 text-amber-650" />
                  {editingScheduleId ? "HIỆU CHỈNH QUY TẮC" : "THÊM LỊCH SỰ KIỆN THEME"}
                </h4>

                <form onSubmit={handleSaveThemeSchedule} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tên Ngày Lễ / Sự Kiện</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 rounded border border-slate-350 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-medium text-slate-800"
                      placeholder="Ví dụ: Tết Nguyên Đán, Giờ Đi Ngủ, Giáng Sinh..."
                      value={themeFormName}
                      onChange={e => setThemeFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Giao diện áp dụng</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'light', label: '🌅 Ban Ngày (Light)', colorClass: 'border-sky-300 bg-sky-50 text-sky-900 font-bold' },
                        { id: 'dark', label: '🌌 Ban Đêm (Night)', colorClass: 'border-slate-800 bg-slate-905 text-slate-100 font-bold' },
                        { id: 'tet', label: '🧧 Mừng Xuân Tết', colorClass: 'border-red-400 bg-red-105 text-red-900 font-bold' },
                        { id: 'mid_autumn', label: '🏮 Trung Thu Đoàn Viên', colorClass: 'border-amber-400 bg-amber-55 text-amber-950 font-bold' },
                        { id: 'christmas', label: '🎄 Giáng Sinh Tuyết', colorClass: 'border-emerald-500 bg-emerald-55 text-emerald-900 font-bold' },
                        { id: 'summer', label: '🏝️ Mùa Hè Rực Rỡ', colorClass: 'border-teal-400 bg-teal-55 text-teal-900 font-bold' },
                        { id: 'halloween', label: '🎃 Halloween Ma Quái', colorClass: 'border-orange-400 bg-orange-105 text-orange-950 font-bold' }
                      ].map(themeOpt => (
                        <button
                          key={themeOpt.id}
                          type="button"
                          onClick={() => setThemeFormThemeId(themeOpt.id)}
                          className={`p-2 rounded-lg border text-[10.5px] text-left transition-all flex items-center gap-1.5 ${themeOpt.colorClass} ${
                            themeFormThemeId === themeOpt.id ? 'ring-2 ring-amber-500 scale-102' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-current" />
                          <span className="truncate">{themeOpt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Hình Thức Hẹn Giờ</label>
                    <div className="flex bg-slate-100 rounded-lg p-1 border">
                      <button
                        type="button"
                        onClick={() => setThemeFormType('scheduled')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                          themeFormType === 'scheduled' ? 'bg-white text-slate-850 shadow' : 'text-slate-550'
                        }`}
                      >
                        📅 Ngày lễ cố định
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeFormType('time_of_day')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                          themeFormType === 'time_of_day' ? 'bg-white text-slate-850 shadow' : 'text-slate-555'
                        }`}
                      >
                        🕒 Khung giờ ngày
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeFormType('always')}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                          themeFormType === 'always' ? 'bg-white text-slate-850 shadow' : 'text-slate-555'
                        }`}
                      >
                        ⚡ Luôn áp dụng
                      </button>
                    </div>
                  </div>

                  {themeFormType === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-205 text-slate-800">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Từ năm-tháng-ngày</label>
                        <input
                          type="date"
                          value={themeFormStartDate}
                          onChange={e => setThemeFormStartDate(e.target.value)}
                          className="w-full text-xs p-1.5 rounded border focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tới năm-tháng-ngày</label>
                        <input
                          type="date"
                          value={themeFormEndDate}
                          onChange={e => setThemeFormEndDate(e.target.value)}
                          className="w-full text-xs p-1.5 rounded border focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {themeFormType === 'time_of_day' && (
                    <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-205 text-slate-800">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giờ bắt đầu (0-23)</label>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={themeFormStartHour}
                          onChange={e => setThemeFormStartHour(Math.min(23, Math.max(0, Number(e.target.value))))}
                          className="w-full text-xs p-1.5 rounded border focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giờ kết thúc (0-23)</label>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={themeFormEndHour}
                          onChange={e => setThemeFormEndHour(Math.min(23, Math.max(0, Number(e.target.value))))}
                          className="w-full text-xs p-1.5 rounded border focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {themeFormType !== 'always' && (
                    <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-slate-205 text-slate-800">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Theme Có Thời Hạn</span>
                        <span className="text-[10px] text-slate-450 block">Hết sự kiện sẽ tự hồi phục theme cũ.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={themeFormIsTemporary}
                        onChange={e => setThemeFormIsTemporary(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-slate-350 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      {editingScheduleId ? "CẬP NHẬT QUY TẮC" : "LƯU TRÊN HỆ THỐNG"}
                    </button>
                    {editingScheduleId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingScheduleId(null);
                          setThemeFormName('');
                          setThemeFormThemeId('tet');
                          setThemeFormType('scheduled');
                          setThemeFormStartDate('');
                          setThemeFormEndDate('');
                          setThemeFormStartHour(18);
                          setThemeFormEndHour(6);
                          setThemeFormIsTemporary(true);
                        }}
                        className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-xs px-3.5 rounded-lg transition cursor-pointer"
                      >
                        HỦY
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Status & Rules List Table (right side) */}
              <div className="lg:col-span-3 space-y-5">
                {/* Fallback settings */}
                <div className="bg-white border border-slate-205 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-slate-800">
                  <div>
                    <h5 className="font-bold text-xs text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
                      <Sun className="h-4 w-4 text-sky-500 animate-pulse" />
                      Theme Mặc Định Toàn Khoa (Fallback)
                    </h5>
                    <p className="text-[11px] text-slate-450">Tự động kích hoạt khi không có rule sự kiện hay khung giờ nào khớp.</p>
                  </div>
                  <select
                    className="text-xs font-bold border border-slate-300 p-2 rounded-lg bg-slate-50 focus:outline-none text-slate-800 cursor-pointer"
                    value={db.themeSettings?.activeThemeId || 'light'}
                    onChange={e => handleUpdateFallbackTheme(e.target.value)}
                  >
                    <option value="light">🌅 Thiên Thanh Ban Ngày (Mặc Định)</option>
                    <option value="dark">🌌 Huyền Bí Ban Đêm</option>
                    <option value="tet">🧧 Mừng Xuân Tết Cổ Truyền</option>
                    <option value="mid_autumn">🏮 Trung Thu Rằm Tháng Tám</option>
                    <option value="christmas">🎄 Giáng Sinh Ấm Áp</option>
                    <option value="summer">🏝️ Mùa Hè Tuyệt Vời</option>
                    <option value="halloween">🎃 Bí Ngô Halloween</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-xs text-slate-550 uppercase tracking-wider">
                    DANH SÁCH LỊCH HẸN GIỜ ({db.themeSettings?.schedules?.length || 0})
                  </h5>

                  <div className="overflow-x-auto border border-slate-150 rounded-xl bg-white shadow-sm text-slate-800">
                    <table className="w-full text-left text-xs table-auto">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px]">
                        <tr>
                          <th className="p-3.5 pl-4">Lễ Hội / Sự Kiện</th>
                          <th className="p-3.5">Style Theme</th>
                          <th className="p-3.5">Hẹn Giờ Chi Tiết</th>
                          <th className="p-3.5">Loại Hạn</th>
                          <th className="p-3.5">Trạng Thái</th>
                          <th className="p-3.5 pr-4 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {db.themeSettings?.schedules?.map(sched => {
                          const now = new Date();
                          const chour = now.getHours();
                          const year = now.getFullYear();
                          const month = String(now.getMonth() + 1).padStart(2, '0');
                          const day = String(now.getDate()).padStart(2, '0');
                          const cDateStr = `${year}-${month}-${day}`;

                          let isTimingMatched = false;
                          if (sched.isActive) {
                            if (sched.type === 'scheduled' && sched.startDate && sched.endDate) {
                              isTimingMatched = cDateStr >= sched.startDate && cDateStr <= sched.endDate;
                            } else if (sched.type === 'time_of_day' && sched.startHour !== undefined && sched.endHour !== undefined) {
                              if (sched.startHour > sched.endHour) {
                                isTimingMatched = chour >= sched.startHour || chour < sched.endHour;
                              } else {
                                isTimingMatched = chour >= sched.startHour && chour < sched.endHour;
                              }
                            } else if (sched.type === 'always') {
                              isTimingMatched = true;
                            }
                          }

                          return (
                            <tr key={sched.id} className={`hover:bg-slate-50/50 transition-colors ${isTimingMatched ? 'bg-amber-50/35 font-medium' : ''}`}>
                              <td className="p-3 pl-4">
                                <span className="font-bold text-slate-850 text-[11.5px] block">{sched.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono italic">Mã lỗi: {sched.id}</span>
                              </td>
                              <td className="p-3">
                                {sched.themeId === 'light' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100/80 text-sky-850 border border-sky-200">🌅 Sáng (Light)</span>}
                                {sched.themeId === 'dark' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-slate-100 border border-slate-700">🌌 Đêm (Dark)</span>}
                                {sched.themeId === 'tet' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-200">🧧 Mừng Xuân Tết</span>}
                                {sched.themeId === 'mid_autumn' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-105 text-yellow-950 border border-yellow-250">🏮 Rằm Trung Thu</span>}
                                {sched.themeId === 'christmas' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">🎄 Giáng Sinh</span>}
                                {sched.themeId === 'summer' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200">🏝️ Mùa Hè rực rỡ</span>}
                                {sched.themeId === 'halloween' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-950 border border-orange-200">🎃 Halloween</span>}
                              </td>
                              <td className="p-3 font-mono text-[10.5px]">
                                {sched.type === 'scheduled' && (
                                  <div className="flex items-center gap-1 text-[10px] text-slate-650 bg-slate-100 px-1.5 py-0.5 rounded w-fit border">
                                    <Calendar className="h-3 w-3 text-slate-500" />
                                    <span>{sched.startDate} ➔ {sched.endDate}</span>
                                  </div>
                                )}
                                {sched.type === 'time_of_day' && (
                                  <div className="flex items-center gap-1 text-[10px] text-slate-655 bg-slate-100 px-1.5 py-0.5 rounded w-fit border">
                                    <Clock className="h-3 w-3 text-slate-500" />
                                    <span>{sched.startHour}:00 ➔ {sched.endHour}:00</span>
                                  </div>
                                )}
                                {sched.type === 'always' && (
                                  <span className="text-[10px] text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded font-extrabold border border-indigo-200">Luôn bật</span>
                                )}
                              </td>
                              <td className="p-3">
                                {sched.isTemporary ? (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-lg border border-amber-200">
                                    Có thời hạn
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                                    Vô thời hạn
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col gap-1 items-start">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSchedule(sched.id)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                      sched.isActive
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-slate-150 text-slate-500 border border-slate-200'
                                    }`}
                                  >
                                    {sched.isActive ? 'Bật kích hoạt' : 'Đã khóa'}
                                  </button>

                                  {isTimingMatched && (
                                    <span className="text-[8.5px] bg-rose-600 text-yellow-300 border border-rose-400 font-extrabold px-1.5 py-0.5 rounded-full uppercase animate-pulse flex items-center gap-0.5 mt-0.5">
                                      ✨ HIỆN HÀNH
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 pr-4 text-right flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditScheduleState(sched)}
                                  className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer"
                                  title="Chỉnh sửa quy tắc"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSchedule(sched.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                                  title="Xóa quy tắc"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {(!db.themeSettings?.schedules || db.themeSettings.schedules.length === 0) && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                              Chưa có bất kỳ quy tắc đổi Theme tự động nào được đăng ký. Nhấn 'Đặt lại mặc định' để thêm nhanh.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5">
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider leading-none">{confirmState.title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold mb-6">
                {confirmState.message}
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                  className="px-3.5 py-2 text-[11px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmState.onConfirm}
                  className="px-3.5 py-2 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
                >
                  Đồng ý xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
