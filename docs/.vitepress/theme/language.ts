export const LANGUAGE_PREFERENCE_KEY = 'cliproxyapi-docs-language'

export type SupportedLocale = 'en' | 'ru' | 'zh-CN' | 'zh-TW'

const localePaths: Record<SupportedLocale, string> = {
	en: '/',
	ru: '/ru/',
	'zh-CN': '/cn/',
	'zh-TW': '/zh-TW/',
}

export function detectPreferredLocale(languages: readonly string[]): SupportedLocale {
	for (const language of languages) {
		const normalizedLanguage = language.trim().toLowerCase().replaceAll('_', '-')

		if (normalizedLanguage === 'zh' || normalizedLanguage.startsWith('zh-')) {
			return 'zh-TW'
		}

		if (normalizedLanguage === 'ru' || normalizedLanguage.startsWith('ru-')) {
			return 'ru'
		}

		if (normalizedLanguage === 'en' || normalizedLanguage.startsWith('en-')) {
			return 'en'
		}
	}

	return 'zh-TW'
}

export function getLocalePath(locale: SupportedLocale): string {
	return localePaths[locale]
}

export function getLocaleFromPathname(pathname: string): SupportedLocale {
	if (/^\/zh-TW(?:\/|$)/i.test(pathname)) return 'zh-TW'
	if (/^\/cn(?:\/|$)/i.test(pathname)) return 'zh-CN'
	if (/^\/ru(?:\/|$)/i.test(pathname)) return 'ru'

	return 'en'
}

export function isSiteRoot(pathname: string): boolean {
	return pathname === '/' || pathname === '/index.html'
}

export function isSupportedLocale(value: string | null): value is SupportedLocale {
	return value !== null && Object.hasOwn(localePaths, value)
}
