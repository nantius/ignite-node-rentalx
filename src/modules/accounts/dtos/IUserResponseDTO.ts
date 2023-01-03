interface IUserResponseDTO {
  id: string;
  name: string;
  email: string;
  driver_license: string;
  avatar: string;
  created_at: Date;
  avatar_url(): string;
}

export { IUserResponseDTO };
