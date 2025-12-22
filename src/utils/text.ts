export const normalizeTitle = (title: string): string => {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove acentos
		.trim()
}
