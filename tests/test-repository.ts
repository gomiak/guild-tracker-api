import { GuildRepository } from '../src/infrastructure/repositories/guild.repository';
import { prisma } from '../src/lib/prisma';

async function testRepository() {
    console.log(' Testando GuildRepository...\n');

    const repository = new GuildRepository();

    try {
        console.log('1. Buscando dados da API TibiaData...');
        const guildData = await repository.getGuildData();

        console.log(' Dados obtidos:');
        console.log(`   Nome: ${guildData.name}`);
        console.log(`   Membros: ${guildData.members.length}`);
        console.log(`   Online: ${guildData.playersOnline}`);
        console.log(`   Offline: ${guildData.playersOffline}`);

        console.log('\n2. Verificando banco de dados...');

        const dbMembers = await prisma.guildMember.findMany();
        console.log(`    Membros no banco: ${dbMembers.length}`);

        if (dbMembers.length > 0) {
            console.log('   Primeiro membro:', {
                name: dbMembers[0].name,
                level: dbMembers[0].level,
                vocation: dbMembers[0].vocation,
            });
        }

        console.log('\n3. Testando métodos do banco...');
        const onlineMembers = await repository.getOnlineMembersFromDatabase();
        console.log(`   Online no banco: ${onlineMembers.length}`);
    } catch (error) {
        console.error(' Erro no teste:', error);
    }
}

testRepository();
