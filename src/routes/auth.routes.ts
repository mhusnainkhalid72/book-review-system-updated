import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserRepository } from '../repositories/implementations/UserRepository';
import { AuthService } from '../services/AuthService';
import { validate } from '../middlewares/validationMiddleware';
import { RegisterDTOSchema } from '../dto/request/auth/RegisterDTO';
import { LoginDTOSchema } from '../dto/request/auth/LoginDTO';
import { asyncHandler } from '../lib/asyncHandler';

const router = Router();

const users = new UserRepository();
const service = new AuthService(users);
const controller = new AuthController(service);

router.post('/register', validate(RegisterDTOSchema), asyncHandler(controller.register.bind(controller)));
router.post('/login', validate(LoginDTOSchema), asyncHandler(controller.login.bind(controller)));

export default router;
