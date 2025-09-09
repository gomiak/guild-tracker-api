import { Router } from 'express';
import { ExternalCharacterController } from '../controllers/external-character.controller';

const router = Router();
const externalCharacterController = new ExternalCharacterController();

// Middleware de autenticação (mesmo do guild)
const authenticateRequest = (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
};

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateRequest);

// Rotas para personagens externos
router.post('/add', (req, res) =>
    externalCharacterController.addExternalCharacter(req, res),
);
router.delete('/remove/:name', (req, res) =>
    externalCharacterController.removeExternalCharacter(req, res),
);
router.get('/list', (req, res) =>
    externalCharacterController.getExternalCharacters(req, res),
);
router.post('/mark-exited/:name', (req, res) =>
    externalCharacterController.markAsExited(req, res),
);
router.post('/unmark-exited/:name', (req, res) =>
    externalCharacterController.unmarkAsExited(req, res),
);
router.post('/sync', (req, res) =>
    externalCharacterController.syncExternalCharacters(req, res),
);
router.get('/combined-data', (req, res) =>
    externalCharacterController.getCombinedData(req, res),
);

export default router;
