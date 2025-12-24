import 'dotenv/config'
import { normalizeTitle } from '@/utils/text'
import { PrismaClient } from '../../generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('Iniciando migração de titleNormalized...')

	const recipes = await prisma.recipe.findMany({
		select: {
			id: true,
			title: true,
		},
	})

	console.log(`Encontradas ${recipes.length} receitas para atualizar`)

	let updated = 0
	for (const recipe of recipes) {
		const normalized = normalizeTitle(recipe.title)
		await prisma.recipe.update({
			where: { id: recipe.id },
			data: { titleNormalized: normalized },
		})
		updated++
		if (updated % 100 === 0) {
			console.log(`Atualizadas ${updated}/${recipes.length} receitas...`)
		}
	}

	console.log(`Migração concluída! ${updated} receitas atualizadas.`)
}

main()
	.catch((e) => {
		console.error('Erro na migração:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})