import { Component, forwardRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { PrimeNGConfig } from 'primeng/api';

export interface DropdownItem {
  label: string;
  value: any;
  [key: string]: any;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule],
  templateUrl: './app-dropdown.component.html',
  styleUrls: ['./app-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppDropdownComponent),
      multi: true
    }
  ]
})
export class AppDropdownComponent implements OnInit, ControlValueAccessor {
  @Input() options: DropdownItem[] = [];
  @Input() placeholder: string = 'انتخاب کنید...';
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() styleClass: string = 'w-full';
  @Input() disabled: boolean = false;
  @Input() isInvalid: boolean = false;

  filteredOptions: DropdownItem[] = [];
  selectedObject: DropdownItem | null = null;
  currentValue: any = null;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private primeng: PrimeNGConfig) {
  this.primeng.zIndex = {
    modal: 1100,
    overlay: 1100,
    menu: 1100,
    tooltip: 1100
  };
}

  ngOnInit(): void {
    this.filteredOptions = [...this.options];
  }

    ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filteredOptions = [...(this.options || [])];
      this.syncSelectedObject();
    }
  }

  // فیلتر کردن گزینه‌ها بر اساس سرچ کاربر
  search(event: AutoCompleteCompleteEvent): void {
    const query = (event.query || '').trim().toLowerCase();
    if (!query) {
      this.filteredOptions = [...this.options];
    } else {
      this.filteredOptions = this.options.filter(item => {
        const text = String(item[this.optionLabel] ?? '').toLowerCase();
        return text.includes(query);
      });
    }
  }

  // هنگام انتخاب یک آیتم از لیست
  onSelect(event: AutoCompleteSelectEvent): void {
    const selectedItem = event.value as DropdownItem;
    this.currentValue = selectedItem ? selectedItem[this.optionValue] : null;
    this.onChange(this.currentValue);
    this.onTouched();
  }

  // هنگام کلیک روی فلش دراپ‌داون
  onDropdownClick(event?: any): void {
    this.filteredOptions = [...this.options];
  }


  onBlur(): void {
    this.onTouched();
  }

  // --- پیاده‌سازی ControlValueAccessor ---
  writeValue(val: any): void {
    this.currentValue = val;
    this.syncSelectedObject();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private syncSelectedObject(): void {
    if (this.currentValue !== null && this.currentValue !== undefined && this.options?.length) {
      this.selectedObject = this.options.find(opt => opt[this.optionValue] === this.currentValue) || null;
    } else {
      this.selectedObject = null;
    }
  }
}
