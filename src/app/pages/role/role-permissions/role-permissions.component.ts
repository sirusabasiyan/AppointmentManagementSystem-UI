import { Component, EventEmitter, Output } from '@angular/core';
import { RoleService } from 'src/app/Core/Services/role.service';
import { MessageService } from 'primeng/api';
import { Role } from 'src/app/models/role.model';

export interface PermissionChildItem {
  guid: string;
  name: string;
  title: string;
  isAssigned: boolean;
}

export interface FormPermissionItem {
  guid: string;         // شناسه ماژول والد
  name: string;
  title: string;        // عنوان ماژول (مثلاً مدیریت کاربران)
  isAssigned: boolean;  // وضعیت انتخاب کل ماژول
  children: PermissionChildItem[]; // عملیات‌های فرزند (View, Create, Edit, Delete)
}

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss'],
  standalone: false
})
export class RolePermissionsComponent {
  @Output() onSaved = new EventEmitter<void>();

  role: Role | null = null;
  formItems: FormPermissionItem[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  constructor(
    private roleService: RoleService,
    private messageService: MessageService
  ) {}

  open(role: Role): void {
    const roleId = role.guid || (role as any).guid || (role as any).id;
    if (!roleId) return;

    this.role = role;
    this.isLoading = true;
    this.formItems = [];

    this.roleService.getRolePermissions(roleId).subscribe({
      next: (res: any) => {
        const rawList: any[] = res.permissions || (Array.isArray(res) ? res : []);

        const permissions = rawList.map(item => ({
          guid: item.guid || item.GUID || item.permissionGuid || item.PermissionGuid || item.id,
          name: item.name || item.Name || '',
          title: item.title || item.Title || '',
          moduleName: item.moduleName || item.ModuleName || '',
          parentPermissionGuid: item.parentPermissionGuid || item.ParentPermissionGuid || null,
          isAssigned: Boolean(item.isAssigned ?? item.IsAssigned)
        }));

        this.buildTreeFromDb(permissions);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const msg = typeof err.error === 'string' ? err.error : 'خطا در بارگذاری دسترسی‌های نقش';
        this.showError(msg);
      }
    });
  }

private buildTreeFromDb(permissions: any[]): void {
  const normalized = permissions.map(p => ({
    guid: p.guid || p.GUID || p.permissionGuid || p.PermissionGuid || p.id || '',
    name: String(p.name || p.Name || ''),
    title: String(p.title || p.Title || ''),
    parentPermissionGuid: p.parentPermissionGuid || p.ParentPermissionGuid || null,
    isAssigned: Boolean(p.isAssigned ?? p.IsAssigned)
  })).filter(p => p.guid);

  // ۱. ماژول‌های والد (آن‌هایی که نامشان به Module ختم می‌شود یا والد ندارند / والدشان System.All است)
  let modules = normalized.filter(p => 
    p.name.toLowerCase().endsWith('.module') || 
    p.name.toLowerCase() === 'system.all'
  );

  // اگر API ماژول والد نفرستاده بود، بر اساس پیشوند نام فرزندان (مثل Users.View -> پیشوند Users) ماژول‌ها را می‌سازیم
  if (modules.length === 0) {
    const prefixes = new Map<string, any>();
    for (const p of normalized) {
      const parts = p.name.split('.');
      if (parts.length > 1) {
        const modKey = parts[0];
        if (!prefixes.has(modKey)) {
          prefixes.set(modKey, {
            guid: 'mod-' + modKey,
            name: modKey + '.Module',
            title: getModulePersianTitle(modKey),
            isAssigned: false
          });
        }
      }
    }
    modules = Array.from(prefixes.values());
  }

  this.formItems = modules.map(mod => {
    // پیدا کردن فرزندان متعلق به این ماژول
    const modPrefix = mod.name.split('.')[0].toLowerCase();
    
    const children = normalized
      .filter(p => {
        const pName = p.name.toLowerCase();
        // اگر parentGuid برابر با guid والد باشد یا پیشوند نامشان یکی باشد (غیر از خود والد)
        return (p.parentPermissionGuid && p.parentPermissionGuid === mod.guid) ||
               (pName.startsWith(modPrefix + '.') && pName !== mod.name.toLowerCase());
      })
      .map(c => ({
        guid: c.guid,
        name: c.name,
        title: c.title || c.name,
        isAssigned: c.isAssigned
      }));

    const isModAssigned = mod.isAssigned || (children.length > 0 && children.every(c => c.isAssigned));

    return {
      guid: mod.guid,
      name: mod.name,
      title: mod.title || mod.name,
      isAssigned: isModAssigned,
      children: children
    };
  });

  // حذف ماژول‌هایی که فرزند ندارند (مثل System.All اگر به صورت کارت جدا نیاز نباشد)
  this.formItems = this.formItems.filter(item => item.children.length > 0);

  console.log('Final Tree Structure:', this.formItems);
}



toggleModule(form: FormPermissionItem): void {
  const newValue = !form.isAssigned;
  form.isAssigned = newValue;
  form.children.forEach(child => child.isAssigned = newValue);
}

toggleChild(form: FormPermissionItem, child: PermissionChildItem): void {
  child.isAssigned = !child.isAssigned;

  form.isAssigned = form.children.length > 0
    ? form.children.every(c => c.isAssigned)
    : false;
}


  selectAll(select: boolean): void {
    this.formItems.forEach(item => {
      item.isAssigned = select;
      item.children.forEach(child => child.isAssigned = select);
    });
  }

  get selectedCount(): number {
    // شمارش تعداد کل آیتم‌های فعال (ماژول‌ها و زیرمجموعه‌ها)
    let count = 0;
    this.formItems.forEach(item => {
      if (item.isAssigned) count++;
      item.children.forEach(c => {
        if (c.isAssigned) count++;
      });
    });
    return count;
  }

  savePermissions(): void {
    if (!this.role) return;
    const roleId = this.role.guid || (this.role as any).guid || (this.role as any).id;
    if (!roleId) return;

    // جمع‌آوری تمامی GUID های انتخاب شده (هم ماژول‌ها و هم فرزندان)
    const selectedGuids: string[] = [];
    for (const form of this.formItems) {
      if (form.isAssigned) {
        selectedGuids.push(form.guid);
      }
      for (const child of form.children) {
        if (child.isAssigned) {
          selectedGuids.push(child.guid);
        }
      }
    }

    const uniqueGuids = Array.from(new Set(selectedGuids));

    this.isSaving = true;
    this.roleService.updateRolePermissions(roleId, uniqueGuids).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.showSuccess(`دسترسی‌های نقش «${this.role?.title}» با موفقیت ذخیره شد.`);
        this.onSaved.emit();
      },
      error: (err) => {
        this.isSaving = false;
        const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'خطا در ذخیره دسترسی‌ها');
        this.showError(msg);
      }
    });
  }

  private closeModal(): void {
    const btn = document.getElementById('closePermissionsModalBtn');
    if (btn) btn.click();
  }

  private showSuccess(msg: string): void {
    this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 5000 });
  }

  private showError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 7000 });
  }
}

function getModulePersianTitle(key: string): string {
  switch (key.toLowerCase()) {
    case 'users': return 'مدیریت کاربران';
    case 'roles': return 'مدیریت نقش‌ها';
    case 'appointments': return 'مدیریت نوبت‌ها';
    case 'dashboard': return 'داشبورد';
    default: return key;
  }
}
