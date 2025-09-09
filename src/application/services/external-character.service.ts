import { prisma } from '../../lib/prisma';
import { externalCharacterCache } from '../../lib/cache';

interface CharacterData {
    name: string;
    level: number;
    vocation: string;
    status: string;
    lastSeen: Date | null;
    isExited: boolean;
    isExternal: boolean;
}

interface TibiaDataCharacterResponse {
    character: {
        character: {
            name: string;
            level: number;
            vocation: string;
            last_login: string;
        };
        other_characters: Array<{
            name: string;
            world: string;
            status: string;
            deleted: boolean;
            main: boolean;
            traded: boolean;
        }>;
    };
    information: {
        status: {
            http_code: number;
        };
    };
}

export class ExternalCharacterService {
    private readonly API_URL = 'https://api.tibiadata.com/v4/character';
    private readonly EXTERNAL_API_DELAY = 1000; // 1 segundo entre chamadas

    async fetchCharacterData(name: string): Promise<CharacterData | null> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(
                `${this.API_URL}/${encodeURIComponent(name)}`,
                {
                    signal: controller.signal,
                },
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Personagem não encontrado');
                }
                throw new Error(`API returned ${response.status}`);
            }

            const data: TibiaDataCharacterResponse = await response.json();
            const character = data.character.character;

            // Buscar o status real do personagem nos other_characters
            const characterStatus =
                data.character.other_characters.find(
                    (char) =>
                        char.name === character.name &&
                        char.world === 'Penumbra',
                )?.status || 'offline';

            return {
                name: character.name,
                level: character.level,
                vocation: character.vocation,
                status: characterStatus,
                lastSeen: character.last_login
                    ? new Date(character.last_login)
                    : null,
                isExited: false,
                isExternal: true,
            };
        } catch (error) {
            console.error(`Error fetching character data for ${name}:`, error);
            throw error;
        }
    }

    async addExternalCharacter(name: string): Promise<void> {
        try {
            // Verificar se já existe
            const existing = await prisma.externalCharacter.findUnique({
                where: { name },
            });

            if (existing) {
                throw new Error('Personagem já está sendo monitorado');
            }

            // Buscar dados do personagem
            const characterData = await this.fetchCharacterData(name);
            if (!characterData) {
                throw new Error('Não foi possível obter dados do personagem');
            }

            // Salvar no banco
            await prisma.externalCharacter.create({
                data: characterData,
            });

            // Limpar cache
            externalCharacterCache.flushAll();
        } catch (error) {
            console.error('Error adding external character:', error);
            throw error;
        }
    }

    async removeExternalCharacter(name: string): Promise<void> {
        try {
            await prisma.externalCharacter.delete({
                where: { name },
            });

            // Limpar cache
            externalCharacterCache.flushAll();
        } catch (error) {
            console.error('Error removing external character:', error);
            throw error;
        }
    }

    async getExternalCharacters(): Promise<CharacterData[]> {
        const CACHE_KEY = 'external-characters';
        const cached = externalCharacterCache.get<CharacterData[]>(CACHE_KEY);

        if (cached) {
            return cached;
        }

        const characters = await prisma.externalCharacter.findMany({
            orderBy: { name: 'asc' },
        });

        const result = characters.map((char) => ({
            name: char.name,
            level: char.level,
            vocation: char.vocation,
            status: char.status,
            lastSeen: char.lastSeen,
            isExited: char.isExited,
            isExternal: char.isExternal,
        }));

        externalCharacterCache.set(CACHE_KEY, result);
        return result;
    }

    async syncExternalCharacters(): Promise<void> {
        try {
            const characters = await this.getExternalCharacters();

            // Processar em lotes para não sobrecarregar a API
            const batchSize = 3;
            for (let i = 0; i < characters.length; i += batchSize) {
                const batch = characters.slice(i, i + batchSize);

                await Promise.all(
                    batch.map(async (char) => {
                        try {
                            await this.delay(this.EXTERNAL_API_DELAY);
                            await this.updateCharacterData(char.name);
                        } catch (error) {
                            console.error(
                                `Error updating character ${char.name}:`,
                                error,
                            );
                        }
                    }),
                );

                // Delay entre lotes
                if (i + batchSize < characters.length) {
                    await this.delay(2000);
                }
            }
        } catch (error) {
            console.error('Error syncing external characters:', error);
        }
    }

    private async updateCharacterData(name: string): Promise<void> {
        try {
            const characterData = await this.fetchCharacterData(name);
            if (!characterData) return;

            await prisma.externalCharacter.update({
                where: { name },
                data: {
                    level: characterData.level,
                    vocation: characterData.vocation,
                    status: characterData.status,
                    lastSeen: characterData.lastSeen,
                    updatedAt: new Date(),
                },
            });
        } catch (error) {
            console.error(`Error updating character ${name}:`, error);
        }
    }

    async markCharacterAsExited(name: string): Promise<void> {
        try {
            await prisma.externalCharacter.update({
                where: { name },
                data: { isExited: true },
            });

            externalCharacterCache.flushAll();
        } catch (error) {
            console.error('Error marking character as exited:', error);
            throw error;
        }
    }

    async unmarkCharacterAsExited(name: string): Promise<void> {
        try {
            await prisma.externalCharacter.update({
                where: { name },
                data: { isExited: false },
            });

            externalCharacterCache.flushAll();
        } catch (error) {
            console.error('Error unmarking character as exited:', error);
            throw error;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
