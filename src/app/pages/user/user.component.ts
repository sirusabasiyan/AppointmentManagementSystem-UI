import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/Core/Services/user.service';
import { RoleService } from 'src/app/Core/Services/role.service';
import { TableColumn } from 'src/app/shared/generic-table/generic-table.Model';
import { MessageService } from 'primeng/api';
import { User } from 'src/app/models/user.model';
import { Role } from 'src/app/models/role.model';
import { UserFormComponent } from './UserFormComponent/user-form.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: false
})
export class UserComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  selectedUser: User | null = null;
  isLoading: boolean = false;

  formMode: 'create' | 'edit' = 'create';
  @ViewChild('userFormComp') userFormComp!: UserFormComponent;


  columns: TableColumn[] = [
    { key: 'fullName', header: 'نام و نام خانوادگی', align: 'end' },
    { key: 'mobile', header: 'شماره همراه (نام کاربری)', width: '150px', align: 'center' },
    { key: 'nationalCode', header: 'کد ملی', width: '120px', align: 'center' },
    { key: 'roles', header: 'نقش‌ها', width: '170px', align: 'center' },
    { key: 'isActive', header: 'وضعیت', width: '100px', align: 'center' },
    { key: 'actions', header: 'عملیات', width: '110px', align: 'center' }
  ];

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

openCreateModal(): void {
  this.formMode = 'create';
  this.selectedUser = null;
  this.userFormComp?.openForCreate();
}

openEditModal(user: User): void {
  this.formMode = 'edit';
  this.selectedUser = { ...user };
  this.userFormComp?.openForEdit(user);
}

onFormSaved(): void {
  this.loadUsers();
  const msg = this.formMode === 'create' ? 'کاربر جدید با موفقیت ثبت شد.' : 'اطلاعات کاربر با موفقیت ویرایش شد.';
  this.showSuccess(msg);
}


  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: (res) => {
        this.users = res.map(u => ({
          ...u,
          fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim()
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('خطا در دریافت لیست کاربران');
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (res) => (this.roles = res),
      error: () => this.showError('خطا در بارگذاری لیست نقش‌ها')
    });
  }

  onCreated(): void {
    this.loadUsers();
    this.showSuccess('کاربر جدید با موفقیت ثبت شد.');
  }

  onUpdated(): void {
    this.loadUsers();
    this.showSuccess('اطلاعات کاربر با موفقیت ویرایش شد.');
  }

  deleteUser(item: User): void {
    const id = item.guid;
    if (!id) return;

    const confirmed = confirm(`آیا از حذف کاربر «${item.fullName || item.mobile}» مطمئن هستید؟`);
    if (!confirmed) return;

    this.userService.delete(id).subscribe({
      next: () => {
        this.loadUsers();
        this.showSuccess('کاربر با موفقیت حذف شد.');
      },
      error: (err) => {
        const errorMsg = typeof err.error === 'string'
          ? err.error
          : 'خطا در حذف کاربر رخ داد.';
        this.showError(errorMsg);
      }
    });
  }

  showSuccess(msg: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'موفق',
      detail: msg,
      life: 5000
    });
  }

  showError(msg: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'خطا',
      detail: msg,
      life: 7000
    });
  }
}
