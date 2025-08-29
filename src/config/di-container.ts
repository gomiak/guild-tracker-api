import { IGuildRepository } from '../domain/entities/repositories/guild.repository';
import { GuildRepository } from '../infrastructure/repositories/guild.repository';
import { GuildService } from '../application/services/guild.service';
import { GuildController } from '../presentation/controllers/guild.controller';

const guildRepository: IGuildRepository = new GuildRepository();
const guildService = new GuildService(guildRepository);
const guildController = new GuildController(guildService);

export { guildController, guildService, guildRepository };
