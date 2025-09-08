import { IUser } from '../../databases/models/User';

export interface IUserRepository {
  create(user: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
   findAllWithRoles(): Promise<IUser[]>; 
}
