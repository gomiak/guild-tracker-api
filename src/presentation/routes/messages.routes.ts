import express from 'express';
import { prisma } from '../../lib/prisma';

const router = express.Router();

// GET - Buscar todas as mensagens
router.get('/', async (req, res) => {
    try {
        const messages = await prisma.memberMessage.findMany();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
});

// POST - Criar/atualizar mensagem
router.post('/', async (req, res) => {
    try {
        const { name, message } = req.body;
        
        if (!name || !message) {
            return res.status(400).json({ error: 'Nome e mensagem são obrigatórios' });
        }

        if (message.length > 50) {
            return res.status(400).json({ error: 'Mensagem deve ter no máximo 50 caracteres' });
        }

        const memberMessage = await prisma.memberMessage.upsert({
            where: { name },
            update: { message },
            create: { name, message }
        });

        res.json(memberMessage);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar mensagem' });
    }
});

export default router;