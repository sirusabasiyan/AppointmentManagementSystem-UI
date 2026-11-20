export interface UpsertProfileDto {
  title: string;
  jobTitle: string | null;
  bio: string | null;
  aboutMe: string | null;
  avatarUrl: string | null;
  specialization: string | null;
  academicDegree: string | null;
  university: string | null;
  licenseNumber: string | null;
  address: string | null;
  phone: string | null;
  cellPhone: string | null;
  location: number | null;
  instagramId: string | null;
  telegramId: string | null;
  whatsAppId: string | null;
}

export interface ProfileDto extends UpsertProfileDto {
  userGuid: string;
}
