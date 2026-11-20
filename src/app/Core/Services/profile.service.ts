import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileDto, UpsertProfileDto } from 'src/app/models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly url = 'http://localhost:5045/api/Profile/my-profile';
  constructor(private http: HttpClient) {}

  getMine(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(this.url);
  }

  saveMine(profile: UpsertProfileDto): Observable<ProfileDto> {
    return this.http.post<ProfileDto>(this.url, profile);
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ avatarUrl: string }>(`http://localhost:5045/api/Profile/my-profile/avatar`, formData);
  }

}