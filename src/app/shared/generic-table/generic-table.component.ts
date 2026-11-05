import { Component, Input, ContentChild, TemplateRef, SimpleChanges, OnChanges } from '@angular/core';
import { TableColumn } from './generic-table.Model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-generic-table',
    imports: [CommonModule],
    templateUrl: './generic-table.component.html',
    styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent<T = any> implements OnChanges {

  @Input() items: T[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() pageSize: number = 10;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() emptyText: string = 'هیچ موردی تاکنون ثبت نشده است';
  @Input() emptyHint: string = '';

  // خواندن قالب‌ها از داخل بدنه (Content Projection)
  @ContentChild('rowTemplate') contentRowTemplate?: TemplateRef<any>;
  @ContentChild('headerActions') contentHeaderActionsTemplate?: TemplateRef<any>;

  // خواندن قالب‌ها به عنوان Input مستقیم (در صورت نیاز)
  @Input() rowTemplate?: TemplateRef<any>;
  @Input() headerActionsTemplate?: TemplateRef<any>;

  currentPage: number = 1;

  // انتخاب هوشمند بین قالب ورودی یا پروجکت‌شده
  get effectiveRowTemplate(): TemplateRef<any> | null {
    return this.rowTemplate || this.contentRowTemplate || null;
  }

  get effectiveHeaderActions(): TemplateRef<any> | null {
    return this.headerActionsTemplate || this.contentHeaderActionsTemplate || null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      if (this.currentPage > this.totalPages) {
        this.currentPage = 1;
      }
    }
  }

  get pagedItems(): T[] {
    if (!this.items) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    if (!this.items || this.items.length === 0) return 0;
    return Math.ceil(this.items.length / this.pageSize);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  getRowIndex(i: number): number {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }
}
