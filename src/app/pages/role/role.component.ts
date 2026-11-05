import { Component, OnInit, ViewChild } from '@angular/core';
import { RoleService } from 'src/app/Core/Services/role.service';
import { TableColumn } from 'src/app/shared/generic-table/generic-table.Model';
import { MessageService } from 'primeng/api';
import { Role } from 'src/app/models/role.model';
import { RolePermissionsComponent } from './role-permissions/role-permissions.component';
import { RoleFormComponent } from './RoleFormComponent/role-form.component';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  standalone: false
})
export class RoleComponent implements OnInit {

  roles?: Role[];

  @ViewChild('roleForm') roleForm?: RoleFormComponent;
  @ViewChild('permissionsModal') permissionsModal!: RolePermissionsComponent;

  columns: TableColumn[] = [
    { key: 'title', header: 'عنوان نقش', align: 'end' },
    { key: 'name', header: 'نام لاتین', width: '160px', align: 'center' },
    { key: 'gKey', header: 'GKey', width: '90px', align: 'center' },
    { key: 'parentRole', header: 'نقش والد', width: '150px', align: 'center' },
    { key: 'isActive', header: 'وضعیت', width: '110px', align: 'center' },
    { key: 'actions', header: 'عملیات', width: '150px', align: 'center' }
  ];

  constructor(
    private roleService: RoleService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (res) => (this.roles = res),
      error: () => this.showError('خطا در دریافت لیست نقش‌ها')
    });
  }

  openCreateModal(): void {
    this.roleForm?.openForCreate();
  }

  openUpdateModal(item: Role): void {
    this.roleForm?.openForEdit(item);
  }

  openPermissionsModal(role: Role): void {
    this.permissionsModal.open(role);
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

  onSaved(mode: 'create' | 'edit'): void {
    this.loadRoles();
    if (mode === 'create') {
      this.showSuccess('نقش جدید با موفقیت ثبت شد.');
    } else {
      this.showSuccess('نقش با موفقیت ویرایش شد.');
    }
  }

  deleteRole(item: Role): void {
    const id = item.guid || (item as any).id;
    if (!id) return;

    const confirmed = confirm(`آیا از حذف نقش «${item.title}» مطمئن هستید؟`);
    if (!confirmed) return;

    this.roleService.delete(id).subscribe({
      next: () => {
        this.loadRoles();
        this.showSuccess('نقش با موفقیت حذف شد.');
      },
      error: (err: any) => {
        const errorMsg = typeof err?.error === 'string'
          ? err.error
          : 'خطا در حذف نقش (احتمالاً کاربر یا زیرنقش وابسته دارد)';
        this.showError(errorMsg);
      }
    });
  }
}
