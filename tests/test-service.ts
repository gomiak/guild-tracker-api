import { GuildRepository } from '../src/infrastructure/repositories/guild.repository';
import { GuildService } from '../src/application/services/guild.service';
import { prisma } from '../src/lib/prisma';

async function testService() {
    console.log(' Testando GuildService...\n');

    const repository = new GuildRepository();
    const service = new GuildService(repository);

    try {

        console.log('1. Gerando análise completa...');
        const analysis = await service.getFullGuildAnalysis();

        console.log(' Análise:');
        console.log(`   Nome: ${analysis.info.name}`);
        console.log(`   Online: ${analysis.info.online}`);
        console.log(`   Total: ${analysis.info.total}`);


        console.log('\n2. Verificando agrupamentos...');
        console.log('   Vocações:', Object.keys(analysis.vocations));
        console.log('   Acima do nível 400:', analysis.byLevel.above.length);
        console.log('   Abaixo do nível 400:', analysis.byLevel.below.length);

        console.log('\n3. Testando dados históricos...');
        const historical = await service.getHistoricalData();
        console.log(`    Média de nível: ${historical.averageLevel}`);
        console.log(`    Total no histórico: ${historical.totalMembers}`);
    } catch (error) {
        console.error(' Erro no teste:', error);
    }
}

testService();
