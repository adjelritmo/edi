const db = require('../models/db')

const Submission = require('../models/Submission')

async function migrateDimensions() {

    try {
        console.log('🚀 Iniciando migração de dimensões...')

        // Buscar todas as submissões com valores nas colunas fixas
        const submissions = await Submission.findAll({

            where: {
                // Pelo menos uma dimensão preenchida
                [db.Sequelize.Op.or]: [
                    { leadership: { [db.Sequelize.Op.not]: null } },
                    { innovation: { [db.Sequelize.Op.not]: null } },
                    { collaboration: { [db.Sequelize.Op.not]: null } },
                    { engagement: { [db.Sequelize.Op.not]: null } },
                    { skills: { [db.Sequelize.Op.not]: null } },
                    { motivation: { [db.Sequelize.Op.not]: null } },
                    { others: { [db.Sequelize.Op.not]: null } }
                ]
            }
        })

        console.log(`📊 Encontradas ${submissions.length} submissões para migrar`)

        let atualizadas = 0
        let ignoradas = 0

        for (const submission of submissions) {
            // Verificar se já tem dimensionsValues (evitar duplicar)
            if (submission.dimensionsValues && Object.keys(submission.dimensionsValues).length > 0) {
                console.log(`⏭️  Submissão ${submission.id} já migrada, ignorando...`)
                ignoradas++
                continue
            }

            // Construir objeto com MAPEAMENTO das dimensões
            const dimensionsValues = {}

            // Mapeamento: Antigo -> Novo
            // skills -> awareness
            if (submission.skills !== null) {
                dimensionsValues.awareness = submission.skills
            }

            // innovation -> knowledge
            if (submission.innovation !== null) {
                dimensionsValues.knowledge = submission.innovation
            }

            // collaboration -> attitude (assumindo que "impact" era collaboration?)
            if (submission.collaboration !== null) {
                dimensionsValues.attitude = submission.collaboration
            }

            // motivation -> motivation (mantém o mesmo)
            if (submission.motivation !== null) {
                dimensionsValues.motivation = submission.motivation
            }

            // leadership -> competence
            if (submission.leadership !== null) {
                dimensionsValues.competence = submission.leadership
            }
            // engagement -> barriers
            if (submission.engagement !== null) {
                dimensionsValues.barriers = submission.engagement
            }

            // "others" não tem mapeamento definido - ignorar ou manter?
            // Se quiser manter como está:
            if (submission.others !== null) {
                dimensionsValues.others = submission.others
            }

            // Só atualiza se houver alguma dimensão
            if (Object.keys(dimensionsValues).length > 0) {
                await submission.update({ dimensionsValues })
                console.log(`✅ Submissão ${submission.id} migrada:`, dimensionsValues)
                atualizadas++
            } else {
                ignoradas++
            }
        }

        console.log('\n📈 Resumo da Migração:')
        console.log(`   - Total processadas: ${submissions.length}`)
        console.log(`   - Atualizadas: ${atualizadas}`)
        console.log(`   - Ignoradas (já migradas ou vazias): ${ignoradas}`)
        console.log('✨ Migração concluída!')

    } catch (error) {
        console.error('❌ Erro na migração:', error)
    }
}

// Executar
migrateDimensions()