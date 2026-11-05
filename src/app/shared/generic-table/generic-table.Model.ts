export interface TableColumn {
  key: string;        // نام فیلد در آبجکت (برای دسترسی ساده در صورت نیاز)
  header: string;      // متن هدر ستون
  width?: string;       // مثلاً '180px'
  align?: 'start' | 'center' | 'end'; // ترازبندی متن
}