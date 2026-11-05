import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppointmentTime, CreateAppointmentTimeModel } from 'src/app/models/AppointmentTime.Model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentTimeService {
  private BaseApiUrl = 'http://localhost:5045';
  constructor(
    private http: HttpClient,
  ) { }

  CreateAppointmentTime(model:CreateAppointmentTimeModel){
    return this.http.post<void>(this.BaseApiUrl+'/api/AppointmentTime',model)
  }

  GetAllAppointmentTime():Observable<AppointmentTime[]>{
    return this.http.get<AppointmentTime[]>(this.BaseApiUrl+'/api/AppointmentTime');
  }

  GetAppointmentTimeById(id: string): Observable<AppointmentTime> {
    return this.http.get<AppointmentTime>(this.BaseApiUrl + '/api/AppointmentTime/' + id);
  }

  UpdateAppointmentTime(guid: string, model: any): Observable<AppointmentTime> {
    return this.http.put<AppointmentTime>(this.BaseApiUrl + '/api/AppointmentTime/' + guid, model);
  }

  DeleteAppointmentTime(guid: string) {
  return this.http.delete(`${this.BaseApiUrl}/api/AppointmentTime/${guid}`);
}

}
