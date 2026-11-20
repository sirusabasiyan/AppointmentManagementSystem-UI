import { UpsertProfileDto } from 'src/app/models/profile.model';

export function editableProfile(
  source?: UpsertProfileDto
): UpsertProfileDto {
  return {
    title: source?.title?.trim() ?? '',
    location: source?.location ?? null,

    jobTitle: source?.jobTitle?.trim() || null,
    avatarUrl: source?.avatarUrl?.trim() || null,
    bio: source?.bio?.trim() || null,
    aboutMe: source?.aboutMe?.trim() || null,

    specialization: source?.specialization?.trim() || null,
    academicDegree: source?.academicDegree?.trim() || null,
    university: source?.university?.trim() || null,
    licenseNumber: source?.licenseNumber?.trim() || null,

    phone: source?.phone?.trim() || null,
    cellPhone: source?.cellPhone?.trim() || null,
    address: source?.address?.trim() || null,

    instagramId: source?.instagramId?.trim() || null,
    telegramId: source?.telegramId?.trim() || null,
    whatsAppId: source?.whatsAppId?.trim() || null
  };
}
