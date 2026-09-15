import { adminService } from './adminService';
import { catalogService } from './catalogService';
import { examSessionService } from './examSessionService';
import { paymentService } from './paymentService';

export const api = {
  ...catalogService,
  ...examSessionService,
  ...paymentService,
  ...adminService,
};
