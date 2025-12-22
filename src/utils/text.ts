import slugify from 'slugify'

export const normalizeTitle = (title: string): string => {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove acentos
		.trim()
}

export const generateSlug = (title: string): string => {
	return slugify(title, {
		lower: true,
		strict: true,
		locale: 'pt',
	})
}
