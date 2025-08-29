import { IGuildRepository } from '../src/domain/entities/repositories/guild.repository';
import { GuildRepository } from '../src/infrastructure/repositories/guild.repository';
import { GuildService } from '../src/application/services/guild.service';
import { GuildController } from '../src/presentation/controllers/guild.controller';



const guildRepository: IGuildRepository = new GuildRepository();
const guildService = new GuildService(guildRepository);
const guildController = new GuildController(guildService);

export { guildController, guildService, guildRepository };
