export interface AppointmentTime{
  GUID: string;
  title: string;
  startTime: string;
  endTime: string;
}

export interface CreateAppointmentTimeModel {
  title: string;
  startTime: string;
  endTime: string;
}

export interface UpdateAppointmentTimeDto {
  guid: string;
  title: string;
  startTime: string;
  endTime: string;
}
