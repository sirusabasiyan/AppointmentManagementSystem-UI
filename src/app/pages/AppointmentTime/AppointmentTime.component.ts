import { Component, OnInit, ViewChild } from '@angular/core';
import { AppointmentTimeService } from '../../../app/Core/Services/AppointmentTime.service';
import { AppointmentTime } from '../../models/AppointmentTime.Model';
import { TableColumn } from 'src/app/shared/generic-table/generic-table.Model';
import { MessageService } from 'primeng/api';
import { AppointmentTimeFormComponent } from './AppointmentTimeForm/appointment-time-form.component';

@Component({
  selector: 'AppointmentTime',
  templateUrl: './AppointmentTime.component.html',
  styleUrls: ['./AppointmentTime.component.scss'],
  standalone: false
})
export class AppointmentTimeComponent implements OnInit {

  @ViewChild('appointmentTimeForm') appointmentTimeForm?: AppointmentTimeFormComponent;

  AppointmentTimes?: AppointmentTime[];

  columns: TableColumn[] = [
    { key: 'title', header: 'عنوان بازه', align: 'end' },
    { key: 'startTime', header: 'ساعت شروع', width: '180px', align: 'center' },
    { key: 'endTime', header: 'ساعت پایان', width: '180px', align: 'center' },
    { key: 'actions', header: 'عملیات', width: '130px', align: 'center' },
  ];

  constructor(
    private AppointmentTimeService: AppointmentTimeService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAppointmentTimes();
  }

  loadAppointmentTimes(): void {
    this.AppointmentTimeService.GetAllAppointmentTime().subscribe({
      next: (response) => this.AppointmentTimes = response
    });
  }

  // جدید:
  openCreateModal(): void {
    this.appointmentTimeForm?.openForCreate();
  }

  // جدید:
  openEditModal(item: AppointmentTime): void {
    this.appointmentTimeForm?.openForEdit(item);
  }

  onSaved(mode: 'create' | 'edit'): void {
    this.loadAppointmentTimes();
    if (mode === 'create') this.showSuccess('بازه زمانی با موفقیت ثبت شد');
    else this.showSuccess('بازه زمانی با موفقیت ویرایش شد');
  }

  showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 10000 });
  }

  showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 10000 });
  }

  deleteAppointmentTime(item: any): void {
    const id = item.guid || item.GUID || item.id;
    if (!id) return;

    const confirmed = confirm(`آیا از حذف بازه «${item.title}» مطمئن هستید؟`);
    if (!confirmed) return;

    this.AppointmentTimeService.DeleteAppointmentTime(id).subscribe({
      next: () => {
        this.loadAppointmentTimes();
        this.showSuccess('بازه زمانی با موفقیت حذف شد');
      },
      error: () => this.showError('خطا در حذف بازه زمانی')
    });
  }
}
