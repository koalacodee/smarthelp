export interface CreateDriverDto {
  username: string;
  name: string;
  email: string;
  temporaryPassword: string;
  employeeId?: string;
  jobTitle?: string;
  licensingNumber: string;
  drivingLicenseExpiry: Date;
}
